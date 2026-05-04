import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Starting database migration...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not set');
    }

    const sql = neon(process.env.DATABASE_URL);

    // Check if preferred_currency column exists
    console.log('[v0] Checking if preferred_currency column exists...');
    const checkColumn = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='users' AND column_name='preferred_currency'
    `;

    if (checkColumn && checkColumn.length > 0) {
      console.log('[v0] Column already exists');
      return NextResponse.json({
        success: true,
        message: 'Column already exists',
      });
    }

    console.log('[v0] Adding preferred_currency column...');
    await sql`
      ALTER TABLE users 
      ADD COLUMN preferred_currency VARCHAR(10) DEFAULT 'USD'
    `;

    console.log('[v0] Migration completed successfully');
    return NextResponse.json({
      success: true,
      message: 'Migration completed - preferred_currency column added',
    });
  } catch (error) {
    console.error('[v0] Migration error:', error);
    return NextResponse.json(
      { 
        error: 'Migration failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
