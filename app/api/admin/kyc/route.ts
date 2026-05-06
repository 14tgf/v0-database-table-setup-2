import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('[v0] Fetching KYC submissions...');
    const db = sql();
    console.log('[v0] Database connection obtained');

    const kyc = await db`
      SELECT 
        ks.id,
        ks.user_id,
        ks.full_name,
        ks.id_type,
        ks.id_number,
        ks.id_front_image,
        ks.id_back_image,
        ks.selfie_image,
        ks.address_document,
        ks.status,
        ks.rejection_reason,
        ks.submitted_at,
        ks.reviewed_at,
        u.email as user_email
      FROM kyc_submissions ks
      LEFT JOIN users u ON ks.user_id = u.id
      WHERE ks.status = 'pending'
      ORDER BY ks.submitted_at DESC
    `;

    console.log('[v0] Query executed, KYC submissions:', kyc?.length);

    const formattedKYC = kyc.map((submission: any) => ({
      id: submission.id,
      user_id: submission.user_id,
      full_name: submission.full_name,
      id_type: submission.id_type,
      id_number: submission.id_number,
      id_front_image: submission.id_front_image,
      id_back_image: submission.id_back_image,
      selfie_image: submission.selfie_image,
      address_document: submission.address_document,
      status: submission.status,
      rejection_reason: submission.rejection_reason,
      submitted_at: submission.submitted_at,
      reviewed_at: submission.reviewed_at,
      user_email: submission.user_email,
    }));

    console.log('[v0] KYC submissions formatted, returning response');
    return NextResponse.json({ success: true, kyc_submissions: formattedKYC });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error fetching KYC submissions:', msg);
    console.error('[v0] Full error:', error);
    return NextResponse.json({ success: false, error: msg, kyc_submissions: [] }, { status: 500 });
  }
}
