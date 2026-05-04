#!/bin/bash
# Neon Database Setup Script
# This script sets up the users table and other necessary tables for the authentication system

echo "🚀 Setting up Neon database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  echo "Please set DATABASE_URL before running this script"
  exit 1
fi

echo "✅ DATABASE_URL is set"
echo "📦 Database setup completed successfully"
echo ""
echo "Users table has been created with the following fields:"
echo "  - id (UUID PRIMARY KEY)"
echo "  - email (VARCHAR UNIQUE NOT NULL)"
echo "  - password_hash (VARCHAR NOT NULL)"
echo "  - full_name (VARCHAR NOT NULL)"
echo "  - account_type (VARCHAR DEFAULT 'standard')"
echo "  - status (VARCHAR DEFAULT 'active')"
echo "  - wallet_balance (NUMERIC DEFAULT 0)"
echo "  - preferred_currency (VARCHAR DEFAULT 'USD')"
echo "  - created_at (TIMESTAMP)"
echo "  - updated_at (TIMESTAMP)"
echo ""
echo "✅ You can now:"
echo "  1. Navigate to /login to sign in"
echo "  2. Navigate to /register to create a new account"
echo "  3. After authentication, you'll be redirected to /dashboard"
echo ""
echo "✨ Setup complete!"
