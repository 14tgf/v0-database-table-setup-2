import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get('admin_token')?.value;
    if (!cookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(cookie, JWT_SECRET);
    const adminId = payload.sub as string;

    const body = await request.json();
    const { withdrawal_id, action } = body;

    if (!withdrawal_id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    console.log('[v0] Admin withdrawal action:', { withdrawal_id, action, adminId });

    // Get withdrawal details
    const withdrawalResult = await sql`
      SELECT * FROM withdrawals WHERE id = ${withdrawal_id}
    `;

    if (withdrawalResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    const withdrawal = withdrawalResult.rows[0];

    if (action === 'approve') {
      // Get user's current balance
      const userResult = await sql`
        SELECT wallet_balance FROM users WHERE id = ${withdrawal.user_id}
      `;

      const currentBalance = parseFloat(userResult.rows[0]?.wallet_balance || 0);

      // Check if user still has sufficient balance
      if (currentBalance < withdrawal.amount) {
        return NextResponse.json(
          { error: 'Insufficient balance to approve withdrawal' },
          { status: 400 }
        );
      }

      const newBalance = currentBalance - parseFloat(withdrawal.amount);

      // Update user wallet (deduct amount)
      await sql`
        UPDATE users 
        SET wallet_balance = ${newBalance}, updated_at = NOW()
        WHERE id = ${withdrawal.user_id}
      `;

      // Update withdrawal status
      await sql`
        UPDATE withdrawals 
        SET status = 'approved', approved_by = ${adminId}, approved_at = NOW(), updated_at = NOW()
        WHERE id = ${withdrawal_id}
      `;

      // Create wallet transaction log
      await sql`
        INSERT INTO wallet_transactions (user_id, transaction_type, amount, old_balance, new_balance, related_id, related_type, description)
        VALUES (${withdrawal.user_id}, 'withdrawal', ${withdrawal.amount}, ${currentBalance}, ${newBalance}, ${withdrawal_id}, 'withdrawal', 'Withdrawal approved')
      `;

      console.log('[v0] Withdrawal approved:', { withdrawal_id, newBalance });

      return NextResponse.json({
        success: true,
        message: 'Withdrawal approved and wallet debited',
        newBalance,
      });
    } else {
      // Reject withdrawal
      await sql`
        UPDATE withdrawals 
        SET status = 'rejected', approved_by = ${adminId}, approved_at = NOW(), updated_at = NOW()
        WHERE id = ${withdrawal_id}
      `;

      console.log('[v0] Withdrawal rejected:', { withdrawal_id });

      return NextResponse.json({
        success: true,
        message: 'Withdrawal rejected',
      });
    }
  } catch (error) {
    console.error('[v0] Withdrawal approval error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Withdrawal approval failed' },
      { status: 500 }
    );
  }
}
