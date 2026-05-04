import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/user-auth';
import { validateEmail, validatePassword } from '@/lib/auth';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Login request received');
    const body = await request.json();
    const { email, password } = body;

    console.log('[v0] Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      console.log('[v0] Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required', message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      console.log('[v0] Invalid email format:', email);
      return NextResponse.json(
        { error: 'Invalid email format', message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Login user
    console.log('[v0] Calling loginUser function');
    const result = await loginUser(email, password);
    console.log('[v0] loginUser result:', result);
    
    if (!result) {
      console.log('[v0] Login failed - invalid credentials');
      return NextResponse.json(
        { error: 'Invalid email or password', message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const { user, token } = result;

    // Create JWT token
    console.log('[v0] Creating JWT token for user:', user.id);
    const jwtToken = await new SignJWT({
      sub: user.id,
      email: user.email,
      role: 'user',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: 'user',
        },
      },
      { status: 200 }
    );

    // Set secure cookie
    response.cookies.set('auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_MS / 1000,
      path: '/',
    });

    console.log('[v0] Login successful for:', email);
    return response;
  } catch (error) {
    console.error('[v0] Login error details:', error);
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json(
      { error: errorMessage, message: 'Login failed' },
      { status: 500 }
    );
  }
}
