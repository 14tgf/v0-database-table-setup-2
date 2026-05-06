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

    // Seed VIP plans
    for (const tier of VIP_TIERS) {
      try {
        console.log(`[v0] Inserting VIP plan: ${tier.name}`);
        
        // Format benefits as proper TEXT array for PostgreSQL
        const benefitsArray = tier.benefits;
        
        await sql`
          INSERT INTO vip_plans (name, tier_level, description, benefits, price, duration_days, active)
          VALUES (
            ${tier.name},
            ${tier.tier_level},
            ${tier.description},
            ${benefitsArray}::text[],
            ${tier.price},
            ${tier.duration_days},
            true
          )
          ON CONFLICT (name) DO NOTHING
        `;
        console.log(`[v0] Successfully inserted VIP plan: ${tier.name}`);
      } catch (error) {
        console.error(`[v0] Error inserting ${tier.name}:`, error);
      }
    }

    // Verify insertion
    const verifyResult = await sql`SELECT COUNT(*) as count FROM vip_plans WHERE active = true`;
    console.log('[v0] VIP plans verification:', verifyResult);

    console.log('[v0] VIP plans seeded successfully');

    return NextResponse.json({
      success: true,
      message: 'VIP plans seeded',
      count: VIP_TIERS.length,
    });
  } catch (error) {
    console.error('[v0] VIP seeding error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'VIP seeding failed' },
      { status: 500 }
    );
  }
}
