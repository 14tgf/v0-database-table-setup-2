import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const plans = await sql`
      SELECT 
        id, 
        name, 
        tier_level, 
        description, 
        benefits, 
        price, 
        duration_days,
        active,
        created_at,
        updated_at
      FROM vip_plans
      WHERE active = true
      ORDER BY tier_level ASC
    `;

    return NextResponse.json(plans, { status: 200 });
  } catch (error) {
    console.error('[v0] VIP plans fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch VIP plans' },
      { status: 500 }
    );
  }
}
