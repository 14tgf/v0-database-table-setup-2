import { NextRequest, NextResponse } from 'next/server';
import { getAdminByEmail, getAdminPasswordHash, verifyPassword, updateAdminLastLogin } from '@/lib/admin-auth';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get admin and password hash
    const admin = await getAdminByEmail(email);
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const passwordHash = await getAdminPasswordHash(email);
    if (!passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    await updateAdminLastLogin(admin.id);

    // Create JWT token
    const jwtToken = await new SignJWT({ sub: admin.id, email: admin.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
          fullName: admin.full_name,
        },
      },
      { status: 200 }
    );

    // Set secure cookie
    response.cookies.set('admin_session', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_MS / 1000, // Convert to seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[v0] Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
