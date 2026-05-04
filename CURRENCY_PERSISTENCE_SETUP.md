## Currency Preference Persistence - Setup Instructions

### Overview
Currency preferences are now persisted in the Neon database. When users save their preferred currency on the Account page, it's stored in the database and loaded automatically on subsequent logins.

### Implementation Details

#### 1. Database Schema
A new column `preferred_currency` has been added to the `users` table:
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10) DEFAULT 'USD';
```

**Run the Migration:**

Option A: Via API (easiest for dev)
```bash
curl -X POST http://localhost:3000/api/admin/migrate \
  -H "x-admin-key: your-migration-key" \
  -H "Content-Type: application/json"
```

Option B: Via SQL client
Execute `/migrations/001_add_preferred_currency.sql` in your Neon dashboard

#### 2. API Endpoints

**GET /api/user/preferences**
- Fetches user's saved currency preference
- Returns: `{ preferredCurrency: "USD" }`
- Requires: Valid auth token cookie

**PUT /api/user/preferences**
- Saves user's currency preference to database
- Body: `{ preferredCurrency: "USD" }`
- Returns: `{ success: true, preferredCurrency: "USD" }`
- Requires: Valid auth token cookie

#### 3. Currency Provider Flow

1. **App Init**: `CurrencyProvider` fetches user's saved currency from `/api/user/preferences`
2. **Hydration**: Sets initial state from database value (defaults to USD)
3. **User Change**: User selects new currency in CurrencySelector
4. **Save**: User clicks "Save Changes" on Account page
5. **API Call**: AccountActions component calls `PUT /api/user/preferences`
6. **Persistence**: Currency saved to database
7. **State Update**: Global currency context updates
8. **Global Sync**: All components using `useCurrency()` automatically update

#### 4. Global Currency Usage

The saved currency is automatically applied to:
- Dashboard balances (BalanceCard)
- Wallet displays (useWallet hook)
- All formatted currency values (useCurrencyFormatter)
- Transactions and portfolio display

#### 5. Files Modified

- `/app/providers/currency-provider.tsx` - Added database fetch on init
- `/components/account/account-actions.tsx` - Added API save call
- `/app/dashboard/account/page.tsx` - Added currency state tracking
- `/app/api/user/preferences/route.ts` - New API endpoint for get/put preferences
- `/app/api/admin/migrate/route.ts` - Migration endpoint
- `/migrations/001_add_preferred_currency.sql` - Database migration

### Testing

1. Login to the app
2. Navigate to Account Settings
3. Select a new currency (e.g., EUR, GBP, NGN)
4. Click "Save Changes"
5. You should see "Saved successfully" message
6. Refresh the page - currency should persist
7. Logout and login again - currency should still be saved
8. Check Dashboard and Wallet - all balances should display in saved currency

### Production Deployment

Before deploying to production:

1. Run the migration to add the column (via Neon dashboard or migration endpoint with proper auth)
2. Ensure `ADMIN_MIGRATION_KEY` environment variable is set for migration endpoint
3. The app will automatically load and save preferences for authenticated users
4. No code changes needed after migration is run
