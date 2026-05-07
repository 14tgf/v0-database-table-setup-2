import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Initializing giveaway tables...');
    const db = sql();

    // Create giveaway_entries table
    await db`
      CREATE TABLE IF NOT EXISTS giveaway_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        giveaway_id VARCHAR(100) NOT NULL,
        vip_membership_id UUID REFERENCES user_vip_memberships(id),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes
    await db`CREATE INDEX IF NOT EXISTS idx_giveaway_entries_user_id ON giveaway_entries(user_id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_giveaway_entries_giveaway_id ON giveaway_entries(giveaway_id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_giveaway_entries_user_giveaway ON giveaway_entries(user_id, giveaway_id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_giveaway_entries_created_at ON giveaway_entries(created_at)`;

    console.log('[v0] Giveaway tables created successfully');

    return NextResponse.json({
      success: true,
      message: 'Giveaway tables initialized',
    });
  } catch (error) {
    console.error('[v0] Giveaway initialization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Giveaway initialization failed' },
      { status: 500 }
    );
  }
}
