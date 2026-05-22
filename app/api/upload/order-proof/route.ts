import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { uploadImageToSupabase } from '@/lib/supabase-storage';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-in-production');

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] UPLOAD ORDER PROOF - Request received');

    // Verify authentication
    const cookie = request.cookies.get('auth_token')?.value;
    if (!cookie) {
      console.error('[v0] UPLOAD ORDER PROOF - No auth token');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let userId: string;
    try {
      const verified = await jwtVerify(cookie, JWT_SECRET) as any;
      userId = verified.payload.sub || verified.payload.userId;
      if (!userId) {
        throw new Error('No user ID in token');
      }
    } catch (jwtError) {
      console.error('[v0] UPLOAD ORDER PROOF - JWT verification failed');
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('[v0] UPLOAD ORDER PROOF - No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('[v0] UPLOAD ORDER PROOF - File info:', {
      name: file.name,
      size: file.size,
      type: file.type,
      userId,
    });

    // Upload to Supabase Storage
    const uploadResult = await uploadImageToSupabase({
      bucket: 'order-proofs',
      file,
      userId,
      maxSizeMB: 5,
    });

    if (!uploadResult.success) {
      console.error('[v0] UPLOAD ORDER PROOF - Upload failed:', uploadResult.error);
      return NextResponse.json({ error: uploadResult.error }, { status: 400 });
    }

    console.log('[v0] UPLOAD ORDER PROOF - Successfully uploaded to Supabase:', uploadResult.url);

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[v0] UPLOAD ORDER PROOF - Error:', errorMsg);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
