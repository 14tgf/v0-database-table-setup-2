import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication using admin_session cookie (not auth_token)
    const cookie = request.cookies.get('admin_session')?.value;
    
    console.log('[v0] BANK UPDATE API - Request received', {
      hasCookie: !!cookie,
      cookieNames: Array.from(request.cookies.getAll().map(c => c.name)),
      timestamp: new Date().toISOString(),
    });

    if (!cookie) {
      console.error('[v0] BANK UPDATE API - No admin_session found');
      return NextResponse.json(
        { message: 'Unauthorized: Admin session not found. Please log in.' },
        { status: 401 }
      );
    }

    try {
      const { payload } = await jwtVerify(cookie, JWT_SECRET);
      const adminId = payload.sub as string;
      
      console.log('[v0] BANK UPDATE API - Admin ID:', adminId);
      
      if (!adminId) {
        console.error('[v0] BANK UPDATE API - Invalid admin session');
        return NextResponse.json(
          { message: 'Invalid admin session' },
          { status: 401 }
        );
      }
    } catch (jwtError) {
      console.error('[v0] BANK UPDATE API - JWT verification failed:', jwtError);
      return NextResponse.json(
        { message: 'Invalid or expired admin session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('[v0] BANK UPDATE API - Request body:', {
      bank_name: body.bank_name ? 'provided' : 'missing',
      account_name: body.account_name ? 'provided' : 'missing',
      account_number: body.account_number ? 'provided' : 'missing',
      swift_code: body.swift_code ? 'provided' : 'missing',
      country: body.country ? 'provided' : 'missing',
    });

    const { bank_name, account_name, account_number, swift_code, country } = body;

    // Validate input
    if (!bank_name || !account_name || !account_number || !swift_code || !country) {
      console.error('[v0] BANK UPDATE API - Missing required fields');
      return NextResponse.json(
        { message: 'All bank details are required' },
        { status: 400 }
      );
    }

    const db = sql();

    // Upsert payment method configuration
    console.log('[v0] BANK UPDATE API - Saving to database');
    const result = (await db`
      INSERT INTO payment_methods (type, config, status, updated_at)
      VALUES (
        'bank',
        ${JSON.stringify({
          bank_name,
          account_name,
          account_number,
          swift_code,
          country,
        })}::jsonb,
        'active',
        NOW()
      )
      ON CONFLICT (type) DO UPDATE SET
        config = ${JSON.stringify({
          bank_name,
          account_name,
          account_number,
          swift_code,
          country,
        })}::jsonb,
        updated_at = NOW()
      RETURNING id, type, config, status, updated_at
    `) as any[];

    console.log('[v0] BANK UPDATE API - Save successful:', {
      id: result[0]?.id,
      type: result[0]?.type,
      updatedAt: result[0]?.updated_at,
    });

    return NextResponse.json({
      success: true,
      message: 'Bank configuration saved successfully',
      data: result[0],
    });
  } catch (error) {
    console.error('[v0] BANK UPDATE API - Error:', {
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
