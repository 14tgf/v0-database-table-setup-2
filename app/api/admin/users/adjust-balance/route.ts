import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const { userId, amount, type, balanceType = 'wallet', reason } = await request.json();

    console.log('[v0] Adjust balance request body:', { userId, amount, type, balanceType, reason });

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

    // Get current user balance
    console.log('[v0] Fetching user with ID:', userId, 'Type:', typeof userId);
    const userResult = (await sql`
      SELECT id, email, wallet_balance::numeric, full_name FROM users WHERE id = ${userId}::uuid
    `) as any[];

    console.log('[v0] User query result:', userResult);
    
    if (!userResult || userResult.length === 0) {
      console.log('[v0] User not found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult[0];
    console.log('[v0] User object:', user);
    
    // Handle wallet_balance - it might be string, number, or BigInt
    let currentBalance = 0;
    if (user.wallet_balance !== null && user.wallet_balance !== undefined) {
      currentBalance = typeof user.wallet_balance === 'string' 
        ? parseFloat(user.wallet_balance) 
        : Number(user.wallet_balance);
    }
    console.log('[v0] Current balance:', currentBalance, 'Type:', typeof currentBalance);
    
    const adjustmentAmount = parseFloat(String(amount));

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
    await sql`UPDATE users SET wallet_balance = ${newBalance}, updated_at = NOW() WHERE id = ${userId}`;

    // Log the adjustment in audit_logs
    const newValuesJson = JSON.stringify({
      new_balance: newBalance,
      reason: reason || 'No reason provided'
    });
    await sql`INSERT INTO audit_logs (id, admin_id, action, entity_type, entity_id, new_values) VALUES (gen_random_uuid(), NULL, 'BALANCE_ADJUSTMENT', 'user', ${userId}, ${newValuesJson}::jsonb)`;

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
