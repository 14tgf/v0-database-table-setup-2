import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getStockQuote } from '@/lib/finnhub';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, symbol, companyName, companyLogo, investmentAmount = 500 } = body;

    console.log('[v0] Portfolio add request:', { userId, symbol, companyName, investmentAmount });

    const missingFields = [];
    if (!userId) missingFields.push('userId');
    if (!symbol) missingFields.push('symbol');
    if (!companyName) missingFields.push('companyName');

    if (missingFields.length > 0) {
      const errorMsg = `Missing fields: ${missingFields.join(', ')}`;
      console.log('[v0]', errorMsg);
      return NextResponse.json({ message: errorMsg }, { status: 400 });
    }

    const db = sql();

    // 1. Verify the company exists in the companies table
    const company = (await db`
      SELECT id, symbol, name FROM companies WHERE symbol = ${symbol}
    `) as any[];

    if (company.length === 0) {
      console.log('[v0] Company not found:', symbol);
      return NextResponse.json(
        { message: 'Company not found in system' },
        { status: 404 }
      );
    }

    console.log('[v0] Investment amount for', symbol, ':', investmentAmount);

    // 2. Get live stock price from Finnhub
    const liveQuote = await getStockQuote(symbol);
    const currentPrice = liveQuote?.price || 0;
    console.log('[v0] Current stock price:', currentPrice);

    // 3. Get user's wallet balance
    const user = (await db`
      SELECT wallet_balance FROM users WHERE id = ${userId}
    `) as any[];

    if (user.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const walletBalance = parseFloat(user[0].wallet_balance) || 0;
    console.log('[v0] User wallet balance:', walletBalance);

    // 4. Check if user has sufficient funds to invest
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

    // 5. Deduct investment amount from wallet FIRST
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

    // 6. Use PostgreSQL UPSERT (INSERT ... ON CONFLICT DO UPDATE) to handle duplicates
    console.log('[v0] Attempting to upsert stock holding for user:', userId, 'company_id:', company[0].id);

    // Calculate number of shares based on investment amount and current price
    const shares = currentPrice > 0 ? investmentAmount / currentPrice : 1;

    const result = (await db`
      INSERT INTO user_portfolio_stocks 
        (user_id, company_id, shares, average_cost, current_value, gain_loss, status, created_at, updated_at)
      VALUES (
        ${userId}, 
        ${company[0].id}, 
        ${shares}, 
        ${currentPrice}, 
        ${investmentAmount}, 
        0,
        'active',
        NOW(), 
        NOW()
      )
      ON CONFLICT (user_id, company_id) DO UPDATE SET
        shares = user_portfolio_stocks.shares + ${shares},
        average_cost = ${currentPrice},
        current_value = user_portfolio_stocks.current_value + ${investmentAmount},
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

    return NextResponse.json(
      {
        message: `Invested $${investmentAmount.toFixed(2)} in ${companyName}`,
        holding: result[0],
        newWalletBalance,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Add stock error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    
    // Check if it's a database constraint error
    if (errorMsg.includes('duplicate key') || errorMsg.includes('unique constraint')) {
      console.error('[v0] Duplicate key error - this should not happen with UPSERT:', errorMsg);
    }
    
    return NextResponse.json(
      { message: errorMsg },
      { status: 500 }
    );
  }
}


