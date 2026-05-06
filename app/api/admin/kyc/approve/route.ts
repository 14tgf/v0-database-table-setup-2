import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  return neon(process.env.DATABASE_URL);
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    const { kyc_id, action, userId } = body;

    if (!kyc_id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sql = getSql();

    // Get KYC submission details
    const kycResult = await sql`SELECT * FROM kyc_submissions WHERE id = ${kyc_id}`;
    if (!kycResult || kycResult.length === 0) {
      return NextResponse.json({ error: 'KYC submission not found' }, { status: 404 });
    }

    const kycSubmission = kycResult[0];

    if (action === 'approve') {
      // Update KYC submission
      await sql`UPDATE kyc_submissions SET status = 'approved', reviewed_by = ${userId || null}, reviewed_at = NOW(), updated_at = NOW() WHERE id = ${kyc_id}`;
      
      // Update user verification status
      await sql`UPDATE users SET kyc_status = 'approved', verification_status = 'verified', updated_at = NOW() WHERE id = ${kycSubmission.user_id}`;

      return NextResponse.json({ success: true, message: 'KYC submission approved' });
    } else if (action === 'reject') {
      const { rejection_reason } = body;
      
      // Update KYC submission
      await sql`UPDATE kyc_submissions SET status = 'rejected', rejection_reason = ${rejection_reason || null}, reviewed_by = ${userId || null}, reviewed_at = NOW(), updated_at = NOW() WHERE id = ${kyc_id}`;
      
      // Update user verification status
      await sql`UPDATE users SET kyc_status = 'rejected', verification_status = 'rejected', updated_at = NOW() WHERE id = ${kycSubmission.user_id}`;

      return NextResponse.json({ success: true, message: 'KYC submission rejected' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error approving KYC submission:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
