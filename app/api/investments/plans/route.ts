import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = sql();

    const plans = (await db`
      SELECT 
        ip.id,
        ip.plan_name,
        ip.description,
        ip.min_investment,
        ip.max_investment,
        ip.expected_return,
        ip.duration_months,
        c.symbol,
        c.name as company_name
      FROM investment_plans ip
      LEFT JOIN companies c ON ip.company_id = c.id
      WHERE ip.status = 'active'
      ORDER BY ip.expected_return ASC
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
