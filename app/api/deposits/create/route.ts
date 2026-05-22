import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { jwtVerify } from 'jose';
import { sendEmail, sendEmailToAdmin } from '@/lib/email/resend';
import { depositSubmittedTemplate, adminAlertTemplate } from '@/lib/email/templates';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-in-production');

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  return neon(process.env.DATABASE_URL);
}

export async function POST(request: NextRequest) {
  let body: any = null;
  
  try {
    console.log('[v0] DEPOSITS API - Request received');
    console.log('[v0] DEPOSITS API - Request method:', request.method);
    console.log('[v0] DEPOSITS API - Content-Type:', request.headers.get('content-type'));
    
    // Check for authentication
    const cookie = request.cookies.get('auth_token')?.value;
    console.log('[v0] DEPOSITS API - Auth token present:', !!cookie);

    if (!cookie) {
      console.error('[v0] DEPOSITS API - No auth token found');
      return NextResponse.json({ error: 'Not authenticated. Please login first.' }, { status: 401 });
    }

    // Verify JWT
    let userId: string;
    try {
      const { payload } = await jwtVerify(cookie, JWT_SECRET);
      userId = payload.sub as string;
      console.log('[v0] DEPOSITS API - User ID from JWT:', userId);
      
      if (!userId) {
        throw new Error('No user ID in JWT payload');
      }
    } catch (jwtError) {
      console.error('[v0] DEPOSITS API - JWT verification failed:', jwtError);
      return NextResponse.json({ error: 'Invalid or expired session token' }, { status: 401 });
    }

    // Parse request body - ONLY ONCE
    console.log('[v0] DEPOSITS API - Parsing request body');
    try {
      body = await request.json();
      console.log('[v0] DEPOSITS API - Body parsed successfully');
    } catch (parseError) {
      console.error('[v0] DEPOSITS API - Failed to parse JSON body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body - must be valid JSON', details: String(parseError) },
        { status: 400 }
      );
    }

    if (!body) {
      console.error('[v0] DEPOSITS API - Request body is empty');
      return NextResponse.json(
        { error: 'Request body is empty' },
        { status: 400 }
      );
    }

    console.log('[v0] DEPOSITS API - Body keys:', Object.keys(body));
    
    const { method_name, amount, tx_hash, proof_image, note } = body;

    console.log('[v0] DEPOSITS API - Extracted fields:', {
      method_name,
      amount,
      has_tx_hash: !!tx_hash,
      has_proof_image: !!proof_image,
      note,
    });

    // Validate input
    if (!method_name || !amount || amount <= 0) {
      console.error('[v0] DEPOSITS API - Invalid deposit data:', { method_name, amount });
      return NextResponse.json(
        { error: 'Invalid deposit data. Method name and amount (>0) are required.' },
        { status: 400 }
      );
    }

    console.log('[v0] DEPOSITS API - Validated deposit:', { userId, method_name, amount });

    // Get database connection
    const sql = getSql();

    // Insert deposit
    try {
      console.log('[v0] DEPOSITS API - Executing INSERT query');
      
      // Store base64 image data if provided
      let proofData = null;
      if (proof_image && proof_image.data) {
        console.log('[v0] DEPOSITS API - Storing proof image data, size:', proof_image.data.length, 'bytes');
        proofData = JSON.stringify({
          filename: proof_image.filename || 'proof.jpg',
          type: proof_image.type || 'image/jpeg',
          data: proof_image.data,
        });
      }
      
      const result = await sql`
        INSERT INTO deposits (user_id, method_name, amount, tx_hash, proof_upload, note, status)
        VALUES (${userId}, ${method_name}, ${amount}, ${tx_hash || null}, ${proofData}, ${note}, 'pending')
        RETURNING id, user_id, method_name, amount, status, created_at
      `;
      
      console.log('[v0] DEPOSITS API - Query executed successfully');

      if (!result || !Array.isArray(result) || result.length === 0) {
        console.error('[v0] DEPOSITS API - Invalid result:', result);
        throw new Error('Failed to create deposit - no rows returned');
      }

      const depositRecord = result[0];
      console.log('[v0] DEPOSITS API - Deposit created:', depositRecord.id);

      // Create a pending transaction record immediately so it shows in user's history
      try {
        console.log('[v0] DEPOSITS API - Creating pending transaction record');
        await sql`
          INSERT INTO wallet_transactions (id, user_id, transaction_type, amount, old_balance, new_balance, related_id, related_type, description, status)
          VALUES (gen_random_uuid(), ${userId}, 'deposit', ${amount}, 0, 0, ${depositRecord.id}, 'deposit', 'Deposit pending approval', 'pending')
        `;
        console.log('[v0] DEPOSITS API - Pending transaction created');
      } catch (txError) {
        console.warn('[v0] DEPOSITS API - Failed to create transaction (non-critical):', txError);
      }

      // Send confirmation email to user (non-blocking)
      const userQuery = await sql`SELECT email FROM users WHERE id = ${userId}`;
      const userEmail = userQuery?.[0]?.email;
      console.log('[v0] DEPOSITS API - User email:', userEmail);
      
      if (userEmail) {
        console.log('[v0] DEPOSITS API - Attempting to send user email');
        await sendEmail({
          to: userEmail,
          subject: 'Deposit Received - Pending Approval',
          html: depositSubmittedTemplate(String(amount), method_name),
        }).then(result => {
          console.log('[v0] DEPOSITS API - User email result:', result);
        }).catch(err => console.error('[v0] Failed to send deposit email:', err));
      } else {
        console.warn('[v0] DEPOSITS API - No user email found for user:', userId);
      }

      // Notify admin with base64 image embedded in email (non-blocking)
      console.log('[v0] DEPOSITS API - Attempting to send admin email');
      
      let proofHTMLContent = '<p><strong>Proof Upload:</strong> No proof attached</p>';
      if (proof_image && proof_image.data) {
        const dataURI = `data:${proof_image.type || 'image/jpeg'};base64,${proof_image.data}`;
        proofHTMLContent = `
          <p><strong>Proof Upload:</strong></p>
          <img src="${dataURI}" style="max-width: 400px; border: 1px solid #e0e0e0; border-radius: 4px;" alt="Deposit Proof" />
        `;
      }
      
      const adminDetailsHTML = `
        <p><strong>Amount:</strong> $${amount}</p>
        <p><strong>Method:</strong> ${method_name}</p>
        <p><strong>User ID:</strong> ${userId}</p>
        <p><strong>Status:</strong> Pending</p>
        <p><strong>Note:</strong> ${note || 'No notes'}</p>
        ${proofHTMLContent}
      `;
      
      await sendEmailToAdmin({
        subject: 'New Deposit Submission',
        html: adminAlertTemplate(
          'New Deposit Submission',
          'A new deposit has been submitted and requires review.',
          {
            'Amount': `$${amount}`,
            'Method': method_name,
            'User ID': userId,
            'Status': 'Pending',
          }
        ) + adminDetailsHTML,
      }).then(result => {
        console.log('[v0] DEPOSITS API - Admin email result:', result);
      }).catch(err => console.error('[v0] Failed to send admin notification:', err));

      console.log('[v0] DEPOSITS API - Deposit submission complete');
      return NextResponse.json({
        success: true,
        deposit: depositRecord,
        message: 'Deposit submitted successfully. Pending admin approval.',
      }, { status: 200 });
      
    } catch (sqlError) {
      const errorMsg = sqlError instanceof Error ? sqlError.message : String(sqlError);
      console.error('[v0] DEPOSITS API - Database error:', errorMsg);
      return NextResponse.json(
        { error: `Database error: ${errorMsg}` },
        { status: 500 }
      );
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[v0] DEPOSITS API - Error:', errorMsg);
    console.error('[v0] DEPOSITS API - Error stack:', error instanceof Error ? error.stack : '');
    return NextResponse.json(
      { error: `Server error: ${errorMsg}` },
      { status: 500 }
    );
  }
}
