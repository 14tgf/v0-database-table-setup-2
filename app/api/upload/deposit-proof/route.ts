import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { uploadImageToSupabase } from '@/lib/supabase-storage';
import { sql } from '@vercel/postgres';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-in-production');

export async function POST(request: NextRequest) {
  console.log('[v0] ====== DEPOSIT PROOF UPLOAD API ======');
  console.log('[v0] Request method:', request.method);
  console.log('[v0] Request URL:', request.url);

  try {
    console.log('[v0] Checking authentication...');

    // Verify authentication
    const cookie = request.cookies.get('auth_token')?.value;
    if (!cookie) {
      console.error('[v0] UPLOAD DEPOSIT PROOF - No auth token in cookies');
      console.log('[v0] Available cookies:', request.cookies.getAll().map(c => c.name));
      return NextResponse.json(
        { error: 'Not authenticated', details: 'No auth token found' },
        { status: 401 }
      );
    }

    console.log('[v0] Auth token found, verifying JWT...');
    let userId: string;
    try {
      const verified = await jwtVerify(cookie, JWT_SECRET) as any;
      userId = verified.payload.sub || verified.payload.userId;
      console.log('[v0] JWT verified, userId:', userId);
      if (!userId) {
        throw new Error('No user ID in token');
      }
    } catch (jwtError) {
      console.error('[v0] UPLOAD DEPOSIT PROOF - JWT verification failed:', jwtError);
      return NextResponse.json(
        { error: 'Invalid or expired session', details: String(jwtError) },
        { status: 401 }
      );
    }

    // Parse form data
    console.log('[v0] Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('[v0] Form data keys:', Array.from(formData.keys()));
    console.log('[v0] File retrieved:', !!file);

    if (!file) {
      console.error('[v0] UPLOAD DEPOSIT PROOF - No file provided');
      return NextResponse.json(
        { error: 'No file provided', details: 'File field is empty' },
        { status: 400 }
      );
    }

    console.log('[v0] File info:', {
      name: file.name,
      size: file.size,
      type: file.type,
      userId,
    });

    // Upload to Supabase Storage
    console.log('[v0] Starting Supabase upload...');
    const uploadResult = await uploadImageToSupabase({
      bucket: 'payment-proofs',
      file,
      userId,
      maxSizeMB: 5,
    });

    console.log('[v0] Upload result:', uploadResult);

    if (!uploadResult.success) {
      console.error('[v0] UPLOAD DEPOSIT PROOF - Upload failed:', uploadResult.error);
      return NextResponse.json(
        { error: uploadResult.error, details: 'Supabase upload failed' },
        { status: 400 }
      );
    }

    console.log('[v0] UPLOAD DEPOSIT PROOF - Successfully uploaded to Supabase:', uploadResult.url);
    console.log('[v0] ====== DEPOSIT PROOF UPLOAD COMPLETE ======');

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('[v0] UPLOAD DEPOSIT PROOF - Error:', errorMsg);
    console.error('[v0] Error stack:', errorStack);
    console.error('[v0] Full error object:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: errorMsg },
      { status: 500 }
    );
  }
}
