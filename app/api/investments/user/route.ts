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

    const db = sql();

    // Fetch user's investments with plan details
    const investments = (await db`
      SELECT 
        ui.id,
        ui.amount,
        ui.roi_percent,
        ui.profit_earned,
        ui.status,
        ui.invested_at,
        ui.maturity_date,
        ui.claimed_at,
        ip.name as plan_name,
        ip.duration_days
      FROM user_investments ui
      JOIN investment_plans ip ON ui.plan_id = ip.id
      WHERE ui.user_id = ${userId}
      ORDER BY ui.invested_at DESC
    `) as any[];

    // Calculate totals
    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    const totalProfit = investments.reduce((sum, inv) => sum + parseFloat(inv.profit_earned || 0), 0);
    const activeCount = investments.filter(inv => inv.status === 'active').length;

    return NextResponse.json({
      success: true,
      data: {
        investments,
        totals: {
          totalInvested,
          totalProfit,
          activeCount,
          averageRoi: activeCount > 0 ? (totalProfit / totalInvested * 100).toFixed(2) : 0,
        },
      },
    });
  } catch (error) {
    console.error('[v0] Fetch user investments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investments' },
      { status: 500 }
    );
  }
}
