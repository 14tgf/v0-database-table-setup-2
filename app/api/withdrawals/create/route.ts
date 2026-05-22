import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-in-production');

export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get('auth_token')?.value;
    console.log('[v0] Withdrawal API - Auth token present:', !!cookie);
    
    if (!cookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let userId: string;
    try {
      const { payload } = await jwtVerify(cookie, JWT_SECRET);
      userId = payload.sub as string;
      console.log('[v0] Withdrawal API - User ID verified:', userId);
    } catch (jwtError) {
      console.error('[v0] Withdrawal API - JWT verification failed:', jwtError);
      return NextResponse.json({ error: 'Invalid or expired session. Please log in again.' }, { status: 401 });
    }

    const body = await request.json();
    const { method_name, amount, destination_address, destination_bank_details, note } = body;

    console.log('[v0] Withdrawal submission:', { userId, method_name, amount });

    // Validate input
    if (!method_name || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid withdrawal data' },
        { status: 400 }
      );
    }

    const db = sql();

    // Check user's balance
    const userResult = await db`
      SELECT wallet_balance FROM users WHERE id = ${userId}
    `;

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const balance = parseFloat(userResult[0].wallet_balance || 0);

    if (balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create withdrawal record - status starts as 'pending'
    const result = await db`
      INSERT INTO withdrawals (user_id, method_name, amount, destination_address, destination_bank_details, note, status)
      VALUES (${userId}, ${method_name}, ${amount}, ${destination_address}, ${destination_bank_details}, ${note}, 'pending')
      RETURNING id, status, created_at
    `;

    console.log('[v0] Withdrawal created:', result[0]);

    // Create a pending transaction record immediately so it shows in user's history
    try {
      console.log('[v0] Creating pending transaction record for withdrawal');
      const currentBalance = balance;
      
      await db`
        INSERT INTO wallet_transactions (id, user_id, transaction_type, amount, old_balance, new_balance, related_id, related_type, description, status)
        VALUES (gen_random_uuid(), ${userId}, 'withdrawal', ${amount}, ${currentBalance}, ${currentBalance}, ${result[0].id}, 'withdrawal', 'Withdrawal pending approval', 'pending')
      `;
      console.log('[v0] Pending transaction created for withdrawal');
    } catch (txError) {
      console.warn('[v0] Failed to create transaction (non-critical):', txError);
    }

    return NextResponse.json({
      success: true,
      withdrawal: result[0],
      message: 'Withdrawal submitted successfully. Pending admin approval.',
    });
  } catch (error) {
    console.error('[v0] Withdrawal submission error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Withdrawal submission failed' },
      { status: 500 }
    );
  }
}
