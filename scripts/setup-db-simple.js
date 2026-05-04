#!/usr/bin/env node

/**
 * Database Setup Script for Neon PostgreSQL
 * This script initializes the database schema for the X Holding application
 * 
 * Usage: npm run setup-db
 * 
 * Environment Variables Required:
 * - DATABASE_URL: Neon PostgreSQL connection string
 */

const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set');
  console.error('Please set DATABASE_URL in your .env.local or Vercel environment');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function setupDatabase() {
  try {
    console.log('🔄 Starting database setup...\n');

    // 1. Create users table
    console.log('📝 Creating users table...');
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Users table created\n');

    // 2. Create audit_logs table
    console.log('📝 Creating audit_logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        action VARCHAR(255) NOT NULL,
        description TEXT,
        ip_address VARCHAR(255),
        user_agent TEXT,
        status VARCHAR(50) DEFAULT 'success',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    console.log('✅ Audit logs table created\n');

    // 3. Create sessions table
    console.log('📝 Creating sessions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        token_hash VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    console.log('✅ Sessions table created\n');

    // 4. Create indexes
    console.log('📝 Creating performance indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)',
      'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)',
    ];

    for (const indexQuery of indexes) {
      await sql.query(indexQuery);
    }
    console.log('✅ All indexes created\n');

    // 5. Verify tables
    console.log('🔍 Verifying database setup...');
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log('✅ Database tables verified:');
    tables.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n✨ Database setup completed successfully!\n');
    console.log('Your Neon PostgreSQL database is ready for the X Holding application.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Verify DATABASE_URL is correct');
    console.error('2. Check Neon project credentials');
    console.error('3. Ensure network connectivity to Neon');
    process.exit(1);
  }
}

setupDatabase();
