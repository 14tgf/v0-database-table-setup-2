# Admin Balance Adjustment Feature

## Overview
The admin balance adjustment feature allows administrators to credit or debit user wallet balances directly from the admin dashboard. This is useful for manual corrections, promotions, penalties, or customer service adjustments.

## Features

### 1. User Management Interface
- **Location**: `/admin/users`
- **Search Functionality**: Search users by name or email
- **Real-time Updates**: User list automatically fetches when search changes
- **Balance Display**: Shows current balance for each user
- **Quick Edit**: Click the edit icon to open balance adjustment modal

### 2. Balance Adjustment Modal
The modal allows admins to:
- View user details (name and current balance)
- Select adjustment type: Credit (+) or Debit (-)
- Enter adjustment amount
- Add a reason/note for the adjustment
- Preview the new balance
- Confirm or cancel the adjustment

### 3. Database Tracking
All balance adjustments are:
- Logged in `audit_logs` table with action "BALANCE_ADJUSTMENT"
- Include the amount, type, and reason
- Timestamped with `created_at`
- Linked to the user ID for full traceability

## API Endpoints

### GET `/api/admin/users`
Fetches all active users with optional search filter.

**Query Parameters:**
- `search` (optional): Search term for filtering by name or email

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "uuid",
      "name": "User Name",
      "email": "user@example.com",
      "balance": 1000.50,
      "status": "active",
      "joinDate": "May 4, 2026"
    }
  ],
  "total": 1
}
```

### PUT `/api/admin/users/adjust-balance`
Adjusts a user's wallet balance.

**Request Body:**
```json
{
  "userId": "uuid",
  "amount": 100.50,
  "type": "credit",
  "reason": "Promotional bonus"
}
```

**Parameters:**
- `userId`: User ID to adjust (required)
- `amount`: Amount to adjust (required, numeric)
- `type`: "credit" or "debit" (required)
- `reason`: Reason/note for adjustment (optional)

**Response:**
```json
{
  "success": true,
  "message": "Balance adjusted successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "User Name",
    "previousBalance": 500.00,
    "newBalance": 600.00,
    "adjustmentAmount": 100.00,
    "type": "credit",
    "reason": "Promotional bonus"
  }
}
```

**Error Cases:**
- Missing required fields: Returns 400
- Invalid type (not "credit" or "debit"): Returns 400
- User not found: Returns 404
- Insufficient balance for debit: Returns 400
- Server error: Returns 500

## Validation & Security

### Input Validation
- All required fields must be provided
- Amount must be numeric and positive
- Type must be either "credit" or "debit"
- Prevents negative balance debits (validates before update)

### Security Considerations
- Admin authentication is verified in `/admin/layout.tsx`
- Only authenticated admins can access `/admin/users`
- API endpoints should have admin verification middleware (recommended for production)
- All adjustments are logged for audit purposes

## Usage Example

### For Admins:
1. Navigate to Admin Dashboard → Users
2. Search for the user by name or email
3. Click the Edit (pencil) icon for the user
4. In the modal:
   - Select "Credit" or "Debit"
   - Enter the amount
   - Add a reason (e.g., "Promotional bonus", "Refund", "Correction")
   - Review the new balance
   - Click "Confirm"
5. Success message appears confirming the adjustment
6. User's balance updates immediately in the table

### Database Query to View Adjustment History:
```sql
SELECT 
  a.action,
  a.description,
  a.created_at,
  u.full_name,
  u.email
FROM audit_logs a
JOIN users u ON a.user_id = u.id
WHERE a.action = 'BALANCE_ADJUSTMENT'
ORDER BY a.created_at DESC
LIMIT 50;
```

## Development Notes

### Files Created/Modified
- `/app/api/admin/users/route.ts` - Fetch users endpoint
- `/app/api/admin/users/adjust-balance/route.ts` - Balance adjustment endpoint
- `/app/admin/users/page.tsx` - Updated with API integration

### Dependencies Used
- Neon PostgreSQL via `@neondatabase/serverless`
- Next.js API routes
- React hooks (useState, useEffect)

### Future Enhancements
- Add bulk balance adjustments
- Export adjustment history as CSV
- Admin approval workflow for large adjustments
- Automatic balance adjustment rules
- Scheduled adjustments
- Balance adjustment history view per user

## Troubleshooting

### Balance not updating?
- Check that the API response includes "success: true"
- Verify the user ID is correct
- Check browser console for errors
- Verify admin authentication status

### Can't see users?
- Ensure you're logged in as an admin
- Check that users exist in the database with "active" status
- Try searching with different keywords

### Negative balance error?
- You're trying to debit more than the user's current balance
- Reduce the debit amount
- Add funds first if needed

## API Response Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Balance adjusted successfully |
| 400 | Bad Request | Missing required fields or invalid input |
| 404 | Not Found | User not found |
| 500 | Server Error | Database or server error occurred |
