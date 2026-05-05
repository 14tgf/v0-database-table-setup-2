import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-in-production');

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
      console.log('[v0] DEPOSITS API - User ID from JWT:', userId, 'Type:', typeof userId);
      
      if (!userId) {
        throw new Error('No user ID in JWT payload (missing "sub")');
      }
    } catch (jwtError) {
      console.error('[v0] DEPOSITS API - JWT verification failed:', jwtError);
      return NextResponse.json({ error: 'Invalid or expired session token' }, { status: 401 });
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('[v0] DEPOSITS API - Failed to parse JSON:', e);
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

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

    // SIMPLE INSERT - No user check, just insert directly
    let insertResult;
    try {
      console.log('[v0] DEPOSITS API - About to execute INSERT query with params:', { userId, method_name, amount });
      
      // Remove explicit type casting - neon handles this
      insertResult = await sql`
        INSERT INTO deposits (user_id, method_name, amount, tx_hash, proof_upload, note, status)
        VALUES (${userId}, ${method_name}, ${amount}, ${tx_hash}, ${proof_upload}, ${note}, 'pending')
        RETURNING id, user_id, method_name, amount, status, created_at
      `;
      
      console.log('[v0] DEPOSITS API - INSERT query executed');
      console.log('[v0] DEPOSITS API - Raw result type:', typeof insertResult);
      console.log('[v0] DEPOSITS API - Raw result is array:', Array.isArray(insertResult));
      console.log('[v0] DEPOSITS API - Raw result length:', Array.isArray(insertResult) ? insertResult.length : 'N/A');
      console.log('[v0] DEPOSITS API - Raw result:', JSON.stringify(insertResult));
      
    } catch (sqlError) {
      const errorDetails = {
        message: sqlError instanceof Error ? sqlError.message : String(sqlError),
        code: (sqlError as any)?.code,
        constraint: (sqlError as any)?.constraint,
        detail: (sqlError as any)?.detail,
      };
      console.error('[v0] DEPOSITS API - SQL INSERT ERROR:', errorDetails);
      return NextResponse.json(
        { 
          error: `Database error: ${errorDetails.message}`,
          details: errorDetails,
        },
        { status: 500 }
      );
    }

    // Handle result - neon returns array directly
    if (!insertResult) {
      console.error('[v0] DEPOSITS API - Query returned null/undefined');
      return NextResponse.json({ error: 'Database query returned no result' }, { status: 500 });
    }

    if (!Array.isArray(insertResult)) {
      console.error('[v0] DEPOSITS API - Query result is not an array:', typeof insertResult);
      return NextResponse.json({ error: 'Unexpected database response format' }, { status: 500 });
    }

    if (insertResult.length === 0) {
      console.error('[v0] DEPOSITS API - INSERT returned empty array (no rows)');
      return NextResponse.json({ error: 'Database INSERT did not return any rows' }, { status: 500 });
    }

    const depositRecord = insertResult[0];
    console.log('[v0] DEPOSITS API - SUCCESS - Deposit created:', depositRecord);

    return NextResponse.json({
      success: true,
      deposit: depositRecord,
      message: 'Deposit submitted successfully. Pending admin approval.',
    }, { status: 200 });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[v0] DEPOSITS API - CATCH BLOCK ERROR:', {
      message: errorMsg,
      stack: errorStack,
    });
    
    return NextResponse.json(
      { 
        error: `Server error: ${errorMsg}`,
      },
      { status: 500 }
    );
  }
}
