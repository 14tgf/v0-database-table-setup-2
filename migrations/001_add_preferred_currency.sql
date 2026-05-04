-- Migration: Add preferred_currency column to users table
-- This migration adds support for persistent currency preference storage

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10) DEFAULT 'USD';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_preferred_currency 
ON users(preferred_currency);
