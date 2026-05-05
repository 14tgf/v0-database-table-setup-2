import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  return neon(process.env.DATABASE_URL);
}

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

    const sql = getSql();

    // Get user by email
    console.log('[v0] LOGIN: Finding user by email');
    const users = await sql`
      SELECT id, email, password_hash, full_name, status
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    if (!users || users.length === 0) {
      console.log('[v0] LOGIN: User not found');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    if (user.status !== 'active') {
      console.log('[v0] LOGIN: User account not active');
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 401 }
      );
    }

    // Verify password
    console.log('[v0] LOGIN: Verifying password');
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      console.log('[v0] LOGIN: Password does not match');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const jwtToken = await new SignJWT({
      sub: user.id,
      email: user.email,
      role: 'user',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, email: user.email, fullName: user.full_name },
      token: jwtToken
    }, { status: 200 });

    // Set secure cookie with the JWT token
    console.log('[v0] LOGIN: Setting auth_token cookie');
    response.cookies.set('auth_token', jwtToken, {
      httpOnly: true,
      secure: false, // Allow in development
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    console.log('[v0] LOGIN: Success for user:', user.id);
    console.log('[v0] LOGIN: Cookie set with token');
    return response;
    
  } catch (error) {
    console.error('[v0] LOGIN ERROR:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Login failed',
    }, { status: 500 });
  }
}
