import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getStockQuote } from '@/lib/finnhub';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, symbol } = body;

    if (!userId) {
      return NextResponse.json(
        { message: 'Missing userId' },
        { status: 400 }
      );
    }

    // If symbol provided, update just that stock
    if (symbol) {
      try {
        const quote = await getStockQuote(symbol);
        
        if (!quote) {
          return NextResponse.json(
            { message: 'Could not fetch current price' },
            { status: 400 }
          );
        }

        const currentPrice = quote.price;

        // Get the stock entry
        const stocks = await sql(
          `SELECT * FROM user_portfolio_stocks 
           WHERE user_id = $1 AND symbol = $2 AND status = 'active'`,
          [userId, symbol]
        );

        if (stocks.length === 0) {
          return NextResponse.json(
            { message: 'Stock not found in portfolio' },
            { status: 404 }
          );
        }

        const stock = stocks[0];
        const newValue = currentPrice * stock.quantity;
        const profitLoss = newValue - stock.invested_amount;
        const percentChange = (profitLoss / stock.invested_amount) * 100;

        // Update the stock with new price and calculations
        const updated = await sql(
          `UPDATE user_portfolio_stocks 
           SET current_price = $1, profit_loss = $2, percent_change = $3, updated_at = NOW()
           WHERE user_id = $4 AND symbol = $5
           RETURNING *`,
          [currentPrice, profitLoss, percentChange, userId, symbol]
        );

        return NextResponse.json(updated[0], { status: 200 });
      } catch (error) {
        console.error('[v0] Update stock price error:', error);
        return NextResponse.json(
          { message: 'Failed to update stock price' },
          { status: 500 }
        );
      }
    }

    // Otherwise, update all stocks for the user
    const userStocks = await sql(
      `SELECT * FROM user_portfolio_stocks 
       WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    const updated = [];
    for (const stock of userStocks) {
      try {
        const quote = await getStockQuote(stock.symbol);
        
        if (quote) {
          const currentPrice = quote.price;
          const newValue = currentPrice * stock.quantity;
          const profitLoss = newValue - stock.invested_amount;
          const percentChange = (profitLoss / stock.invested_amount) * 100;

          const result = await sql(
            `UPDATE user_portfolio_stocks 
             SET current_price = $1, profit_loss = $2, percent_change = $3, updated_at = NOW()
             WHERE id = $4
             RETURNING *`,
            [currentPrice, profitLoss, percentChange, stock.id]
          );

          updated.push(result[0]);
        }
      } catch (error) {
        console.error(`[v0] Failed to update ${stock.symbol}:`, error);
      }
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[v0] Portfolio update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
