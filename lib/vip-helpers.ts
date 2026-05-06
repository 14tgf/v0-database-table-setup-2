import { sql } from './db';

export interface VipStatus {
  isVipEligible: boolean;
  hasActiveMembership: boolean;
  tier: number | null;
  tierName: string | null;
  expiresAt: string | null;
  membership: any | null;
}

/**
 * Check if user has active VIP membership
 * Used for giveaway gating and other features
 */
export async function checkVipEligibility(userId: string): Promise<VipStatus> {
  try {
    const membership = await sql`
      SELECT 
        uvm.id,
        uvm.tier_level,
        uvm.expires_at,
        vp.name,
        vp.benefits
      FROM user_vip_memberships uvm
      JOIN vip_plans vp ON uvm.vip_plan_id = vp.id
      WHERE uvm.user_id = ${userId} 
      AND uvm.status = 'active'
      AND uvm.expires_at > NOW()
      ORDER BY uvm.created_at DESC
      LIMIT 1
    `;

    if (membership.length === 0) {
      return {
        isVipEligible: false,
        hasActiveMembership: false,
        tier: null,
        tierName: null,
        expiresAt: null,
        membership: null,
      };
    }

    const m = membership[0];

    return {
      isVipEligible: true,
      hasActiveMembership: true,
      tier: m.tier_level,
      tierName: m.name,
      expiresAt: m.expires_at,
      membership: m,
    };
  } catch (error) {
    console.error('[v0] VIP eligibility check error:', error);
    return {
      isVipEligible: false,
      hasActiveMembership: false,
      tier: null,
      tierName: null,
      expiresAt: null,
      membership: null,
    };
  }
}

/**
 * Get user's VIP membership details
 */
export async function getUserVipMembership(userId: string) {
  try {
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
      LEFT JOIN vip_plans vp ON uvm.vip_plan_id = vp.id
      WHERE uvm.user_id = ${userId}
      ORDER BY uvm.created_at DESC
      LIMIT 1
    `;

    return membership.length > 0 ? membership[0] : null;
  } catch (error) {
    console.error('[v0] Get VIP membership error:', error);
    return null;
  }
}
