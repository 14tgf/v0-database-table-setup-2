import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    const { kyc_id, action, rejection_reason } = body;

    if (!kyc_id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = sql();

    // Get KYC submission details
    const kycResult = await db`SELECT * FROM kyc_submissions WHERE id = ${kyc_id}`;
    if (!kycResult || kycResult.length === 0) {
      return NextResponse.json({ error: 'KYC submission not found' }, { status: 404 });
    }

    const kycSubmission = Array.isArray(kycResult) ? kycResult[0] : kycResult;

    if (action === 'approve') {
      // Update KYC submission
      await db`UPDATE kyc_submissions SET status = 'approved', reviewed_at = NOW(), updated_at = NOW() WHERE id = ${kyc_id}`;
      
      // Update user verification status
      await db`UPDATE users SET kyc_status = 'approved', verification_status = 'verified', updated_at = NOW() WHERE id = ${kycSubmission.user_id}`;

      return NextResponse.json({ success: true, message: 'KYC submission approved' });
    } else if (action === 'reject') {
      // Update KYC submission
      await db`UPDATE kyc_submissions SET status = 'rejected', rejection_reason = ${rejection_reason || null}, reviewed_at = NOW(), updated_at = NOW() WHERE id = ${kyc_id}`;
      
      // Update user verification status
      await db`UPDATE users SET kyc_status = 'rejected', verification_status = 'rejected', updated_at = NOW() WHERE id = ${kycSubmission.user_id}`;

      return NextResponse.json({ success: true, message: 'KYC submission rejected' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error processing KYC submission:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
