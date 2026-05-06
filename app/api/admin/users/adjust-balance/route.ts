import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const { userId, amount, type, balanceType = 'wallet', reason } = await request.json();

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

    const validBalanceTypes = ['wallet'];
    if (!validBalanceTypes.includes(balanceType)) {
      return NextResponse.json(
        { error: 'Invalid balance type. Currently only "wallet" is supported' },
        { status: 400 }
      );
    }

    // Map balance type to column name
    const columnMap: Record<string, string> = {
      wallet: 'wallet_balance',
      stock: 'stock_balance',
      vehicle: 'vehicle_balance',
      energy: 'energy_balance',
    };
    const columnName = columnMap[balanceType];

    const db = sql();

    // Get current user balance
    const userResult = (await db`
      SELECT id, email, wallet_balance, full_name FROM users WHERE id = ${userId}
    `) as any[];

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult[0];
    const currentBalance = parseFloat(user[columnName]) || 0;
    const adjustmentAmount = parseFloat(amount);

    // Calculate new balance
    const newBalance = type === 'credit' 
      ? currentBalance + adjustmentAmount 
      : currentBalance - adjustmentAmount;

    // Prevent negative balances
    if (newBalance < 0) {
      return NextResponse.json(
        { error: `Insufficient ${balanceType} balance for debit operation` },
        { status: 400 }
      );
    }

    // Update user balance
    await db`UPDATE users SET wallet_balance = ${newBalance}, updated_at = NOW() WHERE id = ${userId}`;

    // Log the adjustment in audit_logs
    const description = `Admin adjusted wallet balance: ${type} $${adjustmentAmount} - Reason: ${reason || 'No reason provided'}`;
    await db`INSERT INTO audit_logs (id, admin_id, action, entity_type, entity_id, new_values) VALUES (gen_random_uuid(), NULL, 'BALANCE_ADJUSTMENT', 'user', ${userId}, jsonb_build_object('new_balance', ${newBalance}, 'reason', ${reason || 'No reason provided'}))`;

    return NextResponse.json({
      success: true,
      message: `${balanceType} balance adjusted successfully`,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        balanceType: balanceType,
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
