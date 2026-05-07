## Email Notification System - Quick Setup

### 1. Install Dependencies ✓
Already installed:
- `nodemailer` - SMTP email client
- `@types/nodemailer` - TypeScript types

### 2. Set Environment Variables

Add to `.env.local` or Vercel project settings:

```env
# SMTP Configuration (use Gmail, SendGrid, Mailgun, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Email Settings
FROM_EMAIL=noreply@web3trusts.online
ADMIN_EMAIL=admin@xholdi.com

# Website Settings (for email links and branding)
SITE_URL=https://xholdi.com
SITE_LOGO_URL=https://xholdi.com/logo.png
```

### 3. Verify Configuration

After deployment, check:
- [ ] SMTP credentials are set in Vercel project
- [ ] Admin email receives notifications
- [ ] User emails appear in their inbox
- [ ] Email links use `https://xholdi.com` (not the email domain)

### 4. Email Events Implemented

The system automatically sends emails for:

**User Events:**
- ✓ Registration welcome
- ✓ Deposit submitted/approved/rejected
- ✓ Withdrawal submitted/approved/rejected
- ✓ KYC submitted/approved/rejected
- ✓ VIP membership activated
- ✓ Giveaway entry confirmed
- ✓ Support ticket created/replied

**Admin Events:**
- ✓ New user registration
- ✓ New deposit/withdrawal/KYC submission
- ✓ New VIP purchase
- ✓ New giveaway entry
- ✓ New support ticket

### 5. Testing (Local Development)

Use Mailtrap for testing:
1. Sign up at https://mailtrap.io
2. Get SMTP credentials
3. Update `.env.local` with Mailtrap SMTP settings
4. All emails will be captured in Mailtrap dashboard

### 6. Email Files Structure

```
/lib/email/
├── send.ts          ← Email sending service
└── templates.ts     ← All HTML email templates

All API routes in /app/api/ have email hooks integrated
```

### 7. Minimal Integration

Each email hook:
- Sends after transaction succeeds
- Non-blocking (uses `sendEmailSafely`)
- Logs errors to console
- Checks env variables before sending

### 8. Customization

**Change email template:**
Edit `lib/email/templates.ts` → modify template function

**Change email provider:**
Update SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD env vars

**Change email copy/branding:**
Edit template functions in `lib/email/templates.ts`

**Add new email event:**
1. Create template in `lib/email/templates.ts`
2. Import in your API route
3. Call `sendEmailSafely({ to, subject, html })` after transaction

### 9. Debugging

Check console logs for `[v0]` prefix:
```
[v0] Email sent successfully to user@example.com
[v0] Failed to send email: reason
[v0] Email service not configured
```

### 10. Production Checklist

- [ ] All SMTP env variables set in Vercel
- [ ] Email domain has SPF/DKIM records
- [ ] Admin email verified
- [ ] Test user receives registration email
- [ ] Admin receives new registration notification
- [ ] Links in emails use https://xholdi.com

---

**Status:** ✓ Email system implemented and ready to use
**Files:** 2 files created (send.ts, templates.ts)
**Modified:** 8 API route files with email hooks
**Documentation:** EMAIL_SETUP.md (full guide)
