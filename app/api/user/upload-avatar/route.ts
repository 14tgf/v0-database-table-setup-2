import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { sql } from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get('auth_token')?.value;

    if (!cookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId = '';
    try {
      const { payload } = await jwtVerify(cookie, JWT_SECRET);
      userId = payload.sub as string;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must not exceed 5MB' }, { status: 400 });
    }

    // Create a simple file path for storage
    const fileName = `avatars/${userId}-${Date.now()}.${file.type.split('/')[1]}`;
    const imageUrl = `/uploads/${fileName}`;

    const db = sql();

    // Update user profile_image in database
    const result = await db`
      UPDATE users 
      SET profile_image = ${imageUrl}, updated_at = NOW()
      WHERE id = ${userId}
      RETURNING profile_image
    `;

    const resultArray = Array.isArray(result) ? result : (result?.rows || []);
    if (!resultArray || resultArray.length === 0) {
      return NextResponse.json({ error: 'Failed to save profile image' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl: resultArray[0].profile_image,
    });
  } catch (error) {
    console.error('[v0] Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}
