import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getStockQuote } from '@/lib/finnhub';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, symbol } = body;

    if (!userId || !symbol) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = sql();

    // 1. Get the holding
    const holding = (await db`
      SELECT * FROM user_portfolio_stocks 
      WHERE user_id = ${userId} AND symbol = ${symbol} AND status = 'active'
    `) as any[];

    if (holding.length === 0) {
      return NextResponse.json(
        { message: 'Stock not found in portfolio' },
        { status: 404 }
      );
    }

    const stock = holding[0];
    const entryPrice = parseFloat(stock.initial_price) || 0;
    
    // 2. Get current market price from Finnhub
    console.log('[v0] Fetching current price for:', symbol);
    const liveQuote = await getStockQuote(symbol);
    const currentPrice = liveQuote?.price || parseFloat(stock.current_price) || entryPrice;
    
    // 3. Calculate realized profit/loss
    const quantity = parseInt(stock.quantity) || 1;
    const saleValue = currentPrice * quantity;
    const investedAmount = parseFloat(stock.invested_amount) || entryPrice;
    const realizedProfitLoss = saleValue - investedAmount;
    
    console.log('[v0] Selling stock:', {
      symbol,
      quantity,
      entryPrice,
      currentPrice,
      investedAmount,
      saleValue,
      realizedProfitLoss
    });

    // 4. Get user's current wallet balance
    const user = (await db`
      SELECT wallet_balance FROM users WHERE id = ${userId}
    `) as any[];

    if (user.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const currentBalance = parseFloat(user[0].wallet_balance) || 0;
    const newBalance = currentBalance + saleValue;

    // 5. Credit sale value back to wallet
    await db`
      UPDATE users 
      SET wallet_balance = ${newBalance}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    // 6. Mark stock as removed/sold
    const result = (await db`
      UPDATE user_portfolio_stocks 
      SET status = 'removed', updated_at = NOW()
      WHERE user_id = ${userId} AND symbol = ${symbol}
      RETURNING *
    `) as any[];

    console.log('[v0] Stock sold successfully:', {
      symbol,
      saleValue,
      realizedProfitLoss,
      newWalletBalance: newBalance
    });

    return NextResponse.json({
      message: `Sold 1 share of ${symbol} at $${currentPrice.toFixed(2)}. Profit/Loss: $${realizedProfitLoss.toFixed(2)}`,
      holding: result[0],
      newWalletBalance: newBalance,
      salePrice: currentPrice,
      realizedProfitLoss,
      saleValue
    }, { status: 200 });

  } catch (error) {
    console.error('[v0] Remove stock error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

