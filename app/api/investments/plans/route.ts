import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = sql();

    const plans = (await db`
      SELECT 
        id,
        name,
        description,
        minimum_amount,
        maximum_amount,
        roi_percent,
        duration_days,
        payout_type,
        status
      FROM investment_plans
      WHERE status = 'active'
      ORDER BY roi_percent ASC
    `) as any[];

    return NextResponse.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('[v0] Fetch investment plans error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investment plans' },
      { status: 500 }
    );
  }
}
