import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/user-auth';
import { validateEmail, validatePassword } from '@/lib/auth';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Wrap the entire handler to catch any uncaught errors
export async function POST(request: NextRequest) {
  let errorOccurred = false;
  try {
    console.log('[v0] ========== REGISTER ENDPOINT START ==========');
    console.log('[v0] Register request received');
    console.log('[v0] DATABASE_URL set:', !!process.env.DATABASE_URL);
    
    const body = await request.json();
    console.log('[v0] Request body parsed:', { email: body.email, hasPassword: !!body.password, hasFullName: !!body.fullName });
    const { email, password, fullName } = body;

    // Validate input
    if (!email || !password || !fullName) {
      console.log('[v0] Missing required fields');
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    console.log('[v0] Validating email format');
    if (!validateEmail(email)) {
      console.log('[v0] Invalid email format');
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    console.log('[v0] Validating password');
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      console.log('[v0] Invalid password:', passwordValidation.errors);
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      );
    }

    // Register user
    console.log('[v0] About to call registerUser for:', email);
    const result = await registerUser(email, password, fullName);
    console.log('[v0] registerUser completed. Result:', result ? 'success' : 'null');
    
    if (!result) {
      console.log('[v0] Email already in use');
      return NextResponse.json(
        { error: 'Email already in use', message: 'Email already registered' },
        { status: 409 }
      );
    }

    const { user, token } = result;
    console.log('[v0] User created:', user.id);

    // Create JWT token
    console.log('[v0] Creating JWT token');
    const jwtToken = await new SignJWT({
      sub: user.id,
      email: user.email,
      role: 'user',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    console.log('[v0] JWT token created successfully');

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: 'user',
        },
      },
      { status: 201 }
    );

    // Set secure cookie
    response.cookies.set('auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_MS / 1000,
      path: '/',
    });

    console.log('[v0] Registration successful for:', email);
    console.log('[v0] ========== REGISTER ENDPOINT SUCCESS ==========');
    return response;
  } catch (error) {
    errorOccurred = true;
    console.error('[v0] ========== REGISTER ENDPOINT ERROR ==========');
    console.error('[v0] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[v0] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[v0] Error stack:', error instanceof Error ? error.stack : 'N/A');
    console.error('[v0] Full error object:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json(
      { 
        error: errorMessage, 
        message: 'Registration failed',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
