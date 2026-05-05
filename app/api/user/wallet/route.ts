import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { sql } from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

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

    const db = sql();

    // Fetch wallet data from database
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
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = user[0];
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
      investmentCount: 0,
      stockHoldings: 0,
      teslaVehicles: 0,
    };

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
