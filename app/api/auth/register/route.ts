import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail, sendEmailToAdmin } from '@/lib/email/resend';
import { welcomeEmailTemplate, adminAlertTemplate } from '@/lib/email/templates';

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
    console.log('[v0] REGISTER: Endpoint called');
    
    const body = await request.json();
    console.log('[v0] REGISTER: Body received - email:', body.email);
    
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      console.log('[v0] REGISTER: Missing fields');
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    try {
      const sql = getSql();

      // Check if user already exists
      console.log('[v0] REGISTER: Checking if email exists');
      const existing = await sql`
        SELECT id FROM users WHERE email = ${email} LIMIT 1
      `;

      if (existing && existing.length > 0) {
        console.log('[v0] REGISTER: Email already exists');
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }

      // Create new user with initial wallet balance
      console.log('[v0] REGISTER: Creating new user');
      const result = await sql`
        INSERT INTO users (id, email, password_hash, full_name, account_type, status, wallet_balance, preferred_currency)
        VALUES (${userId}, ${email}, ${passwordHash}, ${fullName}, 'standard', 'active', 0, 'USD')
        RETURNING id, email, full_name
      `;

      if (!result || result.length === 0) {
        throw new Error('Failed to create user');
      }

      const user = result[0];
      console.log('[v0] REGISTER: User created:', user.id);

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
        message: 'Registration successful',
        user: { id: user.id, email: user.email, fullName: user.full_name }
      }, { status: 201 });

      // Set secure cookie with the JWT token
      response.cookies.set('auth_token', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      });

      console.log('[v0] REGISTER: Success');
      
      // Send welcome email (non-blocking)
      sendEmail({
        to: user.email,
        subject: 'Welcome to X Holding!',
        html: welcomeEmailTemplate(user.email, user.full_name),
      }).catch(err => console.error('[v0] Failed to send welcome email:', err));

      // Notify admin (non-blocking)
      sendEmailToAdmin({
        subject: 'New User Registration',
        html: adminAlertTemplate(
          'New User Registration',
          `A new user has registered with the following details:`,
          {
            'Email': user.email,
            'Full Name': user.full_name,
            'Timestamp': new Date().toISOString(),
          }
        ),
      }).catch(err => console.error('[v0] Failed to send admin notification:', err));

      return response;
    } catch (dbError) {
      console.error('[v0] REGISTER: Database error:', dbError);
      throw dbError;
    }
    
  } catch (error) {
    console.error('[v0] REGISTER ERROR:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Registration failed',
    }, { status: 500 });
  }
}
