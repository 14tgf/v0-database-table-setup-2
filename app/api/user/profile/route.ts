import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { sql } from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

// GET user profile with all data
export async function GET(request: NextRequest) {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('[v0] DATABASE_URL environment variable is not set');
      return NextResponse.json(
        { error: 'Database connection error', details: 'DATABASE_URL not configured' },
        { status: 500 }
      );
    }

    const cookie = request.cookies.get('auth_token')?.value;

    if (!cookie) {
      console.log('[v0] No auth token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId = '';
    try {
      const { payload } = await jwtVerify(cookie, JWT_SECRET);
      userId = payload.sub as string;
      console.log('[v0] JWT verified, userId:', userId);
    } catch (error) {
      console.error('[v0] JWT verification failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = sql();
    console.log('[v0] Fetching user with id:', userId);
    
    const result = await db`
      SELECT 
        id,
        email,
        full_name,
        account_type,
        status,
        wallet_balance,
        preferred_currency,
        verification_status,
        kyc_status,
        created_at,
        updated_at
      FROM users 
      WHERE id = ${userId} 
      LIMIT 1
    `;

    console.log('[v0] Query result:', result);
    
    const resultArray = Array.isArray(result) ? result : (result?.rows || result || []);
    console.log('[v0] Result array:', resultArray);
    
    if (!resultArray || resultArray.length === 0) {
      console.error('[v0] User not found for id:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = resultArray[0];
    console.log('[v0] User data:', user);
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        accountType: user.account_type,
        status: user.status,
        preferredCurrency: user.preferred_currency || 'USD',
        walletBalance: user.wallet_balance,
        verificationStatus: user.verification_status,
        kycStatus: user.kyc_status,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    console.error('[v0] Profile GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error instanceof Error ? error.message : String(error) },
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
    const { fullName } = body;

    const db = sql();

    const result = await db`
      UPDATE users 
      SET 
        full_name = COALESCE(${fullName || null}, full_name),
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING 
        id, email, full_name, account_type, status,
        preferred_currency, wallet_balance, verification_status, kyc_status
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
        accountType: user.account_type,
        status: user.status,
        preferredCurrency: user.preferred_currency || 'USD',
        walletBalance: user.wallet_balance,
        verificationStatus: user.verification_status,
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
