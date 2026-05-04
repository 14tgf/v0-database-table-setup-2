import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

const sql = neon(process.env.DATABASE_URL || '');

export async function GET(request: NextRequest) {
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

    // Fetch user's portfolio
    const stocks = await sql.query(
      `SELECT 
        id, 
        symbol, 
        company_name, 
        company_logo, 
        initial_price, 
        current_price, 
        quantity,
        invested_amount,
        profit_loss,
        percent_change,
        status,
        created_at,
        updated_at
      FROM user_portfolio_stocks 
      WHERE user_id = $1 AND status = $2
      ORDER BY created_at DESC`,
      [userId, 'active']
    );

    // Calculate portfolio metrics
    let totalInvested = 0;
    let totalCurrentValue = 0;
    let totalProfitLoss = 0;
    const winningStocks = stocks.filter((s: any) => parseFloat(s.profit_loss) > 0).length;
    const losingStocks = stocks.filter((s: any) => parseFloat(s.profit_loss) < 0).length;

    stocks.forEach((stock: any) => {
      totalInvested += parseFloat(stock.invested_amount) || 0;
      const currentValue = (parseFloat(stock.current_price) || 0) * (parseInt(stock.quantity) || 1);
      totalCurrentValue += currentValue;
      totalProfitLoss += parseFloat(stock.profit_loss) || 0;
    });

    const portfolioPercentChange =
      totalInvested > 0 ? ((totalProfitLoss / totalInvested) * 100).toFixed(2) : '0.00';

    return NextResponse.json({
      success: true,
      stocks: stocks.map((stock: any) => ({
        id: stock.id,
        symbol: stock.symbol,
        companyName: stock.company_name,
        companyLogo: stock.company_logo,
        initialPrice: parseFloat(stock.initial_price),
        currentPrice: parseFloat(stock.current_price),
        quantity: stock.quantity,
        investedAmount: parseFloat(stock.invested_amount),
        profitLoss: parseFloat(stock.profit_loss),
        percentChange: parseFloat(stock.percent_change),
        status: stock.status,
        createdAt: stock.created_at,
        updatedAt: stock.updated_at,
      })),
      portfolio: {
        totalStocks: stocks.length,
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        totalCurrentValue: parseFloat(totalCurrentValue.toFixed(2)),
        totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
        portfolioPercentChange: parseFloat(portfolioPercentChange),
        winningStocks,
        losingStocks,
      },
    });
  } catch (error) {
    console.error('[v0] Fetch portfolio error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch portfolio: ${errorMessage}` },
      { status: 500 }
    );
  }
}
