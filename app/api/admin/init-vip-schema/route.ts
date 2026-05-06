import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Hardcoded VIP tiers from the page
const VIP_TIERS = [
  {
    name: 'Bronze',
    tier_level: 1,
    price: 99.00,
    duration_days: 366, // 12.2 months approximation
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
    console.log('[v0] Initializing VIP tables...');

    // Get the database client
    const db = sql();

    // Create VIP Plans table
    await db`
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

    // Create User VIP Memberships table
    await db`
      CREATE TABLE IF NOT EXISTS user_vip_memberships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vip_plan_id UUID NOT NULL REFERENCES vip_plans(id),
        tier_level INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes
    await db`CREATE INDEX IF NOT EXISTS idx_vip_plans_active ON vip_plans(active)`;
    await db`CREATE INDEX IF NOT EXISTS idx_vip_plans_tier_level ON vip_plans(tier_level)`;
    await db`CREATE INDEX IF NOT EXISTS idx_user_vip_memberships_user_id ON user_vip_memberships(user_id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_user_vip_memberships_status ON user_vip_memberships(status)`;
    await db`CREATE INDEX IF NOT EXISTS idx_user_vip_memberships_expires_at ON user_vip_memberships(expires_at)`;

    console.log('[v0] VIP tables created successfully');

    return NextResponse.json({
      success: true,
      message: 'VIP tables initialized',
    });
  } catch (error) {
    console.error('[v0] VIP schema initialization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'VIP schema initialization failed' },
      { status: 500 }
    );
  }
}
