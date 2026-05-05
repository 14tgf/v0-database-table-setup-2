import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  return neon(process.env.DATABASE_URL);
}

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] ADMIN DEPOSITS APPROVE - Request received');
    
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    const { deposit_id, action, userId } = body;

    if (!deposit_id || !action || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sql = getSql();

    // Check if user is admin
    const adminCheck = await sql`SELECT id FROM admins WHERE id = ${userId}`;
    if (!adminCheck || adminCheck.length === 0) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('[v0] ADMIN DEPOSITS APPROVE - Admin verified, action:', action);

    // Get deposit details
    const depositResult = await sql`SELECT * FROM deposits WHERE id = ${deposit_id}`;
    if (!depositResult || depositResult.length === 0) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    const deposit = depositResult[0];

    if (action === 'approve') {
      const userResult = await sql`SELECT wallet_balance FROM users WHERE id = ${deposit.user_id}`;
      const currentBalance = userResult?.length > 0 ? parseFloat(userResult[0].wallet_balance || 0) : 0;
      const newBalance = currentBalance + parseFloat(deposit.amount);

      await sql`UPDATE users SET wallet_balance = ${newBalance}, updated_at = NOW() WHERE id = ${deposit.user_id}`;
      await sql`UPDATE deposits SET status = 'approved', approved_by = ${userId}, approved_at = NOW(), updated_at = NOW() WHERE id = ${deposit_id}`;
      await sql`INSERT INTO wallet_transactions (user_id, transaction_type, amount, old_balance, new_balance, related_id, related_type, description) VALUES (${deposit.user_id}, 'deposit', ${deposit.amount}, ${currentBalance}, ${newBalance}, ${deposit_id}, 'deposit', 'Deposit approved')`;

      return NextResponse.json({ success: true, message: 'Deposit approved', newBalance });
    } else {
      await sql`UPDATE deposits SET status = 'rejected', approved_by = ${userId}, approved_at = NOW(), updated_at = NOW() WHERE id = ${deposit_id}`;
      return NextResponse.json({ success: true, message: 'Deposit rejected' });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] ADMIN DEPOSITS APPROVE - Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
