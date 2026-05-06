import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      console.error('[v0] Portfolio Stocks - Missing userId');
      return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
    }

    const db = sql();

    // Fetch active stocks with company details
    const stocks = (await db`
      SELECT 
        ups.id,
        ups.user_id,
        ups.company_id,
        ups.shares,
        ups.average_cost,
        ups.current_value,
        ups.gain_loss,
        ups.status,
        ups.created_at,
        ups.updated_at,
        c.symbol,
        c.name as company_name
      FROM user_portfolio_stocks ups
      LEFT JOIN companies c ON ups.company_id = c.id
      WHERE ups.user_id = ${userId} AND (ups.status = 'active' OR ups.status IS NULL)
      ORDER BY ups.created_at DESC
    `) as any[];

    console.log('[v0] Portfolio Stocks - Fetched', stocks.length, 'stocks for user:', userId);
    return NextResponse.json(stocks, { status: 200 });
  } catch (error) {
    console.error('[v0] Portfolio Stocks - Error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
