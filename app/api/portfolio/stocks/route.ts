import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: 'Missing userId' },
        { status: 400 }
      );
    }

    const stocks = await sql(
      `SELECT * FROM user_portfolio_stocks 
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC`,
      [userId]
    );

    return NextResponse.json(stocks, { status: 200 });
  } catch (error) {
    console.error('[v0] Fetch stocks error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
