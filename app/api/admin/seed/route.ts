import { NextRequest, NextResponse } from 'next/server';
import { createAdmin } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    // Only allow from localhost in development or with a special token
    const origin = request.headers.get('origin');
    const token = request.headers.get('x-seed-token');

    const isLocalhost = origin?.includes('localhost') || origin?.includes('127.0.0.1');
    const isProduction = process.env.NODE_ENV === 'production';
    const hasValidToken = token === process.env.SEED_TOKEN;

    if (isProduction && !hasValidToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!isLocalhost && !hasValidToken) {
      return NextResponse.json(
        { error: 'Only available in development or with valid token' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email = 'admin@xholding.com', password = 'AdminPassword123!', fullName = 'X Admin' } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Try to create admin account
    const admin = await createAdmin(email, password, fullName);

    return NextResponse.json(
      {
        success: true,
        message: 'Admin account created successfully',
        admin: {
          id: admin.id,
          email: admin.email,
          fullName: admin.full_name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Seed admin error:', error);

    // Check if it's a duplicate email error
    const errorMessage = (error as any)?.message || '';
    if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Admin account with this email already exists',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
