import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not configured');
  }
  return neon(process.env.DATABASE_URL);
}

// Admin migration endpoint (ideally protected by admin auth)
export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    
    // Basic protection - in production use proper admin auth
    if (adminKey !== process.env.ADMIN_MIGRATION_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = getSql();

    // Add preferred_currency column if it doesn't exist
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10) DEFAULT 'USD'
    `;

    console.log('[v0] Migration: Added preferred_currency column');

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
    });
  } catch (error) {
    console.error('[v0] Migration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Migration failed' },
      { status: 500 }
    );
  }
}
