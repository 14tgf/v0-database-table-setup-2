import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { sql } from '@/lib/db';
import { getStockQuote } from '@/lib/finnhub';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, symbol, companyName, companyLogo, initialPrice } = body;

    // Validate required fields
    const missingFields = [];
    if (!userId) missingFields.push('userId');
    if (!symbol) missingFields.push('symbol');
    if (!companyName) missingFields.push('companyName');
    if (!initialPrice && initialPrice !== 0) missingFields.push('initialPrice');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const db = sql();

    // 1. Get live stock price from Finnhub
    console.log('[v0] Fetching live price for:', symbol);
    const liveQuote = await getStockQuote(symbol);
    const livePrice = liveQuote?.price || initialPrice;
    
    console.log('[v0] Live price:', livePrice, 'Initial price:', initialPrice);

    // 2. Get user's wallet balance
    const userResult = (await db`
      SELECT id, wallet_balance, full_name, email 
      FROM users 
      WHERE id = ${userId}
    `) as any[];

    if (userResult.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult[0];
    const walletBalance = parseFloat(user.wallet_balance) || 0;

    console.log('[v0] User wallet balance:', walletBalance, 'Stock price:', livePrice);

    // 3. Check if user has sufficient balance (buying 1 share)
    if (walletBalance < livePrice) {
      console.log('[v0] Insufficient balance. Wallet:', walletBalance, 'Price:', livePrice);
      return NextResponse.json(
        { 
          message: `Insufficient balance. Wallet: $${walletBalance.toFixed(2)}, Stock price: $${livePrice.toFixed(2)}`,
          walletBalance,
          stockPrice: livePrice
        },
        { status: 402 } // 402 Payment Required
      );
    }

    // 4. Check if stock already exists in portfolio
    const existing = (await db`
      SELECT id FROM user_portfolio_stocks 
      WHERE user_id = ${userId} AND symbol = ${symbol} AND status = 'active'
    `) as any[];

    if (existing.length > 0) {
      return NextResponse.json(
        { message: 'Stock already in portfolio' },
        { status: 409 }
      );
    }

    // 5. Deduct ONE SHARE PRICE from wallet
    const newWalletBalance = walletBalance - livePrice;
    console.log('[v0] New wallet balance after purchase:', newWalletBalance);

    await db`
      UPDATE users 
      SET wallet_balance = ${newWalletBalance}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    // 6. Add stock to portfolio with proper data
    const result = (await db`
      INSERT INTO user_portfolio_stocks 
       (user_id, symbol, company_name, company_logo, initial_price, current_price, quantity, invested_amount, profit_loss, percent_change, status, created_at, updated_at)
      VALUES (
        ${userId}, 
        ${symbol}, 
        ${companyName}, 
        ${companyLogo || ''}, 
        ${livePrice}, 
        ${livePrice}, 
        1, 
        ${livePrice}, 
        0, 
        0, 
        'active', 
        NOW(), 
        NOW()
      )
      RETURNING *
    `) as any[];

    console.log('[v0] Stock purchased successfully:', {
      symbol,
      price: livePrice,
      newWalletBalance,
      holding: result[0]
    });

    return NextResponse.json({
      message: `Purchased 1 share of ${symbol} at $${livePrice.toFixed(2)}`,
      holding: result[0],
      newWalletBalance,
      transactionPrice: livePrice
    }, { status: 201 });

  } catch (error) {
    console.error('[v0] Add stock error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}



