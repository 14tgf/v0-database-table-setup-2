import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { sql } from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

// GET user profile with all data
export async function GET(request: NextRequest) {
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

    const db = sql();
    
    const result = await db`
      SELECT 
        id,
        email,
        full_name,
        username,
        phone_number,
        profile_image,
        preferred_currency,
        wallet_balance,
        vip_status,
        vip_level,
        kyc_status,
        created_at,
        updated_at
      FROM users 
      WHERE id = ${userId} 
      LIMIT 1
    `;

    const resultArray = Array.isArray(result) ? result : (result?.rows || []);
    if (!resultArray || resultArray.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = resultArray[0];
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        username: user.username,
        phoneNumber: user.phone_number,
        profileImage: user.profile_image,
        preferredCurrency: user.preferred_currency || 'USD',
        walletBalance: user.wallet_balance,
        vipStatus: user.vip_status,
        vipLevel: user.vip_level,
        kycStatus: user.kyc_status,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    console.error('[v0] Profile GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT update user profile
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { fullName, phoneNumber, profileImage } = body;

    const db = sql();

    const result = await db`
      UPDATE users 
      SET 
        full_name = COALESCE(${fullName || null}, full_name),
        phone_number = COALESCE(${phoneNumber || null}, phone_number),
        profile_image = COALESCE(${profileImage || null}, profile_image),
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING 
        id, email, full_name, username, phone_number, profile_image, 
        preferred_currency, wallet_balance, vip_status, vip_level, kyc_status
    `;

    const resultArray = Array.isArray(result) ? result : (result?.rows || []);
    if (!resultArray || resultArray.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = resultArray[0];
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        username: user.username,
        phoneNumber: user.phone_number,
        profileImage: user.profile_image,
        preferredCurrency: user.preferred_currency || 'USD',
        walletBalance: user.wallet_balance,
        vipStatus: user.vip_status,
        vipLevel: user.vip_level,
        kycStatus: user.kyc_status,
      },
    });
  } catch (error) {
    console.error('[v0] Profile PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
