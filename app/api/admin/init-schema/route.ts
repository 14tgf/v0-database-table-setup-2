import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[v0] Initializing deposit/withdrawal schema...');

    // Payment Methods Table
    await sql`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        method_name VARCHAR(50) NOT NULL,
        network VARCHAR(50),
        payment_address VARCHAR(255) NOT NULL,
        qr_image TEXT,
        enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(method_name, network)
      )
    `;

    // Deposits Table
    await sql`
      CREATE TABLE IF NOT EXISTS deposits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        method_id UUID REFERENCES payment_methods(id),
        method_name VARCHAR(50) NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        tx_hash VARCHAR(255),
        proof_upload TEXT,
        note TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        approved_by UUID REFERENCES admins(id)
      )
    `;

    // Withdrawals Table
    await sql`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        method_name VARCHAR(50) NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        destination_address VARCHAR(255),
        destination_bank_details TEXT,
        note TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        approved_by UUID REFERENCES admins(id)
      )
    `;

    // Wallet Transaction Log
    await sql`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        transaction_type VARCHAR(50) NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        old_balance NUMERIC(15, 2),
        new_balance NUMERIC(15, 2),
        related_id UUID,
        related_type VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id)`;

    console.log('[v0] Database schema initialized successfully');

    return NextResponse.json({
      success: true,
      message: 'Database schema initialized',
    });
  } catch (error) {
    console.error('[v0] Schema initialization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Schema initialization failed' },
      { status: 500 }
    );
  }
}
