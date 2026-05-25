import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendEmail, sendEmailToAdmin } from '@/lib/email/resend';
import { kycApprovedTemplate, kycRejectedTemplate, adminAlertTemplate } from '@/lib/email/templates';
import { notifyKycApproved, notifyKycRejected } from '@/lib/notifications';

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

      const userQuery = await db`SELECT email, full_name FROM users WHERE id = ${kycSubmission.user_id}`;
      const userEmail = userQuery?.[0]?.email;
      if (userEmail) {
        sendEmail({
          to: userEmail,
          subject: 'KYC Verification Approved',
          html: kycApprovedTemplate(),
        }).catch(err => console.error('[v0] Failed to send KYC approval email:', err));
      }

      // Create in-app notification (non-blocking)
      notifyKycApproved(kycSubmission.user_id)
        .catch(err => console.error('[v0] Failed to create KYC approved notification:', err));

      // Notify admin (non-blocking)
      sendEmailToAdmin({
        subject: 'KYC Approved',
        html: adminAlertTemplate(
          'KYC Approved',
          'A KYC submission has been approved.',
          {
            'User ID': kycSubmission.user_id,
            'Full Name': kycSubmission.full_name,
            'ID Type': kycSubmission.id_type,
          }
        ),
      }).catch(err => console.error('[v0] Failed to send admin notification:', err));

      return NextResponse.json({ success: true, message: 'KYC submission approved' });
    } else if (action === 'reject') {
      // Update KYC submission
      await db`UPDATE kyc_submissions SET status = 'rejected', rejection_reason = ${rejection_reason || null}, reviewed_at = NOW(), updated_at = NOW() WHERE id = ${kyc_id}`;
      
      // Update user verification status
      await db`UPDATE users SET kyc_status = 'rejected', verification_status = 'rejected', updated_at = NOW() WHERE id = ${kycSubmission.user_id}`;

      // Get user email for notification (non-blocking)
      const userQuery = await db`SELECT email, full_name FROM users WHERE id = ${kycSubmission.user_id}`;
      const userEmail = userQuery?.[0]?.email;
      if (userEmail) {
        sendEmail({
          to: userEmail,
          subject: 'KYC Verification - Further Information Needed',
          html: kycRejectedTemplate(rejection_reason || 'Your KYC submission could not be verified. Please try again with updated documents.'),
        }).catch(err => console.error('[v0] Failed to send KYC rejection email:', err));
      }

      // Create in-app notification (non-blocking)
      notifyKycRejected(kycSubmission.user_id, rejection_reason)
        .catch(err => console.error('[v0] Failed to create KYC rejected notification:', err));

      // Notify admin (non-blocking)
      sendEmailToAdmin({
        subject: 'KYC Rejected',
        html: adminAlertTemplate(
          'KYC Rejected',
          'A KYC submission has been rejected.',
          {
            'User ID': kycSubmission.user_id,
            'Full Name': kycSubmission.full_name,
            'Reason': rejection_reason || 'No reason provided',
          }
        ),
      }).catch(err => console.error('[v0] Failed to send admin notification:', err));

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
