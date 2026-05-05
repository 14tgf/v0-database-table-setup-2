import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    console.log('[v0] PAYMENT METHODS PUBLIC API - Request received');

    const db = sql();

    // Fetch all payment methods from database (no auth required for users)
    console.log('[v0] PAYMENT METHODS PUBLIC API - Querying database for payment methods');
    const result = await db`
      SELECT type, config, status 
      FROM payment_methods 
      WHERE status = 'active'
      ORDER BY created_at ASC
    `;

    console.log('[v0] PAYMENT METHODS PUBLIC API - Query result:', result);

    if (!result || result.length === 0) {
      console.warn('[v0] PAYMENT METHODS PUBLIC API - No payment methods found in database');
      return NextResponse.json(
        {
          success: true,
          data: {
            crypto: {
              btc_address: '',
              eth_address: '',
              usdt_trc20: '',
              usdt_erc20: '',
            },
            bank: {},
            paypal: { email: '' },
          },
          message: 'No payment methods configured',
        },
        { status: 200 }
      );
    }

    // Parse the database results into a structured format
    const paymentData: any = {
      crypto: {
        btc_address: '',
        eth_address: '',
        usdt_trc20: '',
        usdt_erc20: '',
      },
      bank: {},
      paypal: { email: '' },
    };

    for (const record of result) {
      console.log(`[v0] PAYMENT METHODS PUBLIC API - Processing ${record.type} payment method`);

      if (record.type === 'crypto' && record.config) {
        paymentData.crypto = record.config;
      } else if (record.type === 'bank' && record.config) {
        paymentData.bank = record.config;
      } else if (record.type === 'paypal' && record.config) {
        paymentData.paypal = record.config;
      }
    }

    console.log('[v0] PAYMENT METHODS PUBLIC API - Returning payment methods:', paymentData);

    return NextResponse.json(
      {
        success: true,
        data: paymentData,
        message: 'Payment methods retrieved successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] PAYMENT METHODS PUBLIC API - Error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch payment methods: ${errorMsg}`,
        data: null,
      },
      { status: 500 }
    );
  }
}
