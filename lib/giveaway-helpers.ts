import { sql } from './db';

export interface GiveawayEligibility {
  isEligible: boolean;
  hasVipMembership: boolean;
  isKycVerified: boolean;
  canEnterAgain: boolean;
  reason?: string;
  daysUntilEligible?: number;
}

/**
 * Check if user is eligible to enter giveaway
 * Rules:
 * 1. Must have active VIP membership
 * 2. KYC status must be verified
 * 3. Has not entered in the last 30 days
 */
export async function checkGiveawayEligibility(
  userId: string,
  giveawayId: string
): Promise<GiveawayEligibility> {
  try {
    console.log('[v0] checkGiveawayEligibility - Starting for user:', userId, 'giveaway:', giveawayId);
    const db = sql();

    // Check 1: Active VIP membership
    console.log('[v0] checkGiveawayEligibility - Checking VIP membership');
    const vipCheck = await db`
      SELECT id FROM user_vip_memberships
      WHERE user_id = ${userId} 
      AND status = 'active'
      AND expires_at > NOW()
      LIMIT 1
    `;
    const vipArray = Array.isArray(vipCheck) ? vipCheck : (vipCheck?.rows || []);
    const hasVip = vipArray.length > 0;
    console.log('[v0] checkGiveawayEligibility - VIP check result:', { hasVip, vipArrayLength: vipArray.length });

    // Check 2: KYC verified
    console.log('[v0] checkGiveawayEligibility - Checking KYC status');
    const kycCheck = await db`
      SELECT kyc_status FROM users WHERE id = ${userId}
    `;
    const kycArray = Array.isArray(kycCheck) ? kycCheck : (kycCheck?.rows || []);
    console.log('[v0] checkGiveawayEligibility - KYC check result:', { kycArray, length: kycArray.length });
    const isKycVerified = kycArray.length > 0 && kycArray[0].kyc_status === 'approved';
    console.log('[v0] checkGiveawayEligibility - KYC verified:', isKycVerified, 'status:', kycArray[0]?.kyc_status);

    // Check 3: Last entry within 30 days
    console.log('[v0] checkGiveawayEligibility - Checking last entry');
    const lastEntry = await db`
      SELECT created_at FROM giveaway_entries
      WHERE user_id = ${userId} AND giveaway_id = ${giveawayId}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const lastEntryArray = Array.isArray(lastEntry) ? lastEntry : (lastEntry?.rows || []);
    console.log('[v0] checkGiveawayEligibility - Last entry result:', { lastEntryLength: lastEntryArray.length });

    let canEnterAgain = true;
    let daysUntilEligible = 0;

    if (lastEntryArray.length > 0) {
      const lastEntryDate = new Date(lastEntryArray[0].created_at);
      const now = new Date();
      const daysSinceEntry = Math.floor((now.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceEntry < 30) {
        canEnterAgain = false;
        daysUntilEligible = 30 - daysSinceEntry;
      }
      console.log('[v0] checkGiveawayEligibility - Entry cooldown:', { daysSinceEntry, canEnterAgain, daysUntilEligible });
    }

    // Determine overall eligibility
    const isEligible = hasVip && isKycVerified && canEnterAgain;
    console.log('[v0] checkGiveawayEligibility - Final eligibility:', { isEligible, hasVip, isKycVerified, canEnterAgain });

    // Determine reason for ineligibility
    let reason: string | undefined;
    if (!hasVip) {
      reason = 'No active VIP membership';
    } else if (!isKycVerified) {
      reason = 'Account not verified';
    } else if (!canEnterAgain) {
      reason = `Giveaway already entered within 30 days`;
    }

    return {
      isEligible,
      hasVipMembership: hasVip,
      isKycVerified,
      canEnterAgain,
      reason,
      daysUntilEligible: daysUntilEligible > 0 ? daysUntilEligible : undefined,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('[v0] Giveaway eligibility check error:', errorMsg);
    console.error('[v0] Giveaway eligibility check full error:', error);
    return {
      isEligible: false,
      hasVipMembership: false,
      isKycVerified: false,
      canEnterAgain: false,
      reason: `Error checking eligibility: ${errorMsg}`,
    };
  }
}

/**
 * Check if user has already entered this giveaway
 */
export async function hasEnteredGiveaway(userId: string, giveawayId: string): Promise<boolean> {
  try {
    const db = sql();
    const result = await db`
      SELECT id FROM giveaway_entries
      WHERE user_id = ${userId} AND giveaway_id = ${giveawayId}
      LIMIT 1
    `;
    const resultArray = Array.isArray(result) ? result : (result?.rows || []);
    return resultArray.length > 0;
  } catch (error) {
    console.error('[v0] Check entered giveaway error:', error);
    return false;
  }
}
