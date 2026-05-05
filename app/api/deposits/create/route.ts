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
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify JWT
    let userId: string;
    try {
      const { payload } = await jwtVerify(cookie, JWT_SECRET);
      userId = payload.sub as string;
      console.log('[v0] DEPOSITS API - JWT payload:', payload);
      console.log('[v0] DEPOSITS API - User ID from JWT:', userId, 'Type:', typeof userId);
      
      if (!userId) {
        throw new Error('No user ID in JWT payload (missing "sub")');
      }
    } catch (jwtError) {
      console.error('[v0] DEPOSITS API - JWT verification failed:', jwtError);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const body = await request.json();
    const { method_name, amount, tx_hash, proof_upload, note } = body;

    console.log('[v0] DEPOSITS API - Deposit data:', { userId, method_name, amount, tx_hash });

    // Validate input
    if (!method_name || !amount || amount <= 0) {
      console.error('[v0] DEPOSITS API - Invalid deposit data:', { method_name, amount });
      return NextResponse.json(
        { error: 'Invalid deposit data. Method and amount are required.' },
        { status: 400 }
      );
    }

    // Create deposit record - status starts as 'pending'
    console.log('[v0] DEPOSITS API - Inserting into database with userId:', userId);
    
    // First verify the user exists
    try {
      const userCheck = await sql`SELECT id FROM users WHERE id = ${userId}`;
      console.log('[v0] DEPOSITS API - User check result:', userCheck);
      
      if (!userCheck || (Array.isArray(userCheck) && userCheck.length === 0)) {
        console.error('[v0] DEPOSITS API - User not found in database:', userId);
        return NextResponse.json(
          { error: 'User not found. Please login again.' },
          { status: 401 }
        );
      }
    } catch (userCheckError) {
      console.error('[v0] DEPOSITS API - User check SQL error:', userCheckError);
    }
    
    let result;
    let sqlErrorDetails = null;
    try {
      result = await sql`
        INSERT INTO deposits (user_id, method_name, amount, tx_hash, proof_upload, note, status)
        VALUES (${userId}, ${method_name}, ${amount}, ${tx_hash}, ${proof_upload}, ${note}, 'pending')
        RETURNING id, status, created_at
      `;
      console.log('[v0] DEPOSITS API - SQL execution successful');
    } catch (sqlError) {
      sqlErrorDetails = {
        message: sqlError instanceof Error ? sqlError.message : String(sqlError),
        name: sqlError instanceof Error ? sqlError.name : 'Unknown',
        stack: sqlError instanceof Error ? sqlError.stack : undefined,
      };
      console.error('[v0] DEPOSITS API - SQL Error Details:', sqlErrorDetails);
      throw sqlError;
    }

    console.log('[v0] DEPOSITS API - SQL result type:', typeof result, 'Is array:', Array.isArray(result));
    console.log('[v0] DEPOSITS API - SQL result length:', Array.isArray(result) ? result.length : 'N/A');
    console.log('[v0] DEPOSITS API - SQL result:', JSON.stringify(result));

    // neon() returns array directly, not {rows: [...]}
    const depositRecord = Array.isArray(result) && result.length > 0 ? result[0] : null;
    
    console.log('[v0] DEPOSITS API - Deposit record:', depositRecord);

    if (!depositRecord) {
      console.error('[v0] DEPOSITS API - No deposit record returned', { 
        result, 
        userId, 
        method_name, 
        amount,
        resultLength: Array.isArray(result) ? result.length : 'not an array',
        resultType: typeof result,
      });
      throw new Error(`Deposit INSERT failed: No data returned from database. Result: ${JSON.stringify(result)}`);
    }

    console.log('[v0] DEPOSITS API - Deposit created successfully with ID:', depositRecord.id);

    return NextResponse.json({
      success: true,
      deposit: depositRecord,
      message: 'Deposit submitted successfully. Pending admin approval.',
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Deposit submission failed';
    const errorDetails = error instanceof Error ? {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    } : { message: String(error) };
    
    console.error('[v0] DEPOSITS API - Full Error:', errorDetails);
    
    return NextResponse.json(
      { 
        error: errorMsg,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
      },
      { status: 500 }
    );
  }
}
