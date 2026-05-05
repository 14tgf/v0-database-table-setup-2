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

    const { withdrawal_id, action, userId } = body;

    if (!withdrawal_id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = sql();

    // Get withdrawal details
    const withdrawalResult = await db`SELECT * FROM withdrawals WHERE id = ${withdrawal_id}`;
    if (!withdrawalResult || withdrawalResult.length === 0) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }

    const withdrawal = withdrawalResult[0];

    if (action === 'approve') {
      // Get user's current balance
      const userResult = await db`
        SELECT wallet_balance FROM users WHERE id = ${withdrawal.user_id}
      `;

      const currentBalance = userResult?.length > 0 ? parseFloat(userResult[0].wallet_balance || 0) : 0;

      // Check if user still has sufficient balance
      if (currentBalance < withdrawal.amount) {
        return NextResponse.json(
          { error: 'Insufficient balance to approve withdrawal' },
          { status: 400 }
        );
      }

      const newBalance = currentBalance - parseFloat(withdrawal.amount);

      // Update user wallet (deduct amount)
      await db`
        UPDATE users 
        SET wallet_balance = ${newBalance}, updated_at = NOW()
        WHERE id = ${withdrawal.user_id}
      `;

      // Update withdrawal status
      await db`
        UPDATE withdrawals 
        SET status = 'approved', approved_by = ${userId || null}, approved_at = NOW(), updated_at = NOW()
        WHERE id = ${withdrawal_id}
      `;

      // Create wallet transaction log
      await db`
        INSERT INTO wallet_transactions (user_id, transaction_type, amount, old_balance, new_balance, related_id, related_type, description)
        VALUES (${withdrawal.user_id}, 'withdrawal', ${withdrawal.amount}, ${currentBalance}, ${newBalance}, ${withdrawal_id}, 'withdrawal', 'Withdrawal approved')
      `;

      return NextResponse.json({
        success: true,
        message: 'Withdrawal approved and wallet debited',
        newBalance,
      });
    } else {
      // Reject withdrawal
      await db`
        UPDATE withdrawals 
        SET status = 'rejected', approved_by = ${userId || null}, approved_at = NOW(), updated_at = NOW()
        WHERE id = ${withdrawal_id}
      `;

      return NextResponse.json({
        success: true,
        message: 'Withdrawal rejected',
      });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error approving withdrawal:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
