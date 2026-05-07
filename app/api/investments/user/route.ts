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
        ui.returns,
        ui.status,
        ui.created_at,
        ip.plan_name,
        ip.duration_months,
        ip.expected_return
      FROM user_investments ui
      JOIN investment_plans ip ON ui.plan_id = ip.id
      WHERE ui.user_id = ${userId}
      ORDER BY ui.created_at DESC
    `) as any[];

    // Calculate totals
    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
    const activeCount = investments.filter(inv => inv.status === 'active').length;

    // Calculate potential profit based on returns percentage and expected ROI
    const totalPotentialProfit = investments.reduce((sum, inv) => {
      const amount = parseFloat(inv.amount || 0);
      const roiPercent = parseFloat(inv.returns || 0);
      return sum + (amount * roiPercent / 100);
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        investments,
        totals: {
          totalInvested: parseFloat(totalInvested.toFixed(2)),
          totalPotentialProfit: parseFloat(totalPotentialProfit.toFixed(2)),
          activeCount,
        },
      },
    });
  } catch (error) {
    console.error('[v0] Fetch user investments error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch investments' },
      { status: 500 }
    );
  }
}
