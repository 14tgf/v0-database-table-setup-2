import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
  try {
    // Get auth_token from cookies
    const cookie = request.cookies.get('auth_token')?.value;

    if (!cookie) {
      console.error('[v0] Portfolio Stocks - No auth token');
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Verify JWT to get userId
    const { payload } = await jwtVerify(cookie, JWT_SECRET);
    const userId = payload.sub as string;

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
      WHERE ups.user_id = ${userId} AND ups.status = 'active'
      ORDER BY ups.created_at DESC
    `) as any[];

    console.log('[v0] Portfolio Stocks - Fetched', stocks.length, 'stocks for user:', userId);
    
    return NextResponse.json(
      {
        success: true,
        data: stocks,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Portfolio Stocks - Error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
