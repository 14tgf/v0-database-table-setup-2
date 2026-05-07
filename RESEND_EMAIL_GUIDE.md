# Resend Email Notification System - Implementation Guide

## Overview

A production-ready, centralized email notification system using **Resend** for X Holding platform.

- **Provider**: Resend (official SDK)
- **Sending Domain**: noreply@web3trusts.online
- **Website URL**: https://xholdi.com
- **Logo URL**: https://xholdi.com/logo.png (absolute path)

## Installation

Resend is already installed:
```bash
pnpm add resend
```

## Environment Variables

Add **ONLY THIS ONE** variable to your Vercel project settings:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

**Hardcoded defaults** (already in code, no env vars needed):
- `FROM_EMAIL`: noreply@web3trusts.online
- `ADMIN_EMAIL`: admin@xholdi.com
- `SUPPORT_EMAIL`: support@xholdi.com
- `SITE_URL`: https://xholdi.com
- `SITE_LOGO_URL`: https://xholdi.com/logo.png

**To change these**, edit `/lib/email/resend.ts` lines 7-11.

## Architecture

### Core Files

1. **lib/email/resend.ts** (53 lines)
   - Centralized Resend configuration
   - `sendEmail()` - Send to any user
   - `sendEmailToAdmin()` - Send to admin
   - Fail-safe implementation (never breaks transactions)

2. **lib/email/templates.ts** (279 lines)
   - 14 professional HTML email templates
   - Branded with logo and corporate styling
   - Responsive design
   - Reusable base template system

### Implemented Integrations

✅ **User Registration** (`app/api/auth/register/route.ts`)
- Sends: Welcome email to new user
- Sends: Admin notification of new registration

✅ **Deposit Submission** (`app/api/deposits/create/route.ts`)
- Sends: Confirmation email to user
- Sends: Admin notification of new deposit

✅ **Deposit Approval** (`app/api/admin/deposits/approve/route.ts`)
- Sends: Approval email if approved
- Sends: Rejection email if rejected

## Available Templates

```typescript
// User Emails
welcomeEmailTemplate(email, fullName)
depositSubmittedTemplate(amount, method)
depositApprovedTemplate(amount)
depositRejectedTemplate(amount)
withdrawalSubmittedTemplate(amount, method)
withdrawalApprovedTemplate(amount, method)
withdrawalRejectedTemplate(amount)
kycSubmittedTemplate()
kycApprovedTemplate()
kycRejectedTemplate(reason?)
vipActivatedTemplate(planName)
giveawayEntryTemplate(giveawayName?)
supportTicketOpenedTemplate(ticketId)
supportTicketReplyTemplate(ticketId)
orderSubmittedTemplate(orderId, total)

// Admin Emails
adminAlertTemplate(title, message, details?)
```

## Usage Pattern

All email additions follow this non-blocking pattern:

```typescript
import { sendEmail, sendEmailToAdmin } from '@/lib/email/resend';
import { someTemplate, adminAlertTemplate } from '@/lib/email/templates';

// Inside successful transaction:
if (userEmail) {
  sendEmail({
    to: userEmail,
    subject: 'Your Subject Here',
    html: someTemplate(...),
  }).catch(err => console.error('[v0] Failed to send email:', err));
}

// Admin notification:
sendEmailToAdmin({
  subject: 'New Event Type',
  html: adminAlertTemplate('Title', 'Message', { 'Key': 'value' }),
}).catch(err => console.error('[v0] Failed to send admin notification:', err));
```

## Key Features

✅ **Non-blocking** - Email failures never break core transactions
✅ **Graceful degradation** - Works without Resend configured
✅ **Error handling** - All failures logged but caught
✅ **Branded templates** - Professional HTML with logo and styling
✅ **Responsive design** - Works on mobile and desktop
✅ **Environment-driven** - All config from ENV variables
✅ **Centralized** - Single source of truth for email logic

## Remaining Endpoints to Integrate

Copy the pattern from implemented endpoints to add emails to:

1. `app/api/withdrawals/create/route.ts`
2. `app/api/admin/withdrawals/approve/route.ts`
3. `app/api/kyc/submit/route.ts`
4. `app/api/admin/kyc/approve/route.ts`
5. `app/api/vip/purchase/route.ts`
6. `app/api/giveaway/enter/route.ts`
7. `app/api/support/tickets/route.ts`
8. `app/api/admin/support/tickets/update/route.ts`
9. `app/api/orders/create/route.ts`

See `EMAIL_INTEGRATION_SCRIPT.md` for the exact pattern.

## Testing

### Test Email Setup

1. Set `RESEND_API_KEY` in environment
2. Trigger an action (e.g., register a new user)
3. Check inbox - email should arrive within seconds

### Fallback Testing

Without Resend configured:
- All email calls fail gracefully
- Transactions complete normally
- Errors logged: `[v0] Failed to send email: ...`

## Security Notes

- Never hardcode `RESEND_API_KEY` in code
- Always use environment variables
- Email addresses always read from database
- No sensitive data in email subjects or content
- All emails sent through official Resend SDK

## Monitoring

Check console logs for email events:

```
[v0] Email sent successfully: "Welcome to X Holding!" to: user@example.com
[v0] Failed to send email: Error description
```

## Cost

Resend is free for first 100 emails/day. Production plans scale from $20/month.

See: https://resend.com/pricing

## Support

Resend documentation: https://resend.com/docs
