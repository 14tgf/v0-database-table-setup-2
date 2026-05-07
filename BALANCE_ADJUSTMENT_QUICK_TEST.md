# Balance Adjustment System - Quick Start Guide

## Test User Available
- **Email**: cedoe70@gmail.com
- **Name**: Carl
- **Current Wallet Balance**: $0.00
- **Status**: Active

---

## QUICK TEST (5 minutes)

### Step 1: Access the Admin Dashboard
1. Open your app and log in as admin
2. Navigate to `/admin/users`
3. You should see the Users management page

### Step 2: Find the Test User
1. In the search box, type "carl" or "cedoe70@gmail.com"
2. Click the Edit (pencil icon) button next to Carl's row
3. The Balance Adjustment modal should open

### Step 3: Test Credit Operation
1. In the modal, ensure "Wallet" is selected (highlighted in blue)
2. Make sure "Credit (+)" is selected
3. Enter Amount: `100`
4. Enter Note: `Test credit adjustment`
5. You should see "New Balance: $100.00" preview
6. Click "Confirm"
7. You should see success message: "wallet balance adjusted successfully for Carl"
8. Carl's balance in table should now show "$100.00"

### Step 4: Test Debit Operation
1. Click Edit button again for Carl
2. Select "Credit (+)" - NO, select "Debit (-)"
3. Enter Amount: `30`
4. Enter Note: `Test debit adjustment`
5. You should see "New Balance: $70.00" preview
6. Click "Confirm"
7. Success! Carl's balance should now show "$70.00"

### Step 5: Verify Audit Log
Run this query in your database:
```sql
SELECT action, entity_id, new_values FROM audit_logs 
WHERE entity_type = 'user' 
ORDER BY created_at DESC LIMIT 2;
```

You should see 2 entries:
- One with +100 credit
- One with -30 debit

---

## API ENDPOINTS REFERENCE

### Get All Users
```bash
curl -X GET "http://localhost:3000/api/admin/users"
```

Response:
```json
{
  "success": true,
  "users": [
    {
      "id": "bbcdb443-86fe-4327-8886-0e26b47300c0",
      "name": "Carl",
      "email": "cedoe70@gmail.com",
      "balance": 70,
      "status": "active",
      "joinDate": "May 7, 2024"
    }
  ],
  "total": 1
}
```

### Search Users
```bash
curl -X GET "http://localhost:3000/api/admin/users?search=carl"
```

### Adjust Balance
```bash
curl -X PUT "http://localhost:3000/api/admin/users/adjust-balance" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "bbcdb443-86fe-4327-8886-0e26b47300c0",
    "amount": 50,
    "type": "credit",
    "balanceType": "wallet",
    "reason": "Manual adjustment for testing"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Balance adjusted successfully",
  "user": {
    "id": "bbcdb443-86fe-4327-8886-0e26b47300c0",
    "email": "cedoe70@gmail.com",
    "fullName": "Carl",
    "previousBalance": 70,
    "newBalance": 120,
    "adjustmentAmount": 50,
    "type": "credit",
    "reason": "Manual adjustment for testing"
  }
}
```

---

## ERROR TEST CASES

### Test: Insufficient Balance
Try to debit $200 when balance is $70:
```bash
curl -X PUT "http://localhost:3000/api/admin/users/adjust-balance" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "bbcdb443-86fe-4327-8886-0e26b47300c0",
    "amount": 200,
    "type": "debit",
    "balanceType": "wallet",
    "reason": "Test insufficient balance"
  }'
```

Expected Response (400):
```json
{
  "error": "INSUFFICIENT_BALANCE: New balance would be negative: -130"
}
```

### Test: Missing Amount
```bash
curl -X PUT "http://localhost:3000/api/admin/users/adjust-balance" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "bbcdb443-86fe-4327-8886-0e26b47300c0",
    "type": "credit",
    "balanceType": "wallet"
  }'
```

Expected Response (400):
```json
{
  "error": "VALIDATION_ERROR: Missing amount field"
}
```

### Test: Non-existent User
```bash
curl -X PUT "http://localhost:3000/api/admin/users/adjust-balance" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "00000000-0000-0000-0000-000000000000",
    "amount": 50,
    "type": "credit",
    "balanceType": "wallet"
  }'
```

Expected Response (404):
```json
{
  "error": "USER_NOT_FOUND: No user exists with this ID"
}
```

---

## FILE LOCATIONS

- **Admin UI**: `/app/admin/users/page.tsx`
- **Users API**: `/app/api/admin/users/route.ts`
- **Adjust Balance API**: `/app/api/admin/users/adjust-balance/route.ts`
- **Database**: Neon PostgreSQL (connected)

---

## CURRENT STATUS

✅ **ALL SYSTEMS OPERATIONAL**

- UI Page: Working
- API Endpoints: Working
- Database: Connected
- Audit Logging: Active
- Error Handling: Comprehensive

**Ready for Production Use**
