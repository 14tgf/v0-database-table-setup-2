import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

let sql: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!sql) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sql = neon(dbUrl);
  }
  return sql;
}

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

    const validBalanceTypes = ['wallet', 'stock', 'vehicle', 'energy'];
    if (!validBalanceTypes.includes(balanceType)) {
      return NextResponse.json(
        { error: 'Invalid balance type. Must be one of: wallet, stock, vehicle, energy' },
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

    const dbSql = getSql();

    // Get current user balance
    const userResult = await dbSql(
      `SELECT id, email, ${columnName}, full_name FROM users WHERE id = $1`,
      [userId]
    );

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
    await dbSql(
      `UPDATE users SET ${columnName} = $1, updated_at = NOW() WHERE id = $2`,
      [newBalance, userId]
    );

    // Log the adjustment in audit_logs
    const description = `Admin adjusted ${balanceType} balance: ${type} $${adjustmentAmount} - Reason: ${reason || 'No reason provided'}`;
    await dbSql(
      'INSERT INTO audit_logs (id, user_id, action, description, status) VALUES (gen_random_uuid(), $1, $2, $3, $4)',
      [userId, 'BALANCE_ADJUSTMENT', description, 'success']
    );

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
