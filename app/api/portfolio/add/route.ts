import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, symbol, companyName, companyLogo, initialPrice, currentPrice } = body;

    console.log('[v0] Portfolio add request body:', JSON.stringify(body));
    console.log('[v0] Extracted fields:', { userId, symbol, companyName, initialPrice, currentPrice });

    // Detailed validation with specific error messages
    const missingFields = [];
    if (!userId) missingFields.push('userId');
    if (!symbol) missingFields.push('symbol');
    if (!companyName) missingFields.push('companyName');
    if (!initialPrice && initialPrice !== 0) missingFields.push('initialPrice');

    if (missingFields.length > 0) {
      const errorMsg = `Missing fields: ${missingFields.join(', ')}`;
      console.log('[v0]', errorMsg);
      console.log('[v0] Received body:', body);
      return NextResponse.json(
        { message: errorMsg, receivedData: body },
        { status: 400 }
      );
    }

    const db = sql();

    // Check if stock already exists in portfolio
    const existing = (await db`
      SELECT id FROM user_portfolio_stocks 
      WHERE user_id = ${userId} AND symbol = ${symbol}
    `) as any[];

    if (existing.length > 0) {
      console.log('[v0] Stock already in portfolio:', symbol);
      return NextResponse.json(
        { message: 'Stock already in portfolio' },
        { status: 409 }
      );
    }

    // Add stock to portfolio
    const result = (await db`
      INSERT INTO user_portfolio_stocks 
       (user_id, symbol, company_name, company_logo, initial_price, current_price, quantity, invested_amount, profit_loss, percent_change, status, created_at, updated_at)
      VALUES (${userId}, ${symbol}, ${companyName}, ${companyLogo || ''}, ${initialPrice}, ${currentPrice || initialPrice}, 1, ${initialPrice}, 0, 0, 'active', NOW(), NOW())
      RETURNING *
    `) as any[];

    console.log('[v0] Stock added successfully:', result[0]);
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('[v0] Add stock error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}


