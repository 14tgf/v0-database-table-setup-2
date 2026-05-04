# Database Setup Instructions

Your application has been configured to use the **Neon PostgreSQL database** for real data persistence. Follow these steps to complete the setup.

## Step 1: Run Database Migration

The app needs to add the `preferred_currency` column to the users table. Visit this endpoint in your browser to run the migration:

```
https://your-app-url.vercel.app/api/setup/migrate
```

You should see:
```json
{
  "success": true,
  "message": "Migration completed - preferred_currency column added"
}
```

Or if already done:
```json
{
  "success": true,
  "message": "Column already exists"
}
```

## Step 2: Test Registration

Now register a new account with:
- **Email**: test@example.com  
- **Password**: SecurePassword123!
- **Full Name**: Test User

The system will:
1. Hash the password with bcryptjs
2. Store the user in the database
3. Create a JWT auth token
4. Set the auth cookie

## Step 3: Test Currency Persistence

1. After logging in, go to **Account Settings**
2. Select a different currency (e.g., EUR)
3. Click **Save Changes**
4. The currency is saved to the database
5. **Refresh the page** - your currency selection persists!

## Step 4: Test Login Validation

Try logging in with:
- A non-existent email → "Invalid email or password"
- Wrong password → "Invalid email or password"  
- Correct credentials → Successfully logs in

## Real Database Features Now Active

✅ **User Registration** - Users stored in `users` table with bcrypt password hashing
✅ **User Authentication** - JWT token validation, proper password verification
✅ **Currency Preferences** - Saved to database and persists across sessions
✅ **Session Management** - Auth tokens properly validated
✅ **Data Integrity** - All data persisted in Neon PostgreSQL

## What Was Changed

| Component | Change |
|-----------|--------|
| `/api/auth/register` | Now saves users to database with bcryptjs hashing |
| `/api/auth/login` | Validates credentials against database |
| `/api/user/preferences` | GET/PUT currency preferences from/to database |
| `/api/setup/migrate` | Runs migration to add `preferred_currency` column |
| Database | `users` table now has `preferred_currency` VARCHAR(10) column |

## Troubleshooting

### Migration fails
- Ensure DATABASE_URL is set in your Vercel environment
- Check that you have permissions on the Neon database

### Login shows "Invalid email or password"
- Make sure you registered the account first
- Verify the email and password are correct
- Password is case-sensitive

### Currency doesn't persist after refresh
- Ensure you're logged in (auth token exists)
- Check browser console for API errors
- Verify the Save Changes button showed success

## Environment Variables Required

```
DATABASE_URL=postgresql://...  # Your Neon connection string
JWT_SECRET=your-secret-key      # For signing JWT tokens (auto-generated)
NODE_ENV=production             # Set on Vercel
```

All are automatically configured in Vercel if Neon integration is connected.
