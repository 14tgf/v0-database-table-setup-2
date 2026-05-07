import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getStockQuote } from '@/lib/finnhub';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    // 1. Get auth_token from cookies
    const cookie = request.cookies.get('auth_token')?.value;

    if (!cookie) {
      console.log('[v0] Portfolio add - No auth token found');
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // 2. Verify JWT to get userId
    const { payload } = await jwtVerify(cookie, JWT_SECRET);
    const userId = payload.sub as string;

    const body = await request.json();
    const { symbol, investmentAmount = 500 } = body;

    console.log('[v0] Portfolio add request:', { userId, symbol, investmentAmount });

    // 3. Validate symbol and investmentAmount are provided
    if (!symbol || !investmentAmount || investmentAmount <= 0) {
      const errorMsg = 'Missing or invalid: symbol, investmentAmount';
      console.log('[v0]', errorMsg);
      return NextResponse.json({ message: errorMsg }, { status: 400 });
    }

    const db = sql();

    // 4. Query: SELECT * FROM companies WHERE symbol = symbol
    const company = (await db`
      SELECT id, symbol, name FROM companies WHERE symbol = ${symbol}
    `) as any[];

    // 5. If company not found → Return 404 error "Company not found"
    if (company.length === 0) {
      console.log('[v0] Company not found:', symbol);
      return NextResponse.json(
        { message: 'Company not found in system' },
        { status: 404 }
      );
    }

    console.log('[v0] Investment amount for', symbol, ':', investmentAmount);

    // 8. Get current price from Finnhub API using symbol
    // 9. If Finnhub fails → Use fallback price (e.g., $100)
    const liveQuote = await getStockQuote(symbol);
    const currentPrice = liveQuote?.price || 100;
    console.log('[v0] Current stock price:', currentPrice);

    // 11. Query: SELECT wallet_balance FROM users WHERE id = userId
    const user = (await db`
      SELECT wallet_balance FROM users WHERE id = ${userId}
    `) as any[];

    if (user.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const walletBalance = parseFloat(user[0].wallet_balance) || 0;
    console.log('[v0] User wallet balance:', walletBalance);

    // 12. CRITICAL: If walletBalance < investmentAmount → Return 402 "Insufficient balance"
    if (walletBalance < investmentAmount) {
      console.log('[v0] Insufficient funds for investment');
      return NextResponse.json(
        {
          message: `Insufficient balance. Required: $${investmentAmount.toFixed(2)}, Available: $${walletBalance.toFixed(2)}`,
          required: investmentAmount,
          available: walletBalance,
        },
        { status: 402 }
      );
    }

    // 13. Calculate: newWalletBalance = walletBalance - investmentAmount
    // 14. UPDATE users SET wallet_balance = newWalletBalance WHERE id = userId
    const newWalletBalance = walletBalance - investmentAmount;
    console.log('[v0] Deducting investment from wallet:', {
      oldBalance: walletBalance,
      newBalance: newWalletBalance,
      invested: investmentAmount,
    });

    await db`
      UPDATE users 
      SET wallet_balance = ${newWalletBalance}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    // 10. Calculate: shares = investmentAmount / currentPrice
    const shares = currentPrice > 0 ? investmentAmount / currentPrice : 1;

    // 15. Check if user already owns this stock and UPSERT
    console.log('[v0] Attempting to upsert stock holding for user:', userId, 'company_id:', company[0].id);

    const result = (await db`
      INSERT INTO user_portfolio_stocks 
        (user_id, company_id, symbol, shares, average_cost, current_price, current_value, gain_loss, status, created_at, updated_at)
      VALUES (
        ${userId}, 
        ${company[0].id}, 
        ${symbol},
        ${shares}, 
        CAST(${currentPrice} AS NUMERIC(15,2)), 
        CAST(${currentPrice} AS NUMERIC(15,2)),
        CAST(${investmentAmount} AS NUMERIC(15,2)), 
        0,
        'active',
        NOW(), 
        NOW()
      )
      ON CONFLICT (user_id, company_id) DO UPDATE SET
        symbol = ${symbol},
        shares = user_portfolio_stocks.shares + CAST(${shares} AS NUMERIC(15,8)),
        average_cost = (CAST(user_portfolio_stocks.average_cost AS NUMERIC(15,2)) * CAST(user_portfolio_stocks.shares AS NUMERIC(15,8)) + CAST(${currentPrice} AS NUMERIC(15,2)) * CAST(${shares} AS NUMERIC(15,8))) / (CAST(user_portfolio_stocks.shares AS NUMERIC(15,8)) + CAST(${shares} AS NUMERIC(15,8))),
        current_price = CAST(${currentPrice} AS NUMERIC(15,2)),
        current_value = user_portfolio_stocks.current_value + CAST(${investmentAmount} AS NUMERIC(15,2)),
        status = 'active',
        updated_at = NOW()
      RETURNING *
    `) as any[];

    console.log('[v0] Stock purchase completed successfully:', {
      symbol,
      companyId: company[0].id,
      invested: investmentAmount,
      currentPrice,
      newWalletBalance,
      shares: result[0]?.shares,
      totalValue: result[0]?.current_value,
    });

    // 20. Return SUCCESS response
    return NextResponse.json(
      {
        success: true,
        message: `Invested $${investmentAmount.toFixed(2)} in ${symbol}. You now own ${parseFloat(result[0]?.shares).toFixed(4)} shares.`,
        portfolio: result[0],
        newWalletBalance: newWalletBalance,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Add stock error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json(
      { message: errorMsg },
      { status: 500 }
    );
  }
}


