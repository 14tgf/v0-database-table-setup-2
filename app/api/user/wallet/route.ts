import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

let sql: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!sql) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sql = neon(dbUrl);
  }
  return sql;
}

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

    const dbSql = getSql();

    // Fetch wallet data from database
    const user = await dbSql(
      `SELECT 
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
      FROM users WHERE id = $1`,
      [userId]
    );

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = user[0];
    console.log('[v0] Raw wallet data:', {
      wallet_balance: userData.wallet_balance,
      type: typeof userData.wallet_balance,
      stock_balance: userData.stock_balance,
      vehicle_balance: userData.vehicle_balance,
      energy_balance: userData.energy_balance,
    });

    // Convert numeric values, handling both string and number types
    const walletBalance = typeof userData.wallet_balance === 'string' 
      ? parseFloat(userData.wallet_balance) 
      : Number(userData.wallet_balance) || 0;
    
    const stockBalance = typeof userData.stock_balance === 'string' 
      ? parseFloat(userData.stock_balance) 
      : Number(userData.stock_balance) || 0;
    
    const vehicleBalance = typeof userData.vehicle_balance === 'string' 
      ? parseFloat(userData.vehicle_balance) 
      : Number(userData.vehicle_balance) || 0;
    
    const energyBalance = typeof userData.energy_balance === 'string' 
      ? parseFloat(userData.energy_balance) 
      : Number(userData.energy_balance) || 0;

    const walletData = {
      userId: userData.id,
      balance: walletBalance,
      stockBalance: stockBalance,
      vehicleBalance: vehicleBalance,
      energyBalance: energyBalance,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalInvested: 0,
      currency: userData.preferred_currency || 'USD',
      portfolioValue: walletBalance,
      investmentCount: 0,
      stockHoldings: 0,
      teslaVehicles: 0,
    };

    console.log('[v0] Parsed wallet data:', walletData);

    return NextResponse.json({
      success: true,
      data: walletData,
    });
  } catch (error) {
    console.error('[v0] Wallet fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch wallet data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
