## Email Hooks Integration Map

This document shows exactly which API endpoints send emails and what they do.

### 1. Authentication & Registration

**Endpoint:** `POST /api/auth/register`
```typescript
// Sends:
✓ Welcome email to user
✓ New registration notification to admin

// Files modified:
- app/api/auth/register/route.ts (lines 96-118)

// Emails sent:
- User: "Welcome to X Holding"
- Admin: "New User Registration"
```

---

### 2. Deposits

**Endpoint:** `POST /api/deposits/create`
```typescript
// Sends:
✓ Confirmation email to user
✓ New deposit notification to admin

// Files modified:
- app/api/deposits/create/route.ts (lines 83-110)

// Emails sent:
- User: "Deposit Received"
- Admin: "New Deposit Submission"
```

**Endpoint:** `POST /api/admin/deposits/approve`
```typescript
// Sends:
✓ Approval email to user (action === 'approve')
✓ Rejection email to user (action === 'reject')

// Files modified:
- app/api/admin/deposits/approve/route.ts (lines 39-77)

// Emails sent:
- User: "Deposit Approved" or "Deposit Not Approved"
- (No admin notification, admin is the one approving)
```

---

### 3. Withdrawals

**Endpoint:** `POST /api/withdrawals/create`
```typescript
// Sends:
✓ Confirmation email to user
✓ New withdrawal notification to admin

// Files modified:
- app/api/withdrawals/create/route.ts (lines 70-97)

// Emails sent:
- User: "Withdrawal Request Submitted"
- Admin: "New Withdrawal Request"
```

**Endpoint:** `POST /api/admin/withdrawals/approve`
```typescript
// Sends:
✓ Approval email to user (action === 'approve')
✓ Rejection email to user (action === 'reject')

// Files modified:
- app/api/admin/withdrawals/approve/route.ts (lines 38-79)

// Emails sent:
- User: "Withdrawal Approved" or "Withdrawal Request Declined"
```

---

### 4. KYC Verification

**Endpoint:** `POST /api/kyc/submit`
```typescript
// Sends:
✓ Confirmation email to user
✓ New KYC notification to admin

// Files modified:
- app/api/kyc/submit/route.ts (lines 98-125)

// Emails sent:
- User: "KYC Verification Submitted"
- Admin: "New KYC Submission"
```

**Endpoint:** `POST /api/admin/kyc/approve`
```typescript
// Sends:
✓ Approval email to user (action === 'approve')
✓ Rejection email to user (action === 'reject')

// Files modified:
- app/api/admin/kyc/approve/route.ts (lines 38-67)

// Emails sent:
- User: "KYC Verification Approved" or "KYC Verification Not Approved"
```

---

### 5. VIP Membership

**Endpoint:** `POST /api/vip/purchase`
```typescript
// Sends:
✓ VIP activation email to user
✓ New VIP purchase notification to admin

// Files modified:
- app/api/vip/purchase/route.ts (lines 161-188)

// Emails sent:
- User: "VIP Membership Activated"
- Admin: "New VIP Purchase"
```

---

### 6. Giveaways

**Endpoint:** `POST /api/giveaway/enter`
```typescript
// Sends:
✓ Entry confirmation email to user
✓ New entry notification to admin

// Files modified:
- app/api/giveaway/enter/route.ts (lines 70-97)

// Emails sent:
- User: "Giveaway Entry Confirmed"
- Admin: "New Giveaway Entry"
```

---

### 7. Support Tickets

**Endpoint:** `POST /api/support/tickets` (POST - create ticket)
```typescript
// Sends:
✓ Ticket creation confirmation email to user
✓ New ticket notification to admin

// Files modified:
- app/api/support/tickets/route.ts (lines 73-100)

// Emails sent:
- User: "Support Ticket Created"
- Admin: "New Support Ticket"
```

**Endpoint:** `POST /api/admin/support/tickets/update` (Admin reply)
```typescript
// Sends:
✓ Reply notification email to user

// Files modified:
- app/api/admin/support/tickets/update/route.ts (lines 30-49)

// Emails sent:
- User: "Support Ticket Response"
```

---

## Core Files

### `/lib/email/send.ts`
- **`sendEmail(options)`** - Synchronous email sending
- **`sendEmailSafely(options)`** - Non-blocking email sending
- Handles SMTP configuration and error logging

### `/lib/email/templates.ts`
- **`getEmailTemplate(content)`** - Base template with logo, header, footer
- **`getRegistrationEmail(email, name)`** - Registration welcome
- **`getDepositSubmittedEmail(amount, method)`** - Deposit confirmation
- **`getDepositApprovedEmail(amount)`** - Deposit approved
- **`getDepositRejectedEmail(amount, reason)`** - Deposit rejected
- **`getWithdrawalSubmittedEmail(amount, method)`** - Withdrawal confirmation
- **`getWithdrawalApprovedEmail(amount, method)`** - Withdrawal approved
- **`getWithdrawalRejectedEmail(amount, reason)`** - Withdrawal rejected
- **`getKycSubmittedEmail()`** - KYC confirmation
- **`getKycApprovedEmail()`** - KYC approved
- **`getKycRejectedEmail(reason)`** - KYC rejected
- **`getVipActivatedEmail(plan)`** - VIP activation
- **`getGiveawayEntryEmail(giveawayName)`** - Giveaway confirmation
- **`getSupportTicketOpenedEmail(ticketId)`** - Ticket created
- **`getSupportTicketReplyEmail(ticketId)`** - Ticket reply
- **`getAdminNotificationEmail(subject, message)`** - Generic admin notification

---

## Email Pattern

All endpoints follow this identical pattern:

```typescript
// 1. Import at top of file
import { sendEmailSafely } from '@/lib/email/send';
import { getXxxEmail, getAdminNotificationEmail } from '@/lib/email/templates';

// 2. After transaction completes successfully...

// Get user email
const userResult = await db`SELECT email FROM users WHERE id = ${userId}`;
const userEmail = userResult?.[0]?.email;

// Send user notification (non-blocking)
if (userEmail) {
  const emailHtml = getXxxEmail(/* params */);
  sendEmailSafely({
    to: userEmail,
    subject: 'Subject Line',
    html: emailHtml,
  }).catch(err => console.error('[v0] Failed to send email:', err));
}

// Send admin notification (non-blocking)
const adminEmail = process.env.ADMIN_EMAIL;
if (adminEmail) {
  const adminHtml = getAdminNotificationEmail('Event Name', 'Details');
  sendEmailSafely({
    to: adminEmail,
    subject: 'Admin Notification Subject',
    html: adminHtml,
  }).catch(err => console.error('[v0] Failed to send admin notification:', err));
}
```

**Why this pattern?**
- ✓ Non-blocking - email failures don't break transactions
- ✓ Graceful degradation - emails optional if not configured
- ✓ Logging - all errors logged to console with `[v0]` prefix
- ✓ Admin optional - only sends if `ADMIN_EMAIL` env var is set

---

## Environment Variables Required

```bash
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Email Addresses
FROM_EMAIL=noreply@web3trusts.online
ADMIN_EMAIL=admin@xholdi.com

# Website Configuration (for email links)
SITE_URL=https://xholdi.com
SITE_LOGO_URL=https://xholdi.com/logo.png
```

---

## Testing Changes

To test email functionality:

1. **Local testing with Mailtrap:**
   - Update `.env.local` with Mailtrap SMTP
   - Run dev server
   - Trigger action (register, submit deposit, etc.)
   - Check Mailtrap dashboard for email

2. **Production testing:**
   - Set env vars in Vercel project settings
   - Redeploy
   - Trigger action
   - Check user's real email inbox

3. **Debugging:**
   - Check console for `[v0]` log messages
   - Verify SMTP credentials are set
   - Ensure user record has email field populated

---

## Summary

- **Files Created:** 2 (send.ts, templates.ts)
- **Files Modified:** 8 API route files
- **Email Events:** 14 different events covered
- **Admin Notifications:** 7 different admin events
- **Non-blocking:** All emails sent safely without blocking main flow
- **Graceful Degradation:** System works even if email not configured
- **Customizable:** All templates easy to edit
