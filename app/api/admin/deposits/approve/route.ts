import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-in-production');

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  return neon(process.env.DATABASE_URL);
}

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] ADMIN DEPOSITS APPROVE - Request received');
    
    const cookie = request.cookies.get('auth_token')?.value;
    if (!cookie) {
      console.error('[v0] ADMIN DEPOSITS APPROVE - No auth token');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(cookie, JWT_SECRET);
    const adminId = payload.sub as string;
    console.log('[v0] ADMIN DEPOSITS APPROVE - Admin ID:', adminId);

    const body = await request.json();
    const { deposit_id, action } = body;

    if (!deposit_id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    console.log('[v0] ADMIN DEPOSITS APPROVE - Action:', action, 'Deposit ID:', deposit_id);

    const sql = getSql();

    // Get deposit details
    const depositResult = await sql`
      SELECT * FROM deposits WHERE id = ${deposit_id}
    `;

    if (!depositResult || !Array.isArray(depositResult) || depositResult.length === 0) {
      console.error('[v0] ADMIN DEPOSITS APPROVE - Deposit not found:', deposit_id);
      return NextResponse.json(
        { error: 'Deposit not found' },
        { status: 404 }
      );
    }

    const deposit = depositResult[0];
    console.log('[v0] ADMIN DEPOSITS APPROVE - Deposit found:', { id: deposit.id, amount: deposit.amount, user_id: deposit.user_id });

    if (action === 'approve') {
      // Get user's current balance
      const userResult = await sql`
        SELECT wallet_balance FROM users WHERE id = ${deposit.user_id}
      `;

      const currentBalance = userResult && userResult.length > 0 ? parseFloat(userResult[0].wallet_balance || 0) : 0;
      const newBalance = currentBalance + parseFloat(deposit.amount);

      console.log('[v0] ADMIN DEPOSITS APPROVE - Updating balance:', { currentBalance, amount: deposit.amount, newBalance });

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

      console.log('[v0] ADMIN DEPOSITS APPROVE - Deposit approved:', deposit_id);

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

      console.log('[v0] ADMIN DEPOSITS APPROVE - Deposit rejected:', deposit_id);

      return NextResponse.json({
        success: true,
        message: 'Deposit rejected',
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[v0] ADMIN DEPOSITS APPROVE - Error:', errorMsg);
    return NextResponse.json(
      { error: `Error: ${errorMsg}` },
      { status: 500 }
    );
  }
}
