import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    const { deposit_id, action, userId } = body;

    if (!deposit_id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = sql();

    // Get deposit details
    const depositResult = await db`SELECT * FROM deposits WHERE id = ${deposit_id}`;
    if (!depositResult || depositResult.length === 0) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    const deposit = depositResult[0];

    if (action === 'approve') {
      const userResult = await db`SELECT wallet_balance FROM users WHERE id = ${deposit.user_id}`;
      const currentBalance = userResult?.length > 0 ? parseFloat(userResult[0].wallet_balance || 0) : 0;
      const newBalance = currentBalance + parseFloat(deposit.amount);

      await db`UPDATE users SET wallet_balance = ${newBalance}, updated_at = NOW() WHERE id = ${deposit.user_id}`;
      await db`UPDATE deposits SET status = 'approved', approved_by = ${userId || null}, approved_at = NOW(), updated_at = NOW() WHERE id = ${deposit_id}`;
      await db`INSERT INTO wallet_transactions (user_id, transaction_type, amount, old_balance, new_balance, related_id, related_type, description) VALUES (${deposit.user_id}, 'deposit', ${deposit.amount}, ${currentBalance}, ${newBalance}, ${deposit_id}, 'deposit', 'Deposit approved')`;

      return NextResponse.json({ success: true, message: 'Deposit approved', newBalance });
    } else {
      await db`UPDATE deposits SET status = 'rejected', approved_by = ${userId || null}, approved_at = NOW(), updated_at = NOW() WHERE id = ${deposit_id}`;
      return NextResponse.json({ success: true, message: 'Deposit rejected' });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error approving deposit:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
