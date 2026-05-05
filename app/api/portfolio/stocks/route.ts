import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    console.log('[v0] Portfolio Stocks Endpoint - Request:', {
      userId,
      timestamp: new Date().toISOString(),
    });

    if (!userId) {
      console.error('[v0] Portfolio Stocks Endpoint - Missing userId');
      return NextResponse.json(
        { message: 'Missing userId' },
        { status: 400 }
      );
    }

    const db = sql();

    // First, let's check ALL stocks for this user (regardless of status)
    console.log('[v0] Portfolio Stocks Endpoint - Checking all stocks for user...');
    const allStocks = (await db`
      SELECT * FROM user_portfolio_stocks 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `) as any[];

    console.log('[v0] Portfolio Stocks Endpoint - All stocks count:', allStocks.length);
    if (allStocks.length > 0) {
      console.log('[v0] Portfolio Stocks Endpoint - All stocks statuses:', {
        stocks: allStocks.map(s => ({ symbol: s.symbol, status: s.status, quantity: s.quantity }))
      });
    }

    // Now fetch only active stocks
    console.log('[v0] Portfolio Stocks Endpoint - Fetching active stocks...');
    const stocks = (await db`
      SELECT * FROM user_portfolio_stocks 
      WHERE user_id = ${userId} AND status = 'active'
      ORDER BY created_at DESC
    `) as any[];

    console.log('[v0] Portfolio Stocks Endpoint - Active stocks count:', stocks.length);
    
    if (stocks.length > 0) {
      console.log('[v0] Portfolio Stocks Endpoint - Active stocks detail:', {
        count: stocks.length,
        symbols: stocks.map(s => ({ symbol: s.symbol, quantity: s.quantity, invested: s.invested_amount }))
      });
    } else {
      console.warn('[v0] Portfolio Stocks Endpoint - No active stocks found for userId:', userId);
    }

    return NextResponse.json(stocks, { status: 200 });
  } catch (error) {
    console.error('[v0] Portfolio Stocks Endpoint - Error:', {
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
