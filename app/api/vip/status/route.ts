import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Get active VIP membership
    const membership = await sql`
      SELECT 
        uvm.id,
        uvm.user_id,
        uvm.vip_plan_id,
        uvm.tier_level,
        uvm.status,
        uvm.started_at,
        uvm.expires_at,
        vp.name,
        vp.description,
        vp.benefits,
        vp.price
      FROM user_vip_memberships uvm
      JOIN vip_plans vp ON uvm.vip_plan_id = vp.id
      WHERE uvm.user_id = ${userId} AND uvm.status = 'active'
      ORDER BY uvm.created_at DESC
      LIMIT 1
    `;

    if (membership.length === 0) {
      return NextResponse.json(
        {
          has_active_membership: false,
          membership: null,
        },
        { status: 200 }
      );
    }

    const active = new Date() < new Date(membership[0].expires_at);

    return NextResponse.json(
      {
        has_active_membership: active,
        membership: active ? membership[0] : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] VIP status fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch VIP status' },
      { status: 500 }
    );
  }
}
