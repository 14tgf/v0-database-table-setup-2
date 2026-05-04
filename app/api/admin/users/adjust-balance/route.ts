import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function PUT(request: NextRequest) {
  try {
    const { userId, amount, type, reason } = await request.json();

    if (!userId || !amount || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, amount, type' },
        { status: 400 }
      );
    }

    if (type !== 'credit' && type !== 'debit') {
      return NextResponse.json(
        { error: 'Type must be either "credit" or "debit"' },
        { status: 400 }
      );
    }

    // Get current user balance
    const userResult = await sql.query(
      'SELECT id, email, wallet_balance, full_name FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult[0];
    const currentBalance = parseFloat(user.wallet_balance);
    const adjustmentAmount = parseFloat(amount);

    // Calculate new balance
    const newBalance = type === 'credit' 
      ? currentBalance + adjustmentAmount 
      : currentBalance - adjustmentAmount;

    // Prevent negative balances
    if (newBalance < 0) {
      return NextResponse.json(
        { error: 'Insufficient balance for debit operation' },
        { status: 400 }
      );
    }

    // Update user balance
    await sql.query(
      'UPDATE users SET wallet_balance = $1, updated_at = NOW() WHERE id = $2',
      [newBalance, userId]
    );

    // Log the adjustment in audit_logs
    const description = `Admin adjusted balance: ${type} $${adjustmentAmount} - Reason: ${reason || 'No reason provided'}`;
    await sql.query(
      'INSERT INTO audit_logs (id, user_id, action, description, status) VALUES (gen_random_uuid(), $1, $2, $3, $4)',
      [userId, 'BALANCE_ADJUSTMENT', description, 'success']
    );

    return NextResponse.json({
      success: true,
      message: 'Balance adjusted successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        previousBalance: currentBalance,
        newBalance: newBalance,
        adjustmentAmount: adjustmentAmount,
        type: type,
        reason: reason || 'No reason provided',
      },
    });
  } catch (error) {
    console.error('[v0] Balance adjustment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    return NextResponse.json(
      { error: `Failed to adjust balance: ${errorMessage}` },
      { status: 500 }
    );
  }
}
