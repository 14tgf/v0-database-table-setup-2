# Database Setup Checklist

## Pre-Setup Requirements
- [ ] Neon PostgreSQL database is created and active
- [ ] DATABASE_URL environment variable is set in Vercel
- [ ] JWT_SECRET environment variable is set in Vercel
- [ ] Application builds successfully (`pnpm build`)

## Initial Setup
- [ ] Visit `/api/setup/migrate` endpoint to initialize database
- [ ] Confirm response shows `"success": true` 
- [ ] Verify tables were created by visiting `/api/setup/migrate` (GET)

## Testing Authentication
- [ ] Register a new account with valid email/password
- [ ] Verify user appears in database
- [ ] Login with registered credentials
- [ ] Attempt login with wrong password (should fail)
- [ ] Attempt login with non-existent email (should fail)

## Testing Currency Preferences
- [ ] Login to account
- [ ] Navigate to Account Settings
- [ ] Select a different currency
- [ ] Click "Save Changes"
- [ ] Verify success message appears
- [ ] **Refresh the page** - currency should persist
- [ ] Logout and login again - currency should still be saved

## Database Verification
Run these SQL queries to verify tables and data:

```sql
-- Check tables exist
\dt

-- Check users table
SELECT id, email, full_name, preferred_currency, created_at FROM users;

-- Check wallets table
SELECT user_id, balance, currency FROM user_wallets;

-- Check transactions table
SELECT user_id, type, amount, status, created_at FROM user_transactions;
```

## Troubleshooting Steps

### If migrations fail:
1. Check DATABASE_URL is correct
2. Verify Neon database is active (not paused)
3. Run migration again - it's safe to re-run
4. Check server logs for specific error messages

### If login fails:
1. Verify database connection works
2. Confirm user was registered (check SQL above)
3. Check password hash is not NULL
4. Review server logs for bcryptjs errors

### If currency doesn't persist:
1. Verify you're logged in (check auth_token cookie)
2. Check browser console for API errors
3. Verify database update query ran (check SQL above)
4. Try logout/login cycle

## Post-Setup Verification

### Run in Browser Console
```javascript
// Check auth cookie exists
console.log(document.cookie)

// Test API endpoints
fetch('/api/setup/migrate').then(r => r.json()).then(console.log)
```

### Expected Outputs

**Migration GET (status check):**
```json
{
  "status": "ok",
  "message": "Database connection successful",
  "tables": ["users", "user_wallets", "user_transactions"]
}
```

**Migration POST (run migrations):**
```json
{
  "success": true,
  "message": "All database migrations completed successfully",
  "results": [
    {
      "file": "000_init_database.sql",
      "status": "completed"
    },
    {
      "file": "001_add_preferred_currency.sql",
      "status": "completed"
    }
  ]
}
```

**Login Success:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "fullName": "User Name"
  }
}
```

**Preferences GET:**
```json
{
  "success": true,
  "preferredCurrency": "EUR"
}
```

## Going Live

Before deployment:
1. ✅ Run all checks above
2. ✅ Backup production database
3. ✅ Test migration on development database
4. ✅ Verify all environment variables are set in production
5. ✅ Run migrations on production
6. ✅ Test complete workflow in production
7. ✅ Monitor error logs for issues

## Support

For issues, check:
- Server logs: Look for `[v0]` prefixed messages
- Database logs: Check Neon dashboard
- Browser console: Check for API error messages
- Network tab: Verify requests/responses
- Documentation: See DATABASE_SETUP.md for detailed info
