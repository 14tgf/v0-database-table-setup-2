import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    // Get auth_token from cookies
    const cookie = request.cookies.get('auth_token')?.value;

    if (!cookie) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT to get userId
    const { payload } = await jwtVerify(cookie, JWT_SECRET);
    const userId = payload.sub as string;

    const body = await request.json();
    const { symbol } = body;

    if (!symbol) {
      return NextResponse.json(
        { message: 'Missing required field: symbol' },
        { status: 400 }
      );
    }

    console.log('[v0] Portfolio remove - Starting for:', { userId, symbol });

    const db = sql();

    // 1. Find the holding by joining with companies table to get company_id
    const holding = (await db`
      SELECT ups.*, c.symbol FROM user_portfolio_stocks ups
      JOIN companies c ON ups.company_id = c.id
      WHERE ups.user_id = ${userId} AND c.symbol = ${symbol} AND ups.status = 'active'
    `) as any[];

    if (holding.length === 0) {
      return NextResponse.json(
        { message: `Stock ${symbol} not found in portfolio` },
        { status: 404 }
      );
    }

    const stock = holding[0];
    const invested = parseFloat(stock.current_value) || 0;
    const averageCost = parseFloat(stock.average_cost) || 0;
    const shares = parseFloat(stock.shares) || 1;

    // 2. Calculate sale value and realized P&L
    const saleValue = averageCost * shares;
    const currentValue = parseFloat(stock.current_value) || saleValue;
    const realizedProfitLoss = currentValue - saleValue;

    console.log('[v0] Portfolio remove - Calculated:', { shares, averageCost, saleValue, currentValue, realizedProfitLoss });

    // 3. Get user's wallet
    const user = (await db`
      SELECT wallet_balance FROM users WHERE id = ${userId}
    `) as any[];

    if (user.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const currentBalance = parseFloat(user[0].wallet_balance) || 0;
    const newBalance = currentBalance + currentValue;

    console.log('[v0] Portfolio remove - Wallet:', { currentBalance, currentValue, newBalance });

    // 4. Credit sale value to wallet
    await db`
      UPDATE users 
      SET wallet_balance = ${newBalance}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    // 5. Mark stock as removed
    await db`
      UPDATE user_portfolio_stocks 
      SET status = 'removed', updated_at = NOW()
      WHERE user_id = ${userId} AND company_id = ${stock.company_id}
    `;

    console.log('[v0] Portfolio remove - Complete:', symbol);

    return NextResponse.json(
      {
        message: `Sold ${shares} shares of ${symbol} for $${currentValue.toFixed(2)}`,
        saleValue: currentValue,
        realizedProfitLoss,
        newWalletBalance: newBalance,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Portfolio remove error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to remove stock' },
      { status: 500 }
    );
  }
}
