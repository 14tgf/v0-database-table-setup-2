import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Initializing KYC tables...');

    // Get the database client
    const db = sql();

    // Create KYC Submissions Table
    await db`
      CREATE TABLE IF NOT EXISTS kyc_submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        full_name VARCHAR(255) NOT NULL,
        id_type VARCHAR(50) NOT NULL,
        id_number VARCHAR(100) NOT NULL,
        id_front_image TEXT,
        id_back_image TEXT,
        selfie_image TEXT,
        address_document TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        rejection_reason TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes for better query performance
    await db`CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_id ON kyc_submissions(user_id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON kyc_submissions(status)`;
    await db`CREATE INDEX IF NOT EXISTS idx_kyc_submissions_created_at ON kyc_submissions(created_at DESC)`;
    await db`CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_status ON kyc_submissions(user_id, status)`;

    console.log('[v0] KYC tables created successfully');

    return NextResponse.json({
      success: true,
      message: 'KYC tables initialized',
    });
  } catch (error) {
    console.error('[v0] KYC table initialization error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'KYC table initialization failed' 
      },
      { status: 500 }
    );
  }
}
