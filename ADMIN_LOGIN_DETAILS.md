# Admin Login Details & Setup

## Default Admin Credentials

**Email:** `admin@xholding.com`  
**Password:** `AdminPassword123!`

---

## How to Access Admin Dashboard

1. Navigate to: `https://your-domain.com/admin/login`
2. Enter the email and password above
3. Click "Login"
4. You'll be redirected to `/admin` dashboard

---

## Admin Dashboard Features

### 1. Users Management (`/admin/users`)
- View all registered users
- Search users by name or email
- **Adjust User Balances:**
  - Click the edit icon next to a user
  - Select credit (+) to add funds or debit (-) to remove funds
  - Enter the amount
  - Add a reason/note (optional)
  - Click Confirm
  - Changes are logged in the audit_logs table

### 2. Admin Features
- User balance adjustments with audit trail
- Session management
- Admin activity logging

---

## Security Notes

### ⚠️ IMPORTANT

1. **Change Default Password Immediately:**
   - After first login, change the admin password
   - Use a strong, unique password
   - Never share admin credentials

2. **Session Management:**
   - Admin sessions are stored in the `admin_sessions` table
   - Sessions expire after 24 hours for security
   - Sessions include IP address and user agent tracking

3. **Audit Logging:**
   - All balance adjustments are logged in `audit_logs`
   - Tracks: user, action, amount, reason, timestamp
   - Use for compliance and troubleshooting

---

## Database Tables

### admins
```sql
- id (UUID): Unique admin identifier
- email (VARCHAR): Admin email (unique)
- password_hash (VARCHAR): Bcrypt hashed password
- full_name (VARCHAR): Admin name
- status (VARCHAR): 'active' or 'inactive'
- last_login (TIMESTAMP): Last login time
- created_at (TIMESTAMP): Account creation date
- updated_at (TIMESTAMP): Last update date
```

### admin_sessions
```sql
- id (VARCHAR): Session ID
- admin_id (UUID): Reference to admin
- token_hash (VARCHAR): JWT token hash
- expires_at (TIMESTAMP): Session expiration
- user_agent (TEXT): Browser/client info
- ip_address (VARCHAR): IP address
- created_at (TIMESTAMP): Session creation
```

---

## API Endpoints (Admin Only)

### Get All Users
```
GET /api/admin/users?search=email
Headers: Authorization: Bearer <admin_token>
```

### Adjust User Balance
```
PUT /api/admin/users/adjust-balance
Headers: Authorization: Bearer <admin_token>
Body: {
  "userId": "user-uuid",
  "amount": 100,
  "type": "credit" | "debit",
  "reason": "Adjustment reason"
}
```

---

## Troubleshooting

### Login Not Working
- Verify email and password are correct
- Check that admin account exists in `admins` table
- Clear browser cookies and try again

### Can't Access Admin Dashboard
- Confirm you're logged in as admin
- Check that admin token is valid (not expired)
- Verify admin session exists in `admin_sessions` table

### Balance Adjustment Failed
- Ensure user ID is valid
- Check that amount is positive and reasonable
- Verify you have admin permissions
- Check audit_logs table for error details

---

## Setting Up New Admin Accounts

To create additional admin accounts, insert them into the `admins` table:

```sql
INSERT INTO admins (id, email, password_hash, full_name, status)
VALUES (
  gen_random_uuid(),
  'newemail@xholding.com',
  'bcrypt_hashed_password',
  'Admin Name',
  'active'
);
```

**Note:** Passwords must be hashed with bcryptjs (10 rounds) before insertion.

---

## Admin Session Lifecycle

1. Admin logs in at `/admin/login`
2. Credentials verified against `admins` table
3. JWT token created (24-hour expiration)
4. Session stored in `admin_sessions` table
5. Token sent in HTTP-only cookie
6. Admin can now access protected routes
7. Session expires after 24 hours or on logout

---

## Logout

Admin can logout from the admin dashboard. Logging out:
- Deletes the session from `admin_sessions`
- Clears the authentication cookie
- Redirects to `/admin/login`

