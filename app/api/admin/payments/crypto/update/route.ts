import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication using admin_session cookie (not auth_token)
    const cookie = request.cookies.get('admin_session')?.value;
    
    console.log('[v0] CRYPTO UPDATE API - Request received', {
      hasCookie: !!cookie,
      cookieNames: Array.from(request.cookies.getAll().map(c => c.name)),
      requestHeaders: {
        authorization: request.headers.get('authorization') ? 'present' : 'missing',
        cookie: request.headers.get('cookie') ? 'present' : 'missing',
      },
      timestamp: new Date().toISOString(),
    });

    if (!cookie) {
      console.error('[v0] CRYPTO UPDATE API - No admin_session found', {
        availableCookies: Array.from(request.cookies.getAll().map(c => c.name)),
        message: 'Admin must be logged in with admin_session cookie',
      });
      return NextResponse.json(
        { message: 'Unauthorized: Admin session not found. Please log in.' },
        { status: 401 }
      );
    }

    try {
      const { payload } = await jwtVerify(cookie, JWT_SECRET);
      const adminId = payload.sub as string;
      
      console.log('[v0] CRYPTO UPDATE API - Admin ID:', adminId);
      
      if (!adminId) {
        console.error('[v0] CRYPTO UPDATE API - Invalid admin session');
        return NextResponse.json(
          { message: 'Invalid admin session' },
          { status: 401 }
        );
      }
    } catch (jwtError) {
      console.error('[v0] CRYPTO UPDATE API - JWT verification failed:', jwtError);
      return NextResponse.json(
        { message: 'Invalid or expired admin session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('[v0] CRYPTO UPDATE API - Request body:', {
      btc_address: body.btc_address ? 'provided' : 'missing',
      eth_address: body.eth_address ? 'provided' : 'missing',
      usdt_trc20: body.usdt_trc20 ? 'provided' : 'missing',
      usdt_erc20: body.usdt_erc20 ? 'provided' : 'missing',
    });

    const { btc_address, eth_address, usdt_trc20, usdt_erc20 } = body;

    // Validate input
    if (!btc_address || !eth_address || !usdt_trc20 || !usdt_erc20) {
      console.error('[v0] CRYPTO UPDATE API - Missing required fields');
      return NextResponse.json(
        { message: 'All cryptocurrency addresses are required' },
        { status: 400 }
      );
    }

    const db = sql();

    // Upsert payment method configuration
    console.log('[v0] CRYPTO UPDATE API - Saving to database');
    const result = (await db`
      INSERT INTO payment_methods (type, config, status, updated_at)
      VALUES (
        'crypto',
        ${JSON.stringify({
          btc_address,
          eth_address,
          usdt_trc20,
          usdt_erc20,
        })}::jsonb,
        'active',
        NOW()
      )
      ON CONFLICT (type) DO UPDATE SET
        config = ${JSON.stringify({
          btc_address,
          eth_address,
          usdt_trc20,
          usdt_erc20,
        })}::jsonb,
        updated_at = NOW()
      RETURNING id, type, config, status, updated_at
    `) as any[];

    console.log('[v0] CRYPTO UPDATE API - Save successful:', {
      id: result[0]?.id,
      type: result[0]?.type,
      updatedAt: result[0]?.updated_at,
    });

    return NextResponse.json({
      success: true,
      message: 'Cryptocurrency wallet configuration saved successfully',
      data: result[0],
    });
  } catch (error) {
    console.error('[v0] CRYPTO UPDATE API - Error:', {
      error,
      errorMsg: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Internal server error',
        success: false,
      },
      { status: 500 }
    );
  }
}
