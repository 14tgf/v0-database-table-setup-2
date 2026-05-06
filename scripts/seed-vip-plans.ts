import { sql } from '../lib/db';

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
    ],
  },
  {
    name: 'Private Access',
    tier_level: 3,
    price: 499.00,
    duration_days: 366,
    description: 'Premium tier with exclusive access',
    benefits: [
      '8.00% off car purchases',
      '5.00% investment bonus',
      'Personal account manager',
      '5x giveaway entries',
      'Private member-only events',
      'All Silver benefits',
    ],
  },
  {
    name: 'Platinum',
    tier_level: 4,
    price: 999.00,
    duration_days: 366,
    description: 'Ultimate VIP experience with all premium benefits',
    benefits: [
      '10.00% off car purchases',
      '10.00% investment bonus',
      'Dedicated 24/7 concierge service',
      'Unlimited giveaway entries',
      'Invitations to exclusive platinum events',
      'Custom benefits negotiation',
      'All Private Access benefits',
    ],
  },
];

async function main() {
  try {
    console.log('[v0] Starting VIP seeding...');
    
    // Check if table exists
    try {
      const checkTable = await sql`SELECT COUNT(*) as count FROM vip_plans`;
      console.log('[v0] Table exists. Current plans:', checkTable[0].count);
    } catch (err: any) {
      if (err.message.includes('does not exist')) {
        console.error('[v0] ERROR: vip_plans table does not exist!');
        console.error('[v0] You must run the schema initialization first.');
        process.exit(1);
      }
      throw err;
    }

    // Delete existing plans
    console.log('[v0] Clearing existing VIP plans...');
    const deleteResult = await sql`DELETE FROM vip_plans`;
    console.log('[v0] Deleted existing plans');

    // Insert each VIP tier
    console.log('[v0] Inserting VIP tiers...');
    for (const tier of VIP_TIERS) {
      console.log(`[v0]   → Inserting: ${tier.name}`);
      
      const result = await sql`
        INSERT INTO vip_plans (
          name,
          tier_level,
          description,
          benefits,
          price,
          duration_days,
          active,
          created_at,
          updated_at
        )
        VALUES (
          ${tier.name},
          ${tier.tier_level},
          ${tier.description},
          ${tier.benefits},
          ${tier.price},
          ${tier.duration_days},
          true,
          NOW(),
          NOW()
        )
        RETURNING id, name, tier_level
      `;
      
      console.log(`[v0]     ✓ Inserted ${tier.name} (ID: ${result[0].id})`);
    }

    // Verify
    const verification = await sql`
      SELECT id, name, tier_level, active, price FROM vip_plans ORDER BY tier_level
    `;

    console.log('\n[v0] ✓ VIP Plans Successfully Seeded!\n');
    console.log('Plans in database:');
    verification.forEach((plan: any) => {
      console.log(`  - ${plan.name} (Tier ${plan.tier_level}): $${plan.price}/year - Active: ${plan.active}`);
    });
    console.log(`\nTotal: ${verification.length} VIP plans\n`);

    process.exit(0);
  } catch (error: any) {
    console.error('\n[v0] ✗ Seeding failed!\n');
    console.error('Error:', error.message);
    if (error.stack) console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main();
