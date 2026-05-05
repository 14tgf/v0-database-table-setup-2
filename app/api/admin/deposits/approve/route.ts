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
    const { deposit_id, action } = body;

    if (!deposit_id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    console.log('[v0] Admin deposit action:', { deposit_id, action, adminId });

    // Get deposit details
    const depositResult = await sql`
      SELECT * FROM deposits WHERE id = ${deposit_id}
    `;

    if (depositResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Deposit not found' },
        { status: 404 }
      );
    }

    const deposit = depositResult.rows[0];

    if (action === 'approve') {
      // Get user's current balance
      const userResult = await sql`
        SELECT wallet_balance FROM users WHERE id = ${deposit.user_id}
      `;

      const currentBalance = userResult.rows[0]?.wallet_balance || 0;
      const newBalance = parseFloat(currentBalance) + parseFloat(deposit.amount);

      // Update user wallet
      await sql`
        UPDATE users 
        SET wallet_balance = ${newBalance}, updated_at = NOW()
        WHERE id = ${deposit.user_id}
      `;

      // Update deposit status
      await sql`
        UPDATE deposits 
        SET status = 'approved', approved_by = ${adminId}, approved_at = NOW(), updated_at = NOW()
        WHERE id = ${deposit_id}
      `;

      // Create wallet transaction log
      await sql`
        INSERT INTO wallet_transactions (user_id, transaction_type, amount, old_balance, new_balance, related_id, related_type, description)
        VALUES (${deposit.user_id}, 'deposit', ${deposit.amount}, ${currentBalance}, ${newBalance}, ${deposit_id}, 'deposit', 'Deposit approved')
      `;

      console.log('[v0] Deposit approved:', { deposit_id, newBalance });

      return NextResponse.json({
        success: true,
        message: 'Deposit approved and wallet credited',
        newBalance,
      });
    } else {
      // Reject deposit
      await sql`
        UPDATE deposits 
        SET status = 'rejected', approved_by = ${adminId}, approved_at = NOW(), updated_at = NOW()
        WHERE id = ${deposit_id}
      `;

      console.log('[v0] Deposit rejected:', { deposit_id });

      return NextResponse.json({
        success: true,
        message: 'Deposit rejected',
      });
    }
  } catch (error) {
    console.error('[v0] Deposit approval error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Deposit approval failed' },
      { status: 500 }
    );
  }
}
