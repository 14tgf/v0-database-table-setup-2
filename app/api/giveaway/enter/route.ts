import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { checkGiveawayEligibility } from '@/lib/giveaway-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, giveaway_id } = body;

    if (!user_id || !giveaway_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = sql();

    // Check eligibility
    const eligibility = await checkGiveawayEligibility(user_id, giveaway_id);

    if (!eligibility.isEligible) {
      return NextResponse.json(
        {
          success: false,
          eligible: false,
          message: eligibility.reason,
          daysUntilEligible: eligibility.daysUntilEligible,
        },
        { status: 403 }
      );
    }

    // Get active VIP membership for this user
    const vipMembership = await db`
      SELECT id FROM user_vip_memberships
      WHERE user_id = ${user_id} 
      AND status = 'active'
      AND expires_at > NOW()
      LIMIT 1
    `;
    const vipArray = Array.isArray(vipMembership) ? vipMembership : (vipMembership?.rows || []);

    if (vipArray.length === 0) {
      return NextResponse.json(
        { error: 'No active VIP membership found' },
        { status: 400 }
      );
    }

    // Create giveaway entry
    const entry = await db`
      INSERT INTO giveaway_entries (
        user_id,
        giveaway_id,
        vip_membership_id,
        status
      )
      VALUES (${user_id}, ${giveaway_id}, ${vipArray[0].id}, 'pending')
      RETURNING id, created_at
    `;

    const entryArray = Array.isArray(entry) ? entry : (entry?.rows || []);
    if (!entryArray || entryArray.length === 0) {
      throw new Error('Failed to create giveaway entry');
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully entered the giveaway',
      entry: entryArray[0],
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Enter giveaway error:', msg);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}

/**
 * GET - Check user's giveaway eligibility
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('user_id');
    const giveawayId = request.nextUrl.searchParams.get('giveaway_id');

    if (!userId || !giveawayId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const { checkGiveawayEligibility } = await import('@/lib/giveaway-helpers');
    const eligibility = await checkGiveawayEligibility(userId, giveawayId);

    return NextResponse.json({
      success: true,
      eligibility,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Check eligibility error:', msg);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
