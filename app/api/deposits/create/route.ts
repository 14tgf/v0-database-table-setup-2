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
  try {
    console.log('[v0] DEPOSITS API - Request received');
    
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

    // Parse request body
    const body = await request.json();
    const { method_name, amount, tx_hash, proof_upload, note } = body;

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
      
      const result = await sql`
        INSERT INTO deposits (user_id, method_name, amount, tx_hash, proof_upload, note, status)
        VALUES (${userId}, ${method_name}, ${amount}, ${tx_hash}, ${proof_upload}, ${note}, 'pending')
        RETURNING id, user_id, method_name, amount, status, created_at
      `;
      
      console.log('[v0] DEPOSITS API - Query executed successfully');
      console.log('[v0] DEPOSITS API - Result:', result);

      if (!result || !Array.isArray(result) || result.length === 0) {
        console.error('[v0] DEPOSITS API - Invalid result:', result);
        throw new Error('Failed to create deposit - no rows returned');
      }

      const depositRecord = result[0];
      console.log('[v0] DEPOSITS API - Deposit created:', depositRecord.id);

      // Send confirmation email to user (non-blocking)
      const userQuery = await sql`SELECT email FROM users WHERE id = ${userId}`;
      const userEmail = userQuery?.[0]?.email;
      if (userEmail) {
        sendEmail({
          to: userEmail,
          subject: 'Deposit Received - Pending Approval',
          html: depositSubmittedTemplate(String(amount), method_name),
        }).catch(err => console.error('[v0] Failed to send deposit email:', err));
      }

      // Notify admin (non-blocking)
      sendEmailToAdmin({
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
        ),
      }).catch(err => console.error('[v0] Failed to send admin notification:', err));

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
    return NextResponse.json(
      { error: `Server error: ${errorMsg}` },
      { status: 500 }
    );
  }
}
