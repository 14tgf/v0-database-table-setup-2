import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { sql } from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { planId, amount } = body;

    if (!planId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const investmentAmount = parseFloat(amount);

    const db = sql();

    // 1. Get the investment plan
    const plan = (await db`
      SELECT * FROM investment_plans WHERE id = ${planId} AND status = 'active'
    `) as any[];

    if (plan.length === 0) {
      return NextResponse.json(
        { error: 'Investment plan not found' },
        { status: 404 }
      );
    }

    const investmentPlan = plan[0];
    const minAmount = parseFloat(investmentPlan.minimum_amount);
    const maxAmount = investmentPlan.maximum_amount ? parseFloat(investmentPlan.maximum_amount) : Infinity;
    const roiPercent = parseFloat(investmentPlan.roi_percent);
    const durationDays = investmentPlan.duration_days;

    // 2. Validate investment amount
    if (investmentAmount < minAmount || investmentAmount > maxAmount) {
      return NextResponse.json(
        {
          error: `Investment amount must be between $${minAmount} and $${maxAmount}`,
          min: minAmount,
          max: maxAmount,
        },
        { status: 400 }
      );
    }

    // 3. Check user wallet balance
    const user = (await db`
      SELECT wallet_balance FROM users WHERE id = ${userId}
    `) as any[];

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const walletBalance = parseFloat(user[0].wallet_balance) || 0;

    if (walletBalance < investmentAmount) {
      return NextResponse.json(
        {
          error: `Insufficient balance. Required: $${investmentAmount.toFixed(2)}, Available: $${walletBalance.toFixed(2)}`,
          required: investmentAmount,
          available: walletBalance,
        },
        { status: 402 }
      );
    }

    // 4. Calculate maturity date
    const investedAt = new Date();
    const maturityDate = new Date(investedAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // 5. Deduct from wallet
    const newWalletBalance = walletBalance - investmentAmount;
    await db`
      UPDATE users 
      SET wallet_balance = ${newWalletBalance}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    // 6. Create investment record
    const result = (await db`
      INSERT INTO user_investments 
        (user_id, plan_id, amount, roi_percent, status, maturity_date)
      VALUES (${userId}, ${planId}, ${investmentAmount}, ${roiPercent}, 'active', ${maturityDate.toISOString()})
      RETURNING *
    `) as any[];

    const investment = result[0];

    return NextResponse.json(
      {
        success: true,
        message: `Invested $${investmentAmount.toFixed(2)} in ${investmentPlan.name}`,
        investment,
        newWalletBalance,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Investment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
