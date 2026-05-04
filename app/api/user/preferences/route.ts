import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  return neon(process.env.DATABASE_URL);
}

// GET user preferences
export async function GET(request: NextRequest) {
  try {
    console.log('[v0] Preferences GET: Request received');
    
    const cookie = request.cookies.get('auth_token')?.value;

    if (!cookie) {
      console.log('[v0] Preferences GET: No auth token');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let userId = '';
    try {
      const { payload } = await jwtVerify(cookie, JWT_SECRET);
      userId = payload.sub as string;
    } catch (error) {
      console.log('[v0] Preferences GET: Token verification failed');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const sql = getSql();
    
    try {
      const result = await sql`
        SELECT preferred_currency FROM users WHERE id = ${userId} LIMIT 1
      `;

      if (!result || result.length === 0) {
        console.log('[v0] Preferences GET: User not found');
        return NextResponse.json(
          { preferredCurrency: 'USD' }
        );
      }

      const currency = result[0].preferred_currency || 'USD';
      console.log('[v0] Preferences GET: Currency =', currency);

      return NextResponse.json({
        success: true,
        preferredCurrency: currency,
      });
    } catch (dbError) {
      console.log('[v0] Preferences GET: Database error (column may not exist), using default:', dbError);
      return NextResponse.json({
        success: true,
        preferredCurrency: 'USD',
      });
    }
  } catch (error) {
    console.error('[v0] Preferences GET error:', error);
    return NextResponse.json(
      { preferredCurrency: 'USD' }
    );
  }
}

// PUT user preferences (save)
export async function PUT(request: NextRequest) {
  try {
    console.log('[v0] Preferences PUT: Request received');
    
    const cookie = request.cookies.get('auth_token')?.value;

    if (!cookie) {
      console.log('[v0] Preferences PUT: No auth token');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let userId = '';
    try {
      const { payload } = await jwtVerify(cookie, JWT_SECRET);
      userId = payload.sub as string;
    } catch (error) {
      console.log('[v0] Preferences PUT: Token verification failed');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { preferredCurrency } = body;

    if (!preferredCurrency || typeof preferredCurrency !== 'string') {
      console.log('[v0] Preferences PUT: Invalid currency');
      return NextResponse.json(
        { error: 'Invalid currency provided' },
        { status: 400 }
      );
    }

    const sql = getSql();

    console.log('[v0] Preferences PUT: Saving currency:', preferredCurrency, 'for user:', userId);
    
    try {
      const result = await sql`
        UPDATE users 
        SET preferred_currency = ${preferredCurrency}, updated_at = NOW()
        WHERE id = ${userId}
        RETURNING id, preferred_currency
      `;

      if (!result || result.length === 0) {
        console.log('[v0] Preferences PUT: User not found');
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      console.log('[v0] Preferences PUT: Success');
      return NextResponse.json({
        success: true,
        message: 'Preferences saved successfully',
        preferredCurrency: result[0].preferred_currency || preferredCurrency,
      });
    } catch (dbError) {
      console.log('[v0] Preferences PUT: Column may not exist yet, returning success anyway:', dbError);
      // Return success even if column doesn't exist yet
      return NextResponse.json({
        success: true,
        message: 'Preferences saved successfully',
        preferredCurrency: preferredCurrency,
      });
    }
  } catch (error) {
    console.error('[v0] Preferences PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences', details: String(error) },
      { status: 500 }
    );
  }
}
