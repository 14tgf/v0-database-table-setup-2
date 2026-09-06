import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const userId = params.userId;

    const stocks = await sql`
      SELECT 
        ups.id,
        c.symbol,
        c.name as company_name,
        ups.shares,
        ups.average_cost,
        ups.current_value,
        ups.gain_loss,
        ups.created_at
      FROM user_portfolio_stocks ups
      LEFT JOIN companies c ON ups.company_id = c.id
      WHERE ups.user_id = ${userId} AND ups.shares > 0
      ORDER BY ups.updated_at DESC
    `;

    return NextResponse.json(stocks);
  } catch (error) {
    console.error('[Portfolio API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
