import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    // Get user's investments
    const investments = await sql`
      SELECT 
        ui.id,
        ui.plan_id,
        ui.amount,
        ui.returns,
        ui.status,
        ui.created_at,
        ip.plan_name,
        ip.expected_return,
        ip.duration_months
      FROM user_investments ui
      LEFT JOIN investment_plans ip ON ui.plan_id = ip.id
      WHERE ui.user_id = ${userId}
      ORDER BY ui.created_at DESC
    `;

    return NextResponse.json(investments);
  } catch (error) {
    console.error('[User Investments API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investments' },
      { status: 500 }
    );
  }
}
