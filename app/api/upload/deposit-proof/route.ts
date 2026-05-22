import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-in-production');

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] UPLOAD DEPOSIT PROOF - Request received');

    // Verify authentication
    const cookie = request.cookies.get('auth_token')?.value;
    if (!cookie) {
      console.error('[v0] UPLOAD DEPOSIT PROOF - No auth token');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
      await jwtVerify(cookie, JWT_SECRET);
    } catch (jwtError) {
      console.error('[v0] UPLOAD DEPOSIT PROOF - JWT verification failed');
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('[v0] UPLOAD DEPOSIT PROOF - No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('[v0] UPLOAD DEPOSIT PROOF - Invalid file type:', file.type);
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      console.error('[v0] UPLOAD DEPOSIT PROOF - File too large:', file.size);
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB' }, { status: 400 });
    }

    console.log('[v0] UPLOAD DEPOSIT PROOF - File info:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Convert file to base64 for data URL
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    console.log('[v0] UPLOAD DEPOSIT PROOF - Successfully converted to data URL');

    // Return data URL as the proof URL
    return NextResponse.json({
      success: true,
      url: dataUrl,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[v0] UPLOAD DEPOSIT PROOF - Error:', errorMsg);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
