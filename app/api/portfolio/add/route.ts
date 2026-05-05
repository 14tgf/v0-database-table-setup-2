import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getStockQuote } from '@/lib/finnhub';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, symbol, companyName, companyLogo } = body;

    console.log('[v0] Portfolio add request:', { userId, symbol, companyName });

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

    // 1. Get the company share amount from the companies table
    const company = (await db`
      SELECT share_amount FROM companies WHERE symbol = ${symbol}
    `) as any[];

    if (company.length === 0) {
      console.log('[v0] Company not found:', symbol);
      return NextResponse.json(
        { message: 'Company not found in system' },
        { status: 404 }
      );
    }

    const investmentAmount = parseFloat(company[0].share_amount);
    console.log('[v0] Investment amount for', symbol, ':', investmentAmount);

    // 2. Get live stock price from Finnhub
    const liveQuote = await getStockQuote(symbol);
    const currentPrice = liveQuote?.price || 0;
    console.log('[v0] Current stock price:', currentPrice);

    // 3. Check if user already owns this stock
    const existing = (await db`
      SELECT id, quantity, initial_price, invested_amount FROM user_portfolio_stocks 
      WHERE user_id = ${userId} AND symbol = ${symbol} AND status = 'active'
    `) as any[];

    // 4. Get user's wallet balance
    const user = (await db`
      SELECT wallet_balance FROM users WHERE id = ${userId}
    `) as any[];

    if (user.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const walletBalance = parseFloat(user[0].wallet_balance) || 0;
    console.log('[v0] User wallet balance:', walletBalance);

    // 5. Check if user has sufficient funds to invest
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

    // 6. Deduct investment amount from wallet
    const newWalletBalance = walletBalance - investmentAmount;
    await db`
      UPDATE users 
      SET wallet_balance = ${newWalletBalance}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    let result;

    if (existing.length > 0) {
      // User already owns this stock - UPDATE the holding (add to quantity)
      const existingHolding = existing[0];
      const totalQuantity = existingHolding.quantity + 1;
      const totalInvested = parseFloat(existingHolding.invested_amount) + investmentAmount;
      const newAveragePrice = totalInvested / totalQuantity;

      console.log('[v0] Updating existing stock holding:', {
        symbol,
        oldQuantity: existingHolding.quantity,
        newQuantity: totalQuantity,
        oldInvested: existingHolding.invested_amount,
        newInvested: totalInvested,
        newAveragePrice,
      });

      result = (await db`
        UPDATE user_portfolio_stocks 
        SET 
          quantity = ${totalQuantity},
          invested_amount = ${totalInvested},
          initial_price = ${newAveragePrice},
          current_price = ${currentPrice},
          updated_at = NOW()
        WHERE user_id = ${userId} AND symbol = ${symbol}
        RETURNING *
      `) as any[];
    } else {
      // New stock - INSERT into portfolio
      console.log('[v0] Adding new stock to portfolio:', symbol);

      result = (await db`
        INSERT INTO user_portfolio_stocks 
         (user_id, symbol, company_name, company_logo, initial_price, current_price, quantity, invested_amount, profit_loss, percent_change, status, created_at, updated_at)
        VALUES (
          ${userId}, 
          ${symbol}, 
          ${companyName}, 
          ${companyLogo || ''}, 
          ${currentPrice}, 
          ${currentPrice}, 
          1, 
          ${investmentAmount}, 
          0, 
          0, 
          'active', 
          NOW(), 
          NOW()
        )
        RETURNING *
      `) as any[];
    }

    console.log('[v0] Stock purchase completed successfully:', {
      symbol,
      invested: investmentAmount,
      currentPrice,
      newWalletBalance,
      wasExisting: existing.length > 0,
    });

    return NextResponse.json(
      {
        message: `Invested $${investmentAmount.toFixed(2)} in ${symbol}`,
        holding: result[0],
        newWalletBalance,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Add stock error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}


