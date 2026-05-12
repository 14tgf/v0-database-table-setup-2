'use strict';

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      let value = valueParts.join('=').trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key.trim()] = value;
    }
  });
}

const { neon } = require('@neondatabase/serverless');
const { v4: uuidv4 } = require('uuid');

async function setupDatabase() {
  console.log('🚀 Initializing Neon database setup...\n');

  // Check environment variable
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Create users table
    console.log('📦 Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        account_type VARCHAR(50) DEFAULT 'standard',
        status VARCHAR(50) DEFAULT 'active',
        wallet_balance NUMERIC DEFAULT 0,
        preferred_currency VARCHAR(10) DEFAULT 'USD',
        kyc_status VARCHAR(50) DEFAULT 'pending',
        verification_status VARCHAR(50) DEFAULT 'unverified',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Users table created successfully\n');

    // Create admins table
    console.log('👨‍💼 Creating admins table...');
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Admins table created successfully\n');

    // Create indexes for better query performance
    console.log('📊 Creating database indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email)`;
    console.log('✅ Indexes created successfully\n');

    // Create audit log table for tracking changes
    console.log('📋 Creating audit_logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        description TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Audit logs table created successfully\n');

    // Create sessions table for managing user sessions
    console.log('🔐 Creating sessions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used_at TIMESTAMP
      )
    `;
    console.log('✅ Sessions table created successfully\n');

    // Create admin sessions table for managing admin sessions
    console.log('🔐 Creating admin_sessions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id VARCHAR(255) PRIMARY KEY,
        admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        user_agent TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash ON admin_sessions(token_hash)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at)`;
    console.log('✅ Admin sessions table created successfully\n');

    // Create companies table for stock trading
    console.log('🏢 Creating companies table...');
    await sql`
      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        symbol VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        logo VARCHAR(500),
        exchange VARCHAR(50),
        sector VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_companies_symbol ON companies(symbol)`;
    console.log('✅ Companies table created successfully\n');

    // Create investment plans table
    console.log('💼 Creating investment_plans table...');
    await sql`
      CREATE TABLE IF NOT EXISTS investment_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        plan_name VARCHAR(255) NOT NULL,
        description TEXT,
        min_investment NUMERIC NOT NULL,
        max_investment NUMERIC NOT NULL,
        expected_return NUMERIC NOT NULL,
        duration_months INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_plans_status ON investment_plans(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_plans_company ON investment_plans(company_id)`;
    console.log('✅ Investment plans table created successfully\n');

    // Create user investments table
    console.log('🎯 Creating user_investments table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_investments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id UUID NOT NULL REFERENCES investment_plans(id) ON DELETE CASCADE,
        amount NUMERIC NOT NULL,
        shares NUMERIC,
        status VARCHAR(50) DEFAULT 'active',
        returns NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_investments_user ON user_investments(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_investments_plan ON user_investments(plan_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_investments_status ON user_investments(status)`;
    console.log('✅ User investments table created successfully\n');

    // Create user portfolio stocks table
    console.log('📈 Creating user_portfolio_stocks table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_portfolio_stocks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        symbol VARCHAR(20) NOT NULL,
        shares NUMERIC(15, 8) NOT NULL DEFAULT 0,
        average_cost NUMERIC(15, 2) NOT NULL,
        current_price NUMERIC(15, 2),
        current_value NUMERIC(15, 2) DEFAULT 0,
        gain_loss NUMERIC(15, 2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, company_id)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_portfolio_user ON user_portfolio_stocks(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_portfolio_company ON user_portfolio_stocks(company_id)`;
    console.log('✅ User portfolio stocks table created successfully\n');

    // Create stock prices table for historical tracking
    console.log('💹 Creating stock_prices table...');
    await sql`
      CREATE TABLE IF NOT EXISTS stock_prices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        price NUMERIC NOT NULL,
        change NUMERIC,
        percent_change NUMERIC,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_prices_company ON stock_prices(company_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_prices_timestamp ON stock_prices(timestamp DESC)`;
    console.log('✅ Stock prices table created successfully\n');

    // Create payment methods table for storing payment configurations
    console.log('💳 Creating payment_methods table...');
    await sql`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL UNIQUE,
        config JSONB,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(type)`;
    console.log('✅ Payment methods table created successfully\n');

    // Create wallet transactions table
    console.log('💰 Creating wallet_transactions table...');
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
    await sql`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id)`;
    console.log('✅ Wallet transactions table created successfully\n');

    // Create KYC submissions table
    console.log('🔐 Creating kyc_submissions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS kyc_submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        full_name VARCHAR(255) NOT NULL,
        id_type VARCHAR(50),
        id_number VARCHAR(100),
        id_front_image TEXT,
        id_back_image TEXT,
        selfie_image TEXT,
        address_document TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        rejection_reason TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_id ON kyc_submissions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON kyc_submissions(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_kyc_submissions_created_at ON kyc_submissions(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_status ON kyc_submissions(user_id, status)`;
    console.log('✅ KYC submissions table created successfully\n');

    // Create giveaways table
    console.log('🎁 Creating giveaways table...');
    await sql`
      CREATE TABLE IF NOT EXISTS giveaways (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        prize_value NUMERIC(15, 2),
        prize_type VARCHAR(100),
        participants_count INTEGER DEFAULT 0,
        ends_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Giveaways table created successfully\n');

    // Create giveaway_entries table
    console.log('🎁 Creating giveaway_entries table...');
    await sql`
      CREATE TABLE IF NOT EXISTS giveaway_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        giveaway_id VARCHAR(100) NOT NULL REFERENCES giveaways(id),
        vip_membership_id UUID,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_giveaway_entries_user_id ON giveaway_entries(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_giveaway_entries_giveaway_id ON giveaway_entries(giveaway_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_giveaway_entries_user_giveaway ON giveaway_entries(user_id, giveaway_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_giveaway_entries_created_at ON giveaway_entries(created_at)`;
    console.log('✅ Giveaway entries table created successfully\n');

    // Create orders table for product purchases
    console.log('🛒 Creating orders table...');
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id VARCHAR(100),
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER DEFAULT 1,
        amount NUMERIC(15, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending Payment Review',
        payment_method VARCHAR(100),
        tx_hash VARCHAR(255),
        proof_upload VARCHAR(500),
        payment_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)`;
    console.log('✅ Orders table created successfully\n');

    // Create deposits table for deposit requests
    console.log('💵 Creating deposits table...');
    await sql`
      CREATE TABLE IF NOT EXISTS deposits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        method_name VARCHAR(100) NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        tx_hash VARCHAR(255),
        proof_upload VARCHAR(500),
        note TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_deposits_created_at ON deposits(created_at DESC)`;
    console.log('✅ Deposits table created successfully\n');

    // Create withdrawals table for withdrawal requests
    console.log('🏦 Creating withdrawals table...');
    await sql`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        method_name VARCHAR(100) NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        destination_address VARCHAR(500),
        destination_bank_details TEXT,
        note TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at DESC)`;
    console.log('✅ Withdrawals table created successfully\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log('📊 Database tables:');
    tables.forEach((table) => {
      console.log(`   ✓ ${table.table_name}`);
    });

    console.log('\n✨ Database setup complete!\n');
    console.log('📝 Next steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Visit: http://localhost:3000/register');
    console.log('  3. Create a new account');
    console.log('  4. You will be redirected to /dashboard');
    console.log('\n🎉 All set! Happy coding!\n');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
    process.exit(1);
  }
}

// Run setup
setupDatabase();
