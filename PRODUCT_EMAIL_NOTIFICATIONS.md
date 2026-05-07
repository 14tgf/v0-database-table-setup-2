# Product Purchase Email Notifications System

## Overview
Users now receive automated email notifications at key stages of the product purchase and payment approval workflow.

## Email Flow

### 1. Order Created (Not yet implemented - optional)
- When user creates an order, they receive a confirmation
- Contains order ID and total amount
- Prompts them to proceed with payment

### 2. Payment Submitted ✓ (NOW IMPLEMENTED)
- **Trigger**: User submits payment for an order
- **Recipient**: Customer email
- **Template**: `orderPaymentSubmittedTemplate`
- **Content**:
  - Order ID
  - Payment amount
  - Payment method used
  - Status indicator (Pending Approval)
  - Link to view order in dashboard
- **Timing**: Sent immediately when payment is submitted
- **Implementation**: `/api/orders/submit-payment` endpoint

### 3. Payment Approved ✓ (NOW ENHANCED)
- **Trigger**: Admin approves the deposit/payment in admin panel
- **Recipient**: Customer email
- **Template**: `orderPaymentApprovedTemplate` (for orders) or `depositApprovedTemplate` (for regular deposits)
- **Content**:
  - Order ID
  - Product name (if order)
  - Amount paid
  - Status indicator (Confirmed/Complete)
  - Link to view order/wallet details
- **Timing**: Sent when admin clicks "Approve" on the deposit
- **Implementation**: `/api/admin/deposits/approve` endpoint

## Email Configuration

### Environment Variables Required
```
RESEND_API_KEY=your_api_key_here
```

### Email Settings
- **From**: X-holdings <noreply@web3trusts.online>
- **Admin Email**: admin@xholdi.com
- **Support Email**: support@xholdi.com
- **Site URL**: https://xholdi.com

## Technical Details

### Email Service: Resend
- Located: `/lib/email/resend.ts`
- Async, non-blocking implementation
- Errors are logged but don't interrupt the main flow
- Failed emails are gracefully handled with console logging

### Email Templates
- Located: `/lib/email/templates.ts`
- Uses base template with consistent styling
- Supports:
  - Gradient headers with logo
  - Highlight boxes for important info
  - Call-to-action buttons
  - Footer with links
  - Responsive design

### New Templates Added
1. `orderPaymentSubmittedTemplate(orderId, amount, paymentMethod)`
   - Sent when user submits payment
   - Shows payment is pending approval

2. `orderPaymentApprovedTemplate(orderId, productName, amount)`
   - Sent when admin approves payment
   - Confirms order completion

## Testing

### To Test Payment Submission Email
1. User purchases a product
2. Submits payment with details
3. User receives email at their registered address
4. Check `/api/orders/submit-payment` console logs for email send status

### To Test Payment Approval Email
1. User submits payment for an order
2. Admin goes to Deposits panel
3. Admin clicks "Approve" on the deposit
4. User receives order confirmation email
5. Check `/api/admin/deposits/approve` console logs for email send status

### Console Logging
All email operations are logged with `[v0]` prefix:
- `[v0] sendEmail - Email sent successfully`
- `[v0] sendEmail - ERROR sending email` (if failed)
- `[v0] Failed to send order payment email` (in payment endpoint)
- `[v0] Failed to send order approval email` (in approve endpoint)

## Troubleshooting

### Emails Not Sending
1. **Check RESEND_API_KEY**: Ensure environment variable is set
2. **Check logs**: Look for `[v0] sendEmail` entries
3. **Non-blocking**: Email failures don't fail the order - check server logs
4. **Test address**: Use your own email for testing

### Email Not Appearing
1. Check spam/junk folder
2. Verify recipient email in database is correct
3. Check Resend dashboard for bounce/delivery status

### Wrong Email Sent
1. Verify order has correct linked deposit
2. Check that order.product_name is populated
3. Verify user.email is correct in database

## Future Enhancements
- Add order shipped notification
- Add order delivery confirmation
- Add payment rejected email
- Add order cancellation email
- Add customer support email template for order issues
