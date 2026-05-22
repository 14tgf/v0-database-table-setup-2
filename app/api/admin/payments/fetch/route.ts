import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-in-production');

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookie = request.cookies.get('admin_session')?.value;

    console.log('[v0] PAYMENT METHODS FETCH API - Request received', {
      hasCookie: !!cookie,
      timestamp: new Date().toISOString(),
    });

    if (!cookie) {
      console.error('[v0] PAYMENT METHODS FETCH API - No admin_session found');
      return NextResponse.json(
        { message: 'Unauthorized: Admin session not found', success: false },
        { status: 401 }
      );
    }

    try {
      const { payload } = await jwtVerify(cookie, JWT_SECRET);
      const adminId = payload.sub as string;

      console.log('[v0] PAYMENT METHODS FETCH API - Admin ID:', adminId);

      if (!adminId) {
        console.error('[v0] PAYMENT METHODS FETCH API - Invalid admin session');
        return NextResponse.json(
          { message: 'Invalid admin session', success: false },
          { status: 401 }
        );
      }
    } catch (jwtError) {
      console.error('[v0] PAYMENT METHODS FETCH API - JWT verification failed:', jwtError);
      return NextResponse.json(
        { message: 'Invalid or expired admin session', success: false },
        { status: 401 }
      );
    }

    const db = sql();

    // Fetch all payment methods from database
    console.log('[v0] PAYMENT METHODS FETCH API - Querying database');
    const result = (await db`
      SELECT id, type, config, status, updated_at
      FROM payment_methods
      WHERE type IN ('crypto', 'paypal', 'bank')
      ORDER BY type
    `) as any[];

    console.log('[v0] PAYMENT METHODS FETCH API - Query results:', {
      count: result.length,
      types: result.map(r => r.type),
    });

    // Build response object
    const response = {
      crypto: {
        type: 'crypto',
        status: 'active',
        config: {
          btc_address: '',
          btc_network: 'BTC',
          eth_address: '',
          eth_network: 'ETH',
          usdt_trc20: '',
          usdt_trc20_network: 'USDT TRC-20',
          usdt_erc20: '',
          usdt_erc20_network: 'USDT ERC-20',
        },
        updated_at: new Date().toISOString(),
      },
      paypal: {
        type: 'paypal',
        status: 'active',
        config: { email: '' },
        updated_at: new Date().toISOString(),
      },
      bank: {
        type: 'bank',
        status: 'active',
        config: {
          bank_name: '',
          account_name: '',
          account_number: '',
          swift_code: '',
          country: '',
        },
        updated_at: new Date().toISOString(),
      },
    };

    for (const method of result) {
      console.log('[v0] PAYMENT METHODS FETCH API - Processing method:', {
        type: method.type,
        hasConfig: !!method.config,
        status: method.status,
      });

      if (method.type === 'crypto') {
        response.crypto = {
          type: method.type,
          status: method.status,
          config: method.config,
          updated_at: method.updated_at,
        };
      } else if (method.type === 'paypal') {
        response.paypal = {
          type: method.type,
          status: method.status,
          config: method.config,
          updated_at: method.updated_at,
        };
      } else if (method.type === 'bank') {
        response.bank = {
          type: method.type,
          status: method.status,
          config: method.config,
          updated_at: method.updated_at,
        };
      }
    }

    console.log('[v0] PAYMENT METHODS FETCH API - Final response:', {
      hasCrypto: !!response.crypto,
      hasPaypal: !!response.paypal,
      hasBank: !!response.bank,
    });

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('[v0] PAYMENT METHODS FETCH API - Error:', {
      error,
      errorMsg: error instanceof Error ? error.message : 'Unknown error',
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
