import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, symbol, companyName, companyLogo, initialPrice, currentPrice } = body;

    if (!userId || !symbol || !companyName || !initialPrice) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if stock already exists in portfolio
    const existing = await sql(
      'SELECT id FROM user_portfolio_stocks WHERE user_id = $1 AND symbol = $2',
      [userId, symbol]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: 'Stock already in portfolio' },
        { status: 409 }
      );
    }

    // Add stock to portfolio
    const result = await sql(
      `INSERT INTO user_portfolio_stocks 
       (user_id, symbol, company_name, company_logo, initial_price, current_price, quantity, invested_amount, profit_loss, percent_change, status)
       VALUES ($1, $2, $3, $4, $5, $6, 1, $7, 0, 0, 'active')
       RETURNING *`,
      [userId, symbol, companyName, companyLogo || '', initialPrice, currentPrice || initialPrice, initialPrice]
    );

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('[v0] Add stock error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
