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
      console.log('[v0] DEPOSITS API - User ID:', userId);
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
    console.log('[v0] DEPOSITS API - Inserting into database');
    const result = await sql`
      INSERT INTO deposits (user_id, method_name, amount, tx_hash, proof_upload, note, status)
      VALUES (${userId}, ${method_name}, ${amount}, ${tx_hash}, ${proof_upload}, ${note}, 'pending')
      RETURNING id, status, created_at
    `;

    console.log('[v0] DEPOSITS API - SQL result type:', typeof result, 'Is array:', Array.isArray(result));
    console.log('[v0] DEPOSITS API - SQL result:', result);

    // neon() returns array directly, not {rows: [...]}
    const depositRecord = Array.isArray(result) && result.length > 0 ? result[0] : null;
    
    console.log('[v0] DEPOSITS API - Deposit record:', depositRecord);

    if (!depositRecord) {
      console.error('[v0] DEPOSITS API - No deposit record returned', { result });
      throw new Error('Failed to create deposit record - no data returned');
    }

    return NextResponse.json({
      success: true,
      deposit: depositRecord,
      message: 'Deposit submitted successfully. Pending admin approval.',
    });
  } catch (error) {
    console.error('[v0] DEPOSITS API - Error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Deposit submission failed';
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
