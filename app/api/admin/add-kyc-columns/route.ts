import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    console.log('[v0] Adding KYC status columns to users table...');

    const db = sql();

    // Add kyc_status column if it doesn't exist
    await db`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(50) DEFAULT 'not_started'
    `;
    console.log('[v0] Added kyc_status column');

    // Add verification_status column if it doesn't exist
    await db`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'not_started'
    `;
    console.log('[v0] Added verification_status column');

    console.log('[v0] KYC columns added successfully');

    return NextResponse.json({
      success: true,
      message: 'KYC status columns added to users table',
    });
  } catch (error) {
    console.error('[v0] Error adding KYC columns:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add KYC columns' },
      { status: 500 }
    );
  }
}
