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

    // Fetch wallet data from database
    const user = await sql.query(
      `SELECT 
        id,
        email,
        full_name,
        wallet_balance,
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
    const walletData = {
      userId: userData.id,
      balance: parseFloat(userData.wallet_balance) || 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalInvested: 0,
      currency: userData.preferred_currency || 'USD',
      portfolioValue: parseFloat(userData.wallet_balance) || 0,
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
