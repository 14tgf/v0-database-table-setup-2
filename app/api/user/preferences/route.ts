import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not configured');
  }
  return neon(process.env.DATABASE_URL);
}

// GET user preferences
export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get('auth_token')?.value;

    if (!cookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(cookie, JWT_SECRET);
    const userId = payload.sub as string;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const sql = getSql();
    const result = await sql`
      SELECT preferred_currency FROM users WHERE id = ${userId} LIMIT 1
    `;

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result[0];

    return NextResponse.json({
      success: true,
      preferredCurrency: user.preferred_currency || 'USD',
    });
  } catch (error) {
    console.error('[v0] Preferences GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

// PUT user preferences (save)
export async function PUT(request: NextRequest) {
  try {
    const cookie = request.cookies.get('auth_token')?.value;

    if (!cookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(cookie, JWT_SECRET);
    const userId = payload.sub as string;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { preferredCurrency } = body;

    if (!preferredCurrency || typeof preferredCurrency !== 'string') {
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
    }

    const sql = getSql();

    // Update user's preferred currency
    const result = await sql`
      UPDATE users 
      SET preferred_currency = ${preferredCurrency}, updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, email, preferred_currency
    `;

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences saved successfully',
      preferredCurrency: result[0].preferred_currency,
    });
  } catch (error) {
    console.error('[v0] Preferences PUT error:', error);
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}
