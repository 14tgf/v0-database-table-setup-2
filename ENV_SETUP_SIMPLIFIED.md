# Email System - Simplified Setup

## What You Need to Do

### One Variable Only
Add this to Vercel Environment Variables:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

Get it from: https://resend.com/api-keys

### Everything Else is Hardcoded
```
From Email:     noreply@web3trusts.online
Admin Email:    admin@xholdi.com
Support Email:  support@xholdi.com
Site URL:       https://xholdi.com
Site Logo:      https://xholdi.com/logo.png
```

## To Customize
If you want to change any of the hardcoded values, edit:
`/vercel/share/v0-project/lib/email/resend.ts` (lines 7-11)

## That's It!
Deploy and test by registering a new user account.
