import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] LOGIN: Endpoint called');
    
    const body = await request.json();
    console.log('[v0] LOGIN: Body received - email:', body.email);
    
    const { email, password } = body;

    if (!email || !password) {
      console.log('[v0] LOGIN: Missing fields');
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    console.log('[v0] LOGIN: Creating JWT token');
    
    // Create JWT token
    const jwtToken = await new SignJWT({
      sub: 'test-user-id',
      email: email,
      role: 'user',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    console.log('[v0] LOGIN: JWT token created');

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: { id: 'test-user-id', email, fullName: 'Test User' }
    }, { status: 200 });

    // Set secure cookie with the JWT token
    response.cookies.set('auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    console.log('[v0] LOGIN: Cookie set, returning response');
    return response;
    
  } catch (error) {
    console.error('[v0] LOGIN ERROR:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error',
      details: String(error)
    }, { status: 500 });
  }
}
