# Database Setup Guide for X Holding

## Overview

This project uses **Neon PostgreSQL** as the primary database. The database initialization is fully automated through migration scripts that are executed via API endpoints.

## Database Schema

The database includes the following tables:

### 1. **users** table
Stores user account information:
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique email address
- `password_hash` (VARCHAR) - Bcrypt hashed password
- `full_name` (VARCHAR) - User's full name
- `account_type` (VARCHAR) - Account level (standard, premium, admin)
- `status` (VARCHAR) - Account status (active, inactive, suspended)
- `wallet_balance` (DECIMAL) - Current balance
- `preferred_currency` (VARCHAR) - User's preferred currency (USD, EUR, GBP, etc.)
- `created_at` (TIMESTAMP) - Account creation date
- `updated_at` (TIMESTAMP) - Last update timestamp
- `last_login` (TIMESTAMP) - Last login date

### 2. **user_wallets** table
Detailed wallet tracking per currency:
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users table
- `balance` (DECIMAL) - Wallet balance
- `currency` (VARCHAR) - Currency type
- `total_deposits` (DECIMAL) - Total deposits ever made
- `total_withdrawals` (DECIMAL) - Total withdrawals ever made
- `total_invested` (DECIMAL) - Total amount invested
- `created_at` (TIMESTAMP) - Wallet creation date
- `updated_at` (TIMESTAMP) - Last update timestamp

### 3. **user_transactions** table
Stores transaction history:
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users table
- `type` (VARCHAR) - Transaction type (deposit, withdrawal, investment, dividend)
- `amount` (DECIMAL) - Transaction amount
- `currency` (VARCHAR) - Currency type
- `status` (VARCHAR) - Transaction status (pending, completed, failed)
- `description` (TEXT) - Transaction description
- `created_at` (TIMESTAMP) - Transaction date
- `updated_at` (TIMESTAMP) - Last update timestamp

## Migration System

### Migration Files Location
All migration files are stored in `/migrations/` directory and execute in alphabetical order:
- `000_init_database.sql` - Initial database schema creation (runs first)
- `001_add_preferred_currency.sql` - Additional schema updates

### Migration Execution

#### Option 1: Via API Endpoint (Recommended)

**Run all migrations:**
```bash
curl -X POST http://localhost:3000/api/setup/migrate
```

**Check migration status and existing tables:**
```bash
curl http://localhost:3000/api/setup/migrate
```

Response will show all tables in the public schema.

#### Option 2: Manual SQL Execution

Connect directly to your Neon database and execute the migration files:

```sql
-- Run migrations manually via psql
\i migrations/000_init_database.sql
\i migrations/001_add_preferred_currency.sql
```

## Environment Variables

Ensure these environment variables are set in your `.env.local`:

```
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

To get your DATABASE_URL from Neon:
1. Log in to your Neon dashboard
2. Select your project and database
3. Click "Connection string"
4. Copy the full connection string
5. Add to Vercel Vars in project settings

## Authentication Flow

### User Registration

**Endpoint:** `POST /api/auth/register`

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "John Doe"
}
```

Features:
- Validates email doesn't already exist
- Passwords hashed with bcryptjs (10 salt rounds)
- Returns JWT token in HTTP-only secure cookie
- Auto-creates wallet entry with USD currency
- User status set to "active"

### User Login

**Endpoint:** `POST /api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Features:
- Validates email exists in database
- Verifies password hash matches
- Checks account status (must be "active")
- Returns JWT token in HTTP-only secure cookie
- Valid for 24 hours
- Updates last_login timestamp

## Currency Preferences

### Save Currency Preference

**Endpoint:** `PUT /api/user/preferences`

```json
{
  "preferredCurrency": "EUR"
}
```

Features:
- Requires valid JWT authentication token
- Persists user's selected currency to database
- Returns saved currency value
- Automatically loads on next login

### Load Currency Preference

**Endpoint:** `GET /api/user/preferences`

Features:
- Returns user's saved currency preference
- Defaults to USD if not previously set
- Requires valid JWT authentication token
- Always returns correct value from database

## First-Time Setup Steps

### Step 1: Verify Database Connection
Ensure DATABASE_URL environment variable is set and correct:
```bash
# Check if DATABASE_URL is configured
echo $DATABASE_URL
```

### Step 2: Run Database Migrations
Initialize the database schema by running migrations:

**Via API (Recommended):**
```bash
curl -X POST http://localhost:3000/api/setup/migrate
```

**Response:**
```json
{
  "success": true,
  "message": "All database migrations completed successfully",
  "results": [
    {
      "file": "000_init_database.sql",
      "status": "completed",
      "message": "Migration completed successfully"
    },
    {
      "file": "001_add_preferred_currency.sql",
      "status": "completed",
      "message": "Migration completed successfully"
    }
  ]
}
```

### Step 3: Verify Migration Success
Check that tables were created:
```bash
curl http://localhost:3000/api/setup/migrate
```

You should see tables: `users`, `user_wallets`, `user_transactions`

### Step 4: Register a New User
1. Go to the login page
2. Click "Register"
3. Enter email, password, and full name
4. Submit the form
5. You'll be automatically logged in with JWT token

### Step 5: Test Currency Persistence
1. Navigate to **Account Settings**
2. Select a different currency (e.g., EUR, GBP)
3. Click **Save Changes**
4. You should see "Preferences saved successfully"
5. **Refresh the page** - your currency selection should persist!

## What's Included

✅ **Complete Database Schema** - users, wallets, transactions tables
✅ **Secure Authentication** - bcryptjs password hashing, JWT tokens
✅ **User Registration** - Email validation, duplicate prevention
✅ **User Login** - Password verification, session management
✅ **Currency Preferences** - Database persistence across sessions
✅ **Automatic Migrations** - Safe, idempotent migration system
✅ **Database Triggers** - Automatic timestamp updates
✅ **Performance Indexes** - Fast queries on user lookups

## Troubleshooting

### Error: "DATABASE_URL not set"
**Solution:**
- Set `DATABASE_URL` in environment variables
- Verify connection string format: `postgresql://user:password@host:port/database?sslmode=require`
- Check Vercel project settings > Vars

### Error: "Column already exists" (during migration)
**Solution:**
- This is normal! Migrations use `IF NOT EXISTS`
- Run the migration again - it will skip existing columns
- No data loss occurs

### Login Error: "Invalid email or password"
**Solution:**
- Verify you registered the account first
- Check email/password are correct (case-sensitive)
- Try registering a new test account
- Check database has `users` table (run migration)

### Preferences Not Persisting After Refresh
**Solution:**
- Verify you're logged in (check auth_token cookie)
- Ensure browser cookies are enabled
- Check browser console for API errors
- Verify DATABASE_URL points to correct database
- Run migrations again: `curl -X POST /api/setup/migrate`

### Connection Timeout
**Solution:**
- Check Neon project is active (not paused)
- Verify DATABASE_URL includes `?sslmode=require`
- Test connection: `curl http://localhost:3000/api/setup/migrate` (GET)
- Check network connectivity to Neon

## Production Deployment

Before deploying to production:

1. **Test migrations on development database first**
2. **Verify all environment variables are set:**
   - DATABASE_URL pointing to production database
   - JWT_SECRET set to secure random string
   - NODE_ENV=production
3. **Run migrations on production:**
   ```bash
   curl -X POST https://your-domain.com/api/setup/migrate
   ```
4. **Verify migration success:**
   ```bash
   curl https://your-domain.com/api/setup/migrate
   ```
5. **Test complete workflow:**
   - Register new account
   - Login with credentials
   - Change currency preference
   - Refresh and verify persistence
6. **Monitor logs for errors**
7. **Back up database before any changes**

## Support & Debugging

### Check database status
```bash
GET /api/setup/migrate
```

### View migration results
```bash
POST /api/setup/migrate
```

### Check server logs
Look for `[v0]` prefixed console messages showing:
- Migration execution status
- Authentication attempts
- Database queries
- Error details

### Database inspection
Connect directly to Neon:
```bash
psql postgresql://user:password@host/database
SELECT * FROM users;
SELECT * FROM user_wallets;
SELECT * FROM user_transactions;
```

