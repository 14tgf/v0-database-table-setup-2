import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    console.log('[v0] Fetching portfolio stocks for userId:', userId);

    if (!userId) {
      console.log('[v0] Missing userId parameter');
      return NextResponse.json(
        { message: 'Missing userId' },
        { status: 400 }
      );
    }

    const db = sql();

    const stocks = (await db`
      SELECT * FROM user_portfolio_stocks 
       WHERE user_id = ${userId} AND status = 'active'
       ORDER BY created_at DESC
    `) as any[];

    console.log('[v0] Found stocks:', stocks);
    console.log('[v0] Stock count:', stocks.length);

    return NextResponse.json(stocks, { status: 200 });
  } catch (error) {
    console.error('[v0] Fetch stocks error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
