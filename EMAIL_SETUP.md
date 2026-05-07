# Email Notification System Setup Guide

## Overview

This document describes the centralized email notification system integrated across X Holding's platform. The system sends automated emails to users and admins for key events across all major flows.

## Environment Variables Required

Add these to your `.env.local` or Vercel project settings:

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password

# Email Configuration
FROM_EMAIL=noreply@web3trusts.online
ADMIN_EMAIL=admin@xholdi.com
SUPPORT_EMAIL=support@xholdi.com

# Website Configuration
SITE_URL=https://xholdi.com
SITE_LOGO_URL=https://xholdi.com/logo.png
```

### SMTP Setup (Gmail Example)

1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password at: https://myaccount.google.com/apppasswords
3. Use the 16-character password as `SMTP_PASSWORD`

### Alternative Email Providers

The system uses `nodemailer` and supports any SMTP provider:
- SendGrid: `smtp.sendgrid.net:587`
- Mailgun: `smtp.mailgun.org:587`
- AWS SES
- Postmark
- Any standard SMTP server

## Email Events Triggered

### User Emails

| Event | Template | Trigger |
|-------|----------|---------|
| **Registration** | Welcome email | User completes registration `/api/auth/register` |
| **Deposit Submitted** | Confirmation | User submits deposit `/api/deposits/create` |
| **Deposit Approved** | Status update | Admin approves deposit `/api/admin/deposits/approve` |
| **Deposit Rejected** | Status update | Admin rejects deposit `/api/admin/deposits/approve` |
| **Withdrawal Submitted** | Confirmation | User submits withdrawal `/api/withdrawals/create` |
| **Withdrawal Approved** | Status update | Admin approves withdrawal `/api/admin/withdrawals/approve` |
| **Withdrawal Rejected** | Status update | Admin rejects withdrawal `/api/admin/withdrawals/approve` |
| **KYC Submitted** | Confirmation | User submits KYC `/api/kyc/submit` |
| **KYC Approved** | Status update | Admin approves KYC `/api/admin/kyc/approve` |
| **KYC Rejected** | Status update | Admin rejects KYC `/api/admin/kyc/approve` |
| **VIP Activated** | Activation notice | User purchases VIP `/api/vip/purchase` |
| **Giveaway Entered** | Entry confirmation | User enters giveaway `/api/giveaway/enter` |
| **Support Ticket Opened** | Ticket confirmation | User creates ticket `/api/support/tickets` |
| **Support Ticket Reply** | Reply notification | Admin replies to ticket `/api/admin/support/tickets/update` |

### Admin Emails

Admin receives notifications for:
- New user registrations
- New deposit submissions
- New withdrawal requests
- New KYC submissions
- New VIP purchases
- New giveaway entries
- New support tickets

## Email Architecture

### Core Files

```
/lib/email/
├── send.ts           # Email sending service with nodemailer
└── templates.ts      # All HTML email templates

/app/api/
├── auth/register/route.ts                    # Registration email
├── deposits/create/route.ts                  # Deposit submission email
├── admin/deposits/approve/route.ts           # Deposit approval/rejection
├── withdrawals/create/route.ts               # Withdrawal submission email
├── admin/withdrawals/approve/route.ts        # Withdrawal approval/rejection
├── kyc/submit/route.ts                       # KYC submission email
├── admin/kyc/approve/route.ts                # KYC approval/rejection
├── vip/purchase/route.ts                     # VIP activation email
├── giveaway/enter/route.ts                   # Giveaway entry email
├── support/tickets/route.ts                  # Support ticket creation
└── admin/support/tickets/update/route.ts     # Support ticket reply
```

### Email Service (`lib/email/send.ts`)

**`sendEmail(options)`** - Sends email synchronously
- Returns boolean (true if sent, false if failed)
- Logs errors to console
- Throws on SMTP configuration issues

**`sendEmailSafely(options)`** - Sends email without blocking main flow
- Wraps sendEmail in try-catch
- Non-blocking (doesn't wait for response)
- Logs errors but never throws

### Email Templates (`lib/email/templates.ts`)

All templates include:
- Logo at top (absolute URL)
- Professional header styling
- Content body
- Call-to-action button (when applicable)
- Footer with copyright

**Available Templates:**
- `getEmailTemplate(content)` - Base template generator
- `getRegistrationEmail(email, name)` - Welcome email
- `getDepositSubmittedEmail(amount, method)` - Deposit confirmation
- `getDepositApprovedEmail(amount)` - Deposit approved
- `getDepositRejectedEmail(amount, reason)` - Deposit rejected
- `getWithdrawalSubmittedEmail(amount, method)` - Withdrawal confirmation
- `getWithdrawalApprovedEmail(amount, method)` - Withdrawal approved
- `getWithdrawalRejectedEmail(amount, reason)` - Withdrawal rejected
- `getKycSubmittedEmail()` - KYC confirmation
- `getKycApprovedEmail()` - KYC approved
- `getKycRejectedEmail(reason)` - KYC rejected
- `getVipActivatedEmail(plan)` - VIP membership activated
- `getGiveawayEntryEmail(giveawayName)` - Giveaway entry confirmation
- `getSupportTicketOpenedEmail(ticketId)` - Ticket created
- `getSupportTicketReplyEmail(ticketId)` - Ticket reply received
- `getAdminNotificationEmail(subject, message)` - Admin notification

## Implementation Pattern

All email hooks follow this pattern:

```typescript
// 1. Import sendEmailSafely and templates
import { sendEmailSafely } from '@/lib/email/send';
import { getXxxEmail, getAdminNotificationEmail } from '@/lib/email/templates';

// 2. After main transaction succeeds, send emails (non-blocking)
if (userEmail) {
  const emailHtml = getXxxEmail(/* params */);
  sendEmailSafely({
    to: userEmail,
    subject: 'Subject Line',
    html: emailHtml,
  }).catch(err => console.error('[v0] Email failed:', err));
}

// 3. Optionally notify admin
const adminEmail = process.env.ADMIN_EMAIL;
if (adminEmail) {
  const adminHtml = getAdminNotificationEmail('Event', 'Details');
  sendEmailSafely({
    to: adminEmail,
    subject: 'Admin Notification',
    html: adminHtml,
  }).catch(err => console.error('[v0] Admin email failed:', err));
}
```

**Key Points:**
- Emails are sent **after** main transaction completes
- Use `sendEmailSafely()` to prevent email failures from breaking transactions
- All email sends are logged to console
- Admin email is optional (checks `process.env.ADMIN_EMAIL`)

## Error Handling

Emails fail gracefully:
- If SMTP isn't configured, emails are skipped with console warning
- Email send failures don't affect main transaction
- All errors are logged with `[v0]` prefix for debugging
- No retry logic (failed emails are logged only)

## Testing Emails

### Local Testing with Mailtrap

1. Create free account at https://mailtrap.io
2. Copy SMTP credentials
3. Set in `.env.local`:
```bash
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=xxxxx
SMTP_PASSWORD=xxxxx
```
4. All emails will be captured in Mailtrap dashboard

### Production Considerations

- Use a proper email service (SendGrid, Mailgun, AWS SES)
- Enable proper SPF/DKIM records for domain
- Monitor bounce/complaint rates
- Implement unsubscribe links (if needed)
- Follow CAN-SPAM regulations

## Branding

### Logo URL

All emails use `SITE_LOGO_URL` environment variable:
```
SITE_LOGO_URL=https://xholdi.com/logo.png
```

This is embedded as an absolute URL in all email templates. Change via:
1. Update `.env.local` locally
2. Update Vercel project settings → Vars

### Color Scheme

Emails use:
- Primary CTA button: `#0066cc` (blue)
- Backgrounds: `#f5f5f5` (light gray)
- Text: `#333` (dark gray)
- Modify in `lib/email/templates.ts` if needed

### From Address

All emails come from:
```
FROM_EMAIL=noreply@web3trusts.online
```

The domain `web3trusts.online` is used **only for email sending**. The real website is `https://xholdi.com`.

## Customization

### Change Email Copy

Edit templates in `lib/email/templates.ts`:
```typescript
export function getRegistrationEmail(userEmail: string, userName: string): string {
  return getEmailTemplate({
    title: 'Welcome to X Holding',  // Change this
    subtitle: `Hi ${userName}`,
    body: `
      <p>Your custom content here</p>
    `,
  });
}
```

### Add New Email Event

1. Create new template function in `lib/email/templates.ts`
2. Import `sendEmailSafely` and template in your API route
3. Call `sendEmailSafely()` after transaction succeeds
4. Test via Mailtrap

### Change Email Provider

Simply update SMTP credentials in environment:
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

## Monitoring

### Console Logs

All email operations log to console with `[v0]` prefix:
```
[v0] Email sent successfully to user@example.com
[v0] Failed to send email: Connection refused
[v0] Email service not configured - missing SMTP credentials
```

### Check Email Status

1. Verify `ADMIN_EMAIL` receives notifications
2. Check user's inbox (subject line is specific to event)
3. Monitor Vercel logs for `[v0] Email` errors
4. Use email provider dashboard (Mailtrap, SendGrid, etc.)

## Troubleshooting

### Emails Not Sending

**Check 1:** SMTP credentials are set
```bash
echo $SMTP_USER  # Should show email address
echo $SMTP_PASSWORD  # Should not be empty
```

**Check 2:** Firewall allows SMTP
- Port 587 (TLS) or 465 (SSL) must be open
- Most hosting providers allow these by default

**Check 3:** Email address is valid
- Check user record has `email` field
- Verify email format (no special chars)

**Check 4:** Check console for errors
```
[v0] Email service not configured - missing SMTP credentials
```

### Gmail Connection Issues

- Generate new App Password
- Ensure 2FA is enabled
- Don't use regular Gmail password (app password required)
- Wait 5 minutes after generating password

### Production Deployment

On Vercel:
1. Go to Project Settings → Environment Variables
2. Add all `SMTP_*`, `FROM_EMAIL`, `ADMIN_EMAIL`, `SITE_*` variables
3. Redeploy project
4. Verify emails send from production domain

## Future Enhancements

Potential improvements (not in scope):
- Email unsubscribe links
- Email digest/batching
- Template personalization
- Email retry with exponential backoff
- Webhook integration for delivery tracking
- Email preferences per user
- Multi-language email templates
