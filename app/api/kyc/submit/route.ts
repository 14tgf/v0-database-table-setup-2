import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendEmailSafely } from '@/lib/email/send';
import { getKycSubmittedEmail, getAdminNotificationEmail } from '@/lib/email/templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      user_id, 
      full_name, 
      id_type, 
      id_number, 
      id_front_image, 
      id_back_image, 
      selfie_image, 
      address_document 
    } = body;

    if (!user_id || !full_name || !id_type || !id_number) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = sql();

    // Check if user has an approved KYC (cannot resubmit)
    const approvedCheck = await db`
      SELECT id FROM kyc_submissions 
      WHERE user_id = ${user_id} AND status = 'approved'
      LIMIT 1
    `;

    const approvedArray = Array.isArray(approvedCheck) ? approvedCheck : (approvedCheck?.rows || []);
    if (approvedArray.length > 0) {
      return NextResponse.json(
        { error: 'You already have an approved KYC submission. No resubmission needed.' },
        { status: 409 }
      );
    }

    // Check if user has a pending KYC (prevent duplicate pending submissions)
    const pendingCheck = await db`
      SELECT id FROM kyc_submissions 
      WHERE user_id = ${user_id} AND status = 'pending'
      LIMIT 1
    `;

    const pendingArray = Array.isArray(pendingCheck) ? pendingCheck : (pendingCheck?.rows || []);
    if (pendingArray.length > 0) {
      return NextResponse.json(
        { error: 'You already have a pending KYC submission. Please wait for review.' },
        { status: 409 }
      );
    }

    // Create new KYC submission
    const result = await db`
      INSERT INTO kyc_submissions (
        user_id,
        full_name,
        id_type,
        id_number,
        id_front_image,
        id_back_image,
        selfie_image,
        address_document,
        status
      )
      VALUES (
        ${user_id},
        ${full_name},
        ${id_type},
        ${id_number},
        ${id_front_image || null},
        ${id_back_image || null},
        ${selfie_image || null},
        ${address_document || null},
        'pending'
      )
      RETURNING id, user_id, status, submitted_at
    `;

    const resultArray = Array.isArray(result) ? result : (result?.rows || []);
    if (!resultArray || resultArray.length === 0) {
      throw new Error('Failed to create KYC submission');
    }

    // Update user status to pending
    await db`
      UPDATE users 
      SET kyc_status = 'pending', verification_status = 'pending'
      WHERE id = ${user_id}
    `;

    // Get user email for notification
    const userResult = await db`SELECT email FROM users WHERE id = ${user_id}`;
    const userEmail = userResult?.[0]?.email || (Array.isArray(userResult) && userResult[0]?.email);

    // Send KYC submitted confirmation email
    if (userEmail) {
      const emailHtml = getKycSubmittedEmail();
      sendEmailSafely({
        to: userEmail,
        subject: 'KYC Verification Submitted',
        html: emailHtml,
      }).catch(err => console.error('[v0] Failed to send KYC submission email:', err));
    }

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const adminHtml = getAdminNotificationEmail(
        'New KYC Submission',
        `New KYC submission from user ${user_id}: ${full_name}`
      );
      sendEmailSafely({
        to: adminEmail,
        subject: 'New KYC Submission',
        html: adminHtml,
      }).catch(err => console.error('[v0] Failed to send admin notification:', err));
    }

    return NextResponse.json({
      success: true,
      message: 'KYC submission created successfully',
      submission: resultArray[0],
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error creating KYC submission:', msg);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user_id parameter' },
        { status: 400 }
      );
    }

    const db = sql();

    // Get user's KYC status
    const submission = await db`
      SELECT 
        id,
        user_id,
        full_name,
        id_type,
        status,
        rejection_reason,
        submitted_at,
        reviewed_at
      FROM kyc_submissions
      WHERE user_id = ${userId}
      ORDER BY submitted_at DESC
      LIMIT 1
    `;

    const submissionArray = Array.isArray(submission) ? submission : (submission?.rows || []);
    return NextResponse.json({
      success: true,
      submission: submissionArray.length > 0 ? submissionArray[0] : null,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error fetching KYC submission:', msg);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
