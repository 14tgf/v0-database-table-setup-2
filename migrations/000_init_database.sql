-- Database Initialization Script
-- This script creates all necessary tables for the X Holding application

-- Drop existing tables if they exist (for fresh setup)
-- DROP TABLE IF EXISTS user_transactions CASCADE;
-- DROP TABLE IF EXISTS user_wallets CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) DEFAULT 'standard', -- standard, premium, admin
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, suspended
  wallet_balance DECIMAL(20, 8) DEFAULT 0,
  preferred_currency VARCHAR(10) DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Create user_wallets table for detailed wallet tracking
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(20, 8) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  total_deposits DECIMAL(20, 8) DEFAULT 0,
  total_withdrawals DECIMAL(20, 8) DEFAULT 0,
  total_invested DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, currency)
);

-- Create user_transactions table for transaction history
CREATE TABLE IF NOT EXISTS user_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- deposit, withdrawal, investment, dividend
  amount DECIMAL(20, 8) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'completed', -- pending, completed, failed
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_preferred_currency ON users(preferred_currency);
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_type ON user_transactions(type);
CREATE INDEX IF NOT EXISTS idx_user_transactions_created_at ON user_transactions(created_at);

-- Create trigger to update updated_at timestamp on users table
CREATE OR REPLACE FUNCTION update_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_timestamp_trigger ON users;
CREATE TRIGGER update_users_timestamp_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_timestamp();

-- Create trigger to update updated_at timestamp on user_wallets table
CREATE OR REPLACE FUNCTION update_wallets_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_wallets_timestamp_trigger ON user_wallets;
CREATE TRIGGER update_wallets_timestamp_trigger
BEFORE UPDATE ON user_wallets
FOR EACH ROW
EXECUTE FUNCTION update_wallets_timestamp();

-- Create trigger to update updated_at timestamp on transactions table
CREATE OR REPLACE FUNCTION update_transactions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_transactions_timestamp_trigger ON user_transactions;
CREATE TRIGGER update_transactions_timestamp_trigger
BEFORE UPDATE ON user_transactions
FOR EACH ROW
EXECUTE FUNCTION update_transactions_timestamp();
