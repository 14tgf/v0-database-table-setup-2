import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const VIP_TIERS = [
  {
    name: 'Bronze',
    tier_level: 1,
    price: 99.00,
    duration_days: 366,
    description: 'Essential VIP benefits for new members',
    benefits: [
      '3.00% off car purchases',
      '1.00% investment bonus',
      'Priority email support',
      'Exclusive member newsletter',
      'Early access to new inventory',
    ],
  },
  {
    name: 'Silver',
    tier_level: 2,
    price: 249.00,
    duration_days: 366,
    description: 'Enhanced benefits with greater rewards',
    benefits: [
      '5.00% off car purchases',
      '2.00% investment bonus',
      '2x giveaway entries',
      'Priority customer support',
      'All Bronze benefits',
      '24/7 phone support',
      'Invitation to exclusive events',
      'Quarterly market insights report',
    ],
  },
  {
    name: 'Private Access',
    tier_level: 3,
    price: 5000.00,
    duration_days: 366,
    description: 'Premium tier with exclusive opportunities',
    benefits: [
      '7.00% off car purchases',
      '10.00% investment bonus',
      '3x giveaway entries',
      'Priority customer support',
      'Access to exclusive opportunities',
      'Advanced AI & robotics insights',
      'Private investment deals',
      'Priority Tesla vehicle allocations',
      'VIP client priority support',
      'Not available to all clients',
    ],
  },
  {
    name: 'Platinum',
    tier_level: 4,
    price: 999.00,
    duration_days: 366,
    description: 'Ultimate VIP experience with maximum benefits',
    benefits: [
      '10.00% off car purchases',
      '5.00% investment bonus',
      '5x giveaway entries',
      'Priority customer support',
      'All Gold benefits',
      'Concierge service',
      'Personalized investment strategy',
      'Annual Tesla accessory package',
      'Exclusive Tesla events invitation',
      'White-glove delivery service',
    ],
  },
];

export async function POST(request: Request) {
  try {
    console.log('[v0] Seeding VIP plans...');

    // Get the database client
    const db = sql();

    // Clear existing active plans first (optional, but helps with testing)
    try {
      console.log('[v0] Attempting to delete existing plans...');
      await db`DELETE FROM vip_plans`;
      console.log('[v0] Cleared existing VIP plans');
    } catch (e) {
      console.error('[v0] Error during delete:', e);
      // Don't throw, continue
    }

    // Verify the table is empty before inserting
    const preCheckResult = await db`SELECT COUNT(*) as count FROM vip_plans`;
    const preCheckArray = Array.isArray(preCheckResult) ? preCheckResult : (preCheckResult?.rows || []);
    console.log('[v0] Pre-insert check - Plans in DB:', preCheckArray[0]?.count || 0);

    // Seed each VIP plan individually with explicit logging
    for (const tier of VIP_TIERS) {
      try {
        console.log(`[v0] Inserting VIP plan: ${tier.name} (tier ${tier.tier_level})`);
        
        const result = await db`
          INSERT INTO vip_plans (
            name, 
            tier_level, 
            description, 
            benefits, 
            price, 
            duration_days, 
            active
          )
          VALUES (
            ${tier.name},
            ${tier.tier_level},
            ${tier.description},
            ${tier.benefits},
            ${tier.price},
            ${tier.duration_days},
            true
          )
          RETURNING id, name, tier_level, active
        `;
        
        // Handle both array and non-array responses
        const insertedPlan = Array.isArray(result) ? result[0] : (result?.rows?.[0] || result);
        console.log(`[v0] Successfully inserted ${tier.name}:`, insertedPlan);
        
        // Verify this specific insert worked
        const checkAfterInsert = await db`SELECT COUNT(*) as count FROM vip_plans WHERE name = ${tier.name}`;
        const checkArray = Array.isArray(checkAfterInsert) ? checkAfterInsert : (checkAfterInsert?.rows || []);
        console.log(`[v0] After insert - Count for ${tier.name}:`, checkArray[0]?.count || 0);
      } catch (error) {
        console.error(`[v0] Error inserting ${tier.name}:`, error);
        throw error;
      }
    }

    // Verify all plans were inserted (check all, not just active)
    const allPlansResult = await db`
      SELECT id, name, tier_level, active, created_at FROM vip_plans ORDER BY tier_level
    `;
    
    // Handle both array and non-array responses from the sql client
    const plansArray = Array.isArray(allPlansResult) ? allPlansResult : (allPlansResult?.rows || []);
    
    console.log('[v0] Verification - ALL VIP plans in database:', {
      type: typeof allPlansResult,
      isArray: Array.isArray(allPlansResult),
      count: plansArray.length,
      plans: plansArray.map((p: any) => ({ name: p.name, tier: p.tier_level, active: p.active })),
    });

    if (plansArray.length === 0) {
      throw new Error('Seed operation completed but no plans found in database. Plans may not have been inserted.');
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${plansArray.length} VIP plans`,
      count: plansArray.length,
      plans: plansArray.map((p: any) => ({ id: p.id, name: p.name, tier_level: p.tier_level, active: p.active })),
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[v0] VIP seeding error:', errorMsg);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to seed VIP plans',
        details: errorMsg,
      },
      { status: 500 }
    );
  }
}
