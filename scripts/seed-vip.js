import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const VIP_TIERS = [
  {
    name: 'Bronze',
    tier_level: 1,
    price: 99.00,
    duration_days: 366,
    description: 'Essential VIP benefits for new members',
    benefits: JSON.stringify([
      '3.00% off car purchases',
      '1.00% investment bonus',
      'Priority email support',
      'Exclusive member newsletter',
      'Early access to new inventory',
    ]),
  },
  {
    name: 'Silver',
    tier_level: 2,
    price: 249.00,
    duration_days: 366,
    description: 'Enhanced benefits with greater rewards',
    benefits: JSON.stringify([
      '5.00% off car purchases',
      '2.00% investment bonus',
      '2x giveaway entries',
      'Priority customer support',
      'All Bronze benefits',
      '24/7 phone support',
      'Invitation to exclusive events',
      'Quarterly market insights report',
    ]),
  },
  {
    name: 'Private Access',
    tier_level: 3,
    price: 5000.00,
    duration_days: 366,
    description: 'Premium tier with exclusive opportunities',
    benefits: JSON.stringify([
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
    ]),
  },
  {
    name: 'Platinum',
    tier_level: 4,
    price: 999.00,
    duration_days: 366,
    description: 'Ultimate VIP experience with maximum benefits',
    benefits: JSON.stringify([
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
    ]),
  },
];

async function seed() {
  try {
    console.log('Starting VIP plans seeding...');

    // First, create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS vip_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL UNIQUE,
        tier_level INTEGER NOT NULL UNIQUE,
        description TEXT,
        benefits TEXT[] NOT NULL DEFAULT '{}',
        price NUMERIC(15, 2) NOT NULL,
        duration_days INTEGER NOT NULL DEFAULT 365,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('VIP plans table created/verified');

    // Clear existing plans
    await sql`DELETE FROM vip_plans`;
    console.log('Cleared existing plans');

    // Insert new plans
    for (const tier of VIP_TIERS) {
      await sql`
        INSERT INTO vip_plans (name, tier_level, description, benefits, price, duration_days, active)
        VALUES (${tier.name}, ${tier.tier_level}, ${tier.description}, ${tier.benefits}::text[], ${tier.price}, ${tier.duration_days}, true)
      `;
      console.log(`Seeded: ${tier.name}`);
    }

    // Verify
    const result = await sql`SELECT COUNT(*) as count FROM vip_plans WHERE active = true`;
    console.log(`Successfully seeded ${result[0].count} VIP plans!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
