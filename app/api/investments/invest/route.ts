import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { sql } from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Invest endpoint - Starting');
    const cookie = request.cookies.get('auth_token')?.value;

    if (!cookie) {
      console.error('[v0] Invest endpoint - No auth token');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(cookie, JWT_SECRET);
    const userId = payload.sub as string;
    console.log('[v0] Invest endpoint - User ID:', userId);

    const body = await request.json();
    const { planId, amount } = body;
    console.log('[v0] Invest endpoint - Plan ID:', planId, 'Amount:', amount);

    if (!planId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const investmentAmount = parseFloat(amount);

    const db = sql();

    // 1. Get the investment plan
    console.log('[v0] Invest endpoint - Fetching plan:', planId);
    const plan = (await db`
      SELECT * FROM investment_plans WHERE id = ${planId} AND status = 'active'
    `) as any[];

    console.log('[v0] Invest endpoint - Plan found:', plan.length > 0, plan[0]);

    if (plan.length === 0) {
      return NextResponse.json(
        { error: 'Investment plan not found' },
        { status: 404 }
      );
    }

    const investmentPlan = plan[0];
    const minAmount = parseFloat(investmentPlan.min_investment);
    const maxAmount = investmentPlan.max_investment ? parseFloat(investmentPlan.max_investment) : Infinity;
    const expectedReturn = parseFloat(investmentPlan.expected_return) || 0;
    const durationMonths = investmentPlan.duration_months || 12;

    // 2. Validate investment amount
    if (investmentAmount < minAmount || investmentAmount > maxAmount) {
      console.log('[v0] Invest endpoint - Invalid amount range');
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
    console.log('[v0] Invest endpoint - Checking user wallet');
    const user = (await db`
      SELECT wallet_balance FROM users WHERE id = ${userId}
    `) as any[];

    if (user.length === 0) {
      console.error('[v0] Invest endpoint - User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const walletBalance = parseFloat(user[0].wallet_balance) || 0;
    console.log('[v0] Invest endpoint - Wallet balance:', walletBalance);

    if (walletBalance < investmentAmount) {
      console.log('[v0] Invest endpoint - Insufficient balance');
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
    const maturityDate = new Date(investedAt.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);

    // 5. Deduct from wallet
    console.log('[v0] Invest endpoint - Deducting from wallet');
    const newWalletBalance = walletBalance - investmentAmount;
    await db`
      UPDATE users 
      SET wallet_balance = ${newWalletBalance}, updated_at = NOW()
      WHERE id = ${userId}
    `;
    console.log('[v0] Invest endpoint - Wallet updated to:', newWalletBalance);

    // 6. Create investment record
    console.log('[v0] Invest endpoint - Creating investment record');
    const result = (await db`
      INSERT INTO user_investments 
        (user_id, plan_id, amount, returns, status)
      VALUES (${userId}, ${planId}, ${investmentAmount}, ${expectedReturn}, 'active')
      RETURNING *
    `) as any[];

    const investment = result[0];
    console.log('[v0] Invest endpoint - Investment created:', investment.id);

    return NextResponse.json(
      {
        success: true,
        message: `Invested $${investmentAmount.toFixed(2)} in ${investmentPlan.plan_name}`,
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
