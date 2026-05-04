import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getStockQuote } from '@/lib/finnhub';

const sql = neon(process.env.DATABASE_URL || '');

export async function POST(request: NextRequest) {
  try {
    // Fetch all portfolio stocks
    const allStocks = await sql.query(
      `SELECT id, user_id, symbol, initial_price, quantity, invested_amount
       FROM user_portfolio_stocks 
       WHERE status = $1`,
      ['active']
    );

    let updated = 0;

    for (const stock of allStocks) {
      try {
        // Get current price from Finnhub
        const quote = await getStockQuote(stock.symbol);

        if (quote) {
          const currentPrice = quote.price;
          const quantity = parseInt(stock.quantity) || 1;
          const investedAmount = parseFloat(stock.invested_amount);
          const currentValue = currentPrice * quantity;
          const profitLoss = currentValue - investedAmount;
          const percentChange = investedAmount > 0 ? (profitLoss / investedAmount) * 100 : 0;

          // Update stock in database
          await sql.query(
            `UPDATE user_portfolio_stocks 
             SET current_price = $1, profit_loss = $2, percent_change = $3, updated_at = NOW()
             WHERE id = $4`,
            [currentPrice, profitLoss, percentChange, stock.id]
          );

          updated++;
        }
      } catch (error) {
        console.error(`[v0] Error updating price for ${stock.symbol}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updated} stock prices`,
      updated,
      total: allStocks.length,
    });
  } catch (error) {
    console.error('[v0] Update prices error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to update prices: ${errorMessage}` },
      { status: 500 }
    );
  }
}
