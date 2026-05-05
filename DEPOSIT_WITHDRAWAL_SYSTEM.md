# Deposit & Withdrawal System Documentation

## Overview

The deposit and withdrawal system is fully integrated with the Neon database and provides a complete admin approval workflow. Users can submit deposits and withdrawals, and admins can approve or reject them with automatic wallet balance updates.

## Database Schema

### Tables Created

1. **payment_methods** - Admin-configured payment methods
   - id (UUID)
   - method_name (VARCHAR)
   - network (VARCHAR)
   - payment_address (VARCHAR)
   - qr_image (TEXT)
   - enabled (BOOLEAN)
   - created_at, updated_at

2. **deposits** - User deposit requests
   - id (UUID)
   - user_id (UUID) - References users table
   - method_name (VARCHAR)
   - amount (NUMERIC)
   - tx_hash (VARCHAR) - Transaction hash for crypto
   - proof_upload (TEXT) - Path to uploaded proof file
   - note (TEXT)
   - status (VARCHAR) - 'pending', 'approved', 'rejected'
   - created_at, updated_at
   - approved_at, approved_by

3. **withdrawals** - User withdrawal requests
   - id (UUID)
   - user_id (UUID) - References users table
   - method_name (VARCHAR)
   - amount (NUMERIC)
   - destination_address (VARCHAR) - Crypto wallet address
   - destination_bank_details (TEXT) - Bank details as JSON
   - note (TEXT)
   - status (VARCHAR) - 'pending', 'approved', 'rejected'
   - created_at, updated_at
   - approved_at, approved_by

4. **wallet_transactions** - Transaction log for auditing
   - id (UUID)
   - user_id (UUID)
   - transaction_type (VARCHAR) - 'deposit', 'withdrawal'
   - amount (NUMERIC)
   - old_balance, new_balance (NUMERIC)
   - related_id (UUID) - ID of deposit/withdrawal
   - related_type (VARCHAR)
   - description (TEXT)
   - created_at

## API Endpoints

### Initialize Database Schema
```
POST /api/admin/init-schema
Headers: Authorization: Bearer {ADMIN_API_KEY}
```
Creates all required tables. Run once during setup.

### User Deposit Submission
```
POST /api/deposits/create
Authentication: Required (auth_token cookie)
Body: {
  method_name: "Bitcoin|Ethereum|USDT|USDC|PayPal",
  amount: 500.00,
  tx_hash?: "transaction_hash_for_crypto",
  proof_upload?: "file_path",
  note?: "optional note"
}
Response: { success: true, deposit: {...}, message: "..." }
```
Status starts as "pending" - wallet not credited yet.

### Admin Deposit Approval
```
POST /api/admin/deposits/approve
Authentication: Required (admin_token cookie)
Body: {
  deposit_id: "uuid",
  action: "approve|reject"
}
```
**If APPROVE:**
- Updates deposit status to "approved"
- Credits user's wallet with deposit amount
- Creates wallet transaction log entry
- Updates all dashboard balances

**If REJECT:**
- Updates deposit status to "rejected"
- No wallet changes

### Fetch Pending Deposits (Admin)
```
GET /api/admin/deposits
Authentication: Required (admin_token cookie)
Response: { success: true, withdrawals: [...] }
```
Returns all deposits sorted by pending first, then date descending.

### User Withdrawal Submission
```
POST /api/withdrawals/create
Authentication: Required (auth_token cookie)
Body: {
  method_name: "Bitcoin|Ethereum|USDT|USDC|PayPal|Bank",
  amount: 250.00,
  destination_address?: "crypto_wallet_address",
  destination_bank_details?: "JSON_bank_info",
  note?: "optional note"
}
```
**Validation:**
- User must have sufficient balance
- Amount must be > 0
- Status starts as "pending" - wallet not debited yet

### Admin Withdrawal Approval
```
POST /api/admin/withdrawals/approve
Authentication: Required (admin_token cookie)
Body: {
  withdrawal_id: "uuid",
  action: "approve|reject"
}
```
**If APPROVE:**
- Checks user still has sufficient balance
- Updates withdrawal status to "approved"
- Debits user's wallet with withdrawal amount
- Creates wallet transaction log entry

**If REJECT:**
- Updates withdrawal status to "rejected"
- No wallet changes

### Fetch Pending Withdrawals (Admin)
```
GET /api/admin/withdrawals
Authentication: Required (admin_token cookie)
Response: { success: true, withdrawals: [...] }
```

## Admin Pages

### Deposits Management
**Route:** `/admin/deposits`
- Displays all deposit requests
- Shows status (pending, approved, rejected)
- Expandable rows with full details (TX hash, proof, notes)
- Approve/Reject buttons for pending deposits
- Real-time updates after action

### Withdrawals Management
**Route:** `/admin/withdrawals`
- Displays all withdrawal requests
- Shows status (pending, approved, rejected)
- Expandable rows with destination details
- Approve/Reject buttons for pending withdrawals
- Real-time updates after action

### Admin Sidebar
Updated sidebar includes:
- Dashboard
- Users
- KYC Requests
- Membership Payments
- **Deposits** (new)
- **Withdrawals** (new)
- Payment Methods
- Settings

## User Pages

### Deposit Page
**Route:** `/dashboard/deposit`
- User selects payment method
- Submits amount + transaction proof
- Optional note
- Success message confirms pending status
- "Your deposit is pending admin approval"

### Withdrawal Page
**Route:** `/dashboard/withdraw`
- User selects payment method
- Submits amount + destination details
- Checks balance before submission
- Success message confirms pending status
- "Your withdrawal is pending admin approval"

## Important Flow

### Deposit Flow
```
User Submits Deposit
    ↓
deposits table: status = 'pending'
User balance: NO CHANGE
    ↓
Admin Reviews on /admin/deposits
    ↓
Admin Clicks Approve
    ↓
- deposits.status = 'approved'
- users.wallet_balance += amount
- wallet_transactions log created
- User sees updated balance on dashboard
```

### Withdrawal Flow
```
User Submits Withdrawal
    ↓
Check: user.wallet_balance >= amount
    ↓
withdrawals table: status = 'pending'
User balance: NO CHANGE yet
    ↓
Admin Reviews on /admin/withdrawals
    ↓
Admin Clicks Approve
    ↓
- Check: user still has balance
- withdrawals.status = 'approved'
- users.wallet_balance -= amount
- wallet_transactions log created
- User sees updated balance on dashboard
```

## Security Notes

1. **No Immediate Balance Changes** - Deposits don't credit and withdrawals don't debit until admin approval
2. **Balance Verification** - Withdrawals verify sufficient balance before processing
3. **Admin-Only Actions** - Deposits/withdrawals require valid admin token
4. **Transaction Logging** - All balance changes logged for auditing
5. **User Authentication** - All user endpoints require valid auth_token

## Setup Instructions

1. Run schema initialization:
```bash
curl -X POST http://localhost:3000/api/admin/init-schema \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY"
```

2. Update Payment Methods at `/admin/payments`

3. Users can now:
   - Submit deposits at `/dashboard/deposit`
   - Submit withdrawals at `/dashboard/withdraw`

4. Admins can:
   - Review deposits at `/admin/deposits`
   - Review withdrawals at `/admin/withdrawals`
   - Approve/reject to update balances

## Files Created

- `/app/api/admin/init-schema/route.ts` - Schema initialization
- `/app/api/deposits/create/route.ts` - Deposit submission
- `/app/api/admin/deposits/approve/route.ts` - Deposit approval
- `/app/api/admin/deposits/index/route.ts` - Fetch deposits
- `/app/api/withdrawals/create/route.ts` - Withdrawal submission
- `/app/api/admin/withdrawals/approve/route.ts` - Withdrawal approval
- `/app/api/admin/withdrawals/index/route.ts` - Fetch withdrawals
- `/app/admin/deposits/page.tsx` - Deposits admin page
- `/app/admin/withdrawals/page.tsx` - Withdrawals admin page
- `/components/admin/admin-sidebar.tsx` - Updated with new links

## Notes

- All deposit/withdrawal forms in `/dashboard/deposit` and `/dashboard/withdraw` already exist
- Admin payment configuration at `/admin/payments` already exists
- System uses Neon database via `@neondatabase/serverless`
- All wallet balance updates trigger dashboard refresh automatically
