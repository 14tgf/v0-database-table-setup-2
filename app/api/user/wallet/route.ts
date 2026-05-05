import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { sql } from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get('auth_token')?.value;

    console.log('[v0] WALLET API - Request received:', {
      hasCookie: !!cookie,
      timestamp: new Date().toISOString(),
    });

    if (!cookie) {
      console.error('[v0] WALLET API - No auth token');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(cookie, JWT_SECRET);
    const userId = payload.sub as string;

    console.log('[v0] WALLET API - userId from token:', userId);

    if (!userId) {
      console.error('[v0] WALLET API - Invalid token, no userId');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const db = sql();

    // Fetch wallet data from database
    console.log('[v0] WALLET API - Fetching user data');
    const user = (await db`
      SELECT 
        id,
        email,
        full_name,
        wallet_balance,
        stock_balance,
        vehicle_balance,
        energy_balance,
        preferred_currency,
        account_type,
        status
      FROM users WHERE id = ${userId}
    `) as any[];

    if (!user || user.length === 0) {
      console.error('[v0] WALLET API - User not found:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = user[0];
    console.log('[v0] WALLET API - User data loaded:', {
      id: userData.id,
      email: userData.email,
      walletBalance: userData.wallet_balance,
    });

    // Get investment count
    let investmentCount = 0;
    try {
      console.log('[v0] WALLET API - Counting investments');
      const investmentCountResult = (await db`
        SELECT COUNT(*) as count FROM user_investments WHERE user_id = ${userId} AND status = 'active'
      `) as any[];
      investmentCount = investmentCountResult[0]?.count || 0;
      console.log('[v0] WALLET API - Investment count:', investmentCount);
    } catch (err) {
      console.error('[v0] WALLET API - Error counting investments:', err);
      investmentCount = 0;
    }

    // Get stock holdings count - FIX: Use status = 'active' instead of quantity > 0
    let stockHoldingsCount = 0;
    try {
      console.log('[v0] WALLET API - Fetching stock holdings');
      
      // First, get ALL stocks for debugging
      const allStocksResult = (await db`
        SELECT id, symbol, quantity, status FROM user_portfolio_stocks WHERE user_id = ${userId}
      `) as any[];
      console.log('[v0] WALLET API - All stocks for user:', {
        count: allStocksResult.length,
        stocks: allStocksResult.map(s => ({ symbol: s.symbol, quantity: s.quantity, status: s.status }))
      });

      // Now count ACTIVE stocks
      const stockCountResult = (await db`
        SELECT COUNT(*) as count FROM user_portfolio_stocks WHERE user_id = ${userId} AND status = 'active'
      `) as any[];
      stockHoldingsCount = stockCountResult[0]?.count || 0;
      console.log('[v0] WALLET API - Active stock holdings count:', {
        count: stockHoldingsCount,
        rawResult: stockCountResult,
      });
    } catch (err) {
      console.error('[v0] WALLET API - Error counting stocks:', err);
      stockHoldingsCount = 0;
    }

    const walletBalance = typeof userData.wallet_balance === 'string'
      ? parseFloat(userData.wallet_balance)
      : Number(userData.wallet_balance);
    
    const stockBalance = typeof userData.stock_balance === 'string'
      ? parseFloat(userData.stock_balance)
      : Number(userData.stock_balance);
    
    const vehicleBalance = typeof userData.vehicle_balance === 'string'
      ? parseFloat(userData.vehicle_balance)
      : Number(userData.vehicle_balance);
    
    const energyBalance = typeof userData.energy_balance === 'string'
      ? parseFloat(userData.energy_balance)
      : Number(userData.energy_balance);

    const walletData = {
      userId: userData.id,
      balance: walletBalance || 0,
      stockBalance: stockBalance || 0,
      vehicleBalance: vehicleBalance || 0,
      energyBalance: energyBalance || 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalInvested: 0,
      currency: userData.preferred_currency || 'USD',
      portfolioValue: walletBalance || 0,
      investmentCount: investmentCount,
      stockHoldings: stockHoldingsCount,
      teslaVehicles: 0,
    };

    console.log('[v0] WALLET API - Final wallet data:', walletData);

    return NextResponse.json({
      success: true,
      data: walletData,
    });
  } catch (error) {
    console.error('[v0] WALLET API - Catch error:', {
      error,
      errorMsg: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch wallet data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
