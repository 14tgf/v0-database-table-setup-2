import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getStockQuote } from '@/lib/finnhub';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, symbol } = body;

    console.log('[v0] Portfolio remove - Request:', { userId, symbol, timestamp: new Date().toISOString() });

    if (!userId || !symbol) {
      console.error('[v0] Portfolio remove - Missing fields:', { userId: !!userId, symbol: !!symbol });
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = sql();

    // 1. Get the holding
    console.log('[v0] Portfolio remove - Fetching holding from DB...');
    const holding = (await db`
      SELECT * FROM user_portfolio_stocks 
      WHERE user_id = ${userId} AND symbol = ${symbol} AND status = 'active'
    `) as any[];

    console.log('[v0] Portfolio remove - Holding found:', {
      found: holding.length > 0,
      symbol,
      timestamp: new Date().toISOString(),
    });

    if (holding.length === 0) {
      console.error('[v0] Portfolio remove - Stock not found');
      return NextResponse.json(
        { message: 'Stock not found in portfolio' },
        { status: 404 }
      );
    }

    const stock = holding[0];
    const invested = parseFloat(stock.invested_amount) || 0;
    const entryPrice = parseFloat(stock.initial_price) || 0;
    const quantity = parseInt(stock.quantity) || 1;

    console.log('[v0] Portfolio remove - Stock details:', {
      symbol,
      invested,
      entryPrice,
      quantity,
    });

    // 2. Get current market price
    console.log('[v0] Portfolio remove - Fetching current price...');
    const liveQuote = await getStockQuote(symbol);
    const currentPrice = liveQuote?.price || parseFloat(stock.current_price) || entryPrice;

    console.log('[v0] Portfolio remove - Current price:', currentPrice);

    // 3. Calculate sale value and realized P&L
    const saleValue = currentPrice * quantity;
    const realizedProfitLoss = saleValue - invested;

    console.log('[v0] Portfolio remove - Selling stock:', {
      symbol,
      quantity,
      invested,
      currentPrice,
      saleValue,
      realizedProfitLoss,
    });

    // 4. Get user's wallet
    console.log('[v0] Portfolio remove - Fetching user wallet...');
    const user = (await db`
      SELECT wallet_balance FROM users WHERE id = ${userId}
    `) as any[];

    if (user.length === 0) {
      console.error('[v0] Portfolio remove - User not found');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const currentBalance = parseFloat(user[0].wallet_balance) || 0;
    const newBalance = currentBalance + saleValue;

    console.log('[v0] Portfolio remove - Wallet update:', {
      userId,
      currentBalance,
      saleValue,
      newBalance,
    });

    // 5. Credit sale value to wallet
    console.log('[v0] Portfolio remove - Updating wallet...');
    await db`
      UPDATE users 
      SET wallet_balance = ${newBalance}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    console.log('[v0] Portfolio remove - Wallet updated successfully');

    // 6. Mark stock as removed
    console.log('[v0] Portfolio remove - Marking stock as removed...');
    const result = (await db`
      UPDATE user_portfolio_stocks 
      SET status = 'removed', updated_at = NOW()
      WHERE user_id = ${userId} AND symbol = ${symbol}
      RETURNING *
    `) as any[];

    console.log('[v0] Portfolio remove - Stock removal complete:', {
      symbol,
      saleValue,
      realizedProfitLoss,
      newWalletBalance: newBalance,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        message: `Sold at $${currentPrice.toFixed(2)}, P&L: $${realizedProfitLoss.toFixed(2)}`,
        holding: result[0],
        newWalletBalance: newBalance,
        salePrice: currentPrice,
        saleValue,
        realizedProfitLoss,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Portfolio remove - Error:', {
      error,
      errorMsg: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : 'N/A',
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
