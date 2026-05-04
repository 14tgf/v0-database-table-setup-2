import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

const sql = neon(process.env.DATABASE_URL || '');

export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get('auth_token')?.value;

    if (!cookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(cookie, JWT_SECRET);
    const userId = payload.sub as string;

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { symbol, companyName, companyLogo, initialPrice } = body;

    console.log('[v0] Add stock request:', { symbol, companyName, companyLogo, initialPrice, type: typeof initialPrice });

    if (!symbol || !companyName || initialPrice === undefined || initialPrice === null) {
      return NextResponse.json(
        { error: 'Missing required fields: symbol, companyName, initialPrice' },
        { status: 400 }
      );
    }

    const priceNum = parseFloat(initialPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid price: must be a positive number' },
        { status: 400 }
      );
    }

    // Check if stock already in portfolio
    const existingStock = await sql.query(
      'SELECT id FROM user_portfolio_stocks WHERE user_id = $1 AND symbol = $2 AND status = $3',
      [userId, symbol, 'active']
    );

    if (existingStock.length > 0) {
      return NextResponse.json(
        { error: 'Stock already in portfolio', alreadyAdded: true },
        { status: 409 }
      );
    }

    // Add stock to portfolio
    const result = await sql.query(
      `INSERT INTO user_portfolio_stocks 
       (user_id, symbol, company_name, company_logo, initial_price, current_price, invested_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, symbol, company_name, company_logo, initial_price, current_price, quantity, status, created_at`,
      [userId, symbol, companyName, companyLogo || null, priceNum, priceNum, priceNum]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Failed to add stock to portfolio' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${symbol} added to portfolio`,
      stock: result[0],
    });
  } catch (error) {
    console.error('[v0] Add stock error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to add stock: ${errorMessage}` },
      { status: 500 }
    );
  }
}
