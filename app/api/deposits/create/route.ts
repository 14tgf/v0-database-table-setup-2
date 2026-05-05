import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get('auth_token')?.value;
    if (!cookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(cookie, JWT_SECRET);
    const userId = payload.sub as string;

    const body = await request.json();
    const { method_name, amount, tx_hash, proof_upload, note } = body;

    console.log('[v0] Deposit submission:', { userId, method_name, amount });

    // Validate input
    if (!method_name || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid deposit data' },
        { status: 400 }
      );
    }

    // Create deposit record - status starts as 'pending'
    const result = await sql`
      INSERT INTO deposits (user_id, method_name, amount, tx_hash, proof_upload, note, status)
      VALUES (${userId}, ${method_name}, ${amount}, ${tx_hash}, ${proof_upload}, ${note}, 'pending')
      RETURNING id, status, created_at
    `;

    console.log('[v0] Deposit created:', result.rows[0]);

    return NextResponse.json({
      success: true,
      deposit: result.rows[0],
      message: 'Deposit submitted successfully. Pending admin approval.',
    });
  } catch (error) {
    console.error('[v0] Deposit submission error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Deposit submission failed' },
      { status: 500 }
    );
  }
}
