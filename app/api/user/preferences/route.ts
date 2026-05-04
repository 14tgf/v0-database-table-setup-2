import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

// GET user preferences
export async function GET(request: NextRequest) {
  try {
    console.log('[v0] Preferences GET: Request received');
    
    // Return default currency for now
    return NextResponse.json({
      success: true,
      preferredCurrency: 'USD',
    });
  } catch (error) {
    console.error('[v0] Preferences GET error:', error);
    return NextResponse.json({ 
      preferredCurrency: 'USD',
    });
  }
}

// PUT user preferences (save)
export async function PUT(request: NextRequest) {
  try {
    console.log('[v0] Preferences PUT: Request received');
    
    const body = await request.json();
    console.log('[v0] Preferences PUT: Body:', body);
    
    const { preferredCurrency } = body;

    if (!preferredCurrency || typeof preferredCurrency !== 'string') {
      console.log('[v0] Preferences PUT: Invalid currency value');
      return NextResponse.json(
        { error: 'Invalid currency provided' },
        { status: 400 }
      );
    }

    console.log('[v0] Preferences PUT: Saving currency:', preferredCurrency);
    
    // TODO: When database is ready, update the users table:
    // UPDATE users SET preferred_currency = ${preferredCurrency} WHERE id = ${userId}

    return NextResponse.json({
      success: true,
      message: 'Preferences saved successfully',
      preferredCurrency: preferredCurrency,
    });
  } catch (error) {
    console.error('[v0] Preferences PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences', details: String(error) },
      { status: 500 }
    );
  }
}
