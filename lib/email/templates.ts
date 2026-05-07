import { RESEND_CONFIG } from './resend';

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .logo { max-width: 150px; height: auto; margin-bottom: 20px; }
    .content { background: white; padding: 30px 20px; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
    .cta { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .cta:hover { opacity: 0.9; }
    h1 { margin: 0; color: white; font-size: 24px; }
    h2 { color: #1e40af; margin-top: 0; }
    p { margin: 15px 0; }
    .highlight { background: #f0f9ff; padding: 15px; border-left: 4px solid #1e40af; margin: 15px 0; }
    .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${RESEND_CONFIG.siteLogo}" alt="X Holding" class="logo">
      <h1>X Holding</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} X Holding. All rights reserved.</p>
      <p><a href="${RESEND_CONFIG.siteUrl}" style="color: #1e40af; text-decoration: none;">Visit our website</a></p>
    </div>
  </div>
</body>
</html>
`;

export function welcomeEmailTemplate(email: string, fullName: string) {
  return baseTemplate(`
    <h2>Welcome to X Holding! 🎉</h2>
    <p>Hello ${fullName},</p>
    <p>Thank you for registering with X Holding. Your account has been successfully created.</p>
    <div class="highlight">
      <p><strong>Account Email:</strong> ${email}</p>
    </div>
    <p>You can now access all our premium features including:</p>
    <ul>
      <li>Investment opportunities</li>
      <li>VIP membership tiers</li>
      <li>Secure deposits and withdrawals</li>
      <li>Portfolio tracking</li>
      <li>Exclusive giveaways</li>
    </ul>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard" class="cta">Go to Dashboard</a>
    </p>
    <p>If you have any questions, our support team is here to help.</p>
  `);
}

export function depositSubmittedTemplate(amount: string, method: string) {
  return baseTemplate(`
    <h2>Deposit Received ✓</h2>
    <p>Your deposit has been submitted successfully and is pending approval.</p>
    <div class="highlight">
      <p><strong>Amount:</strong> $${amount}</p>
      <p><strong>Method:</strong> ${method}</p>
      <p><strong>Status:</strong> Pending Review</p>
    </div>
    <p>Our team will review and process your deposit within 24 hours. You'll receive a confirmation email once approved.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/wallet" class="cta">View Wallet</a>
    </p>
  `);
}

export function depositApprovedTemplate(amount: string) {
  return baseTemplate(`
    <h2>Deposit Approved! ✓</h2>
    <p>Great news! Your deposit has been approved and credited to your wallet.</p>
    <div class="highlight">
      <p><strong>Amount Credited:</strong> $${amount}</p>
      <p><strong>Status:</strong> Complete</p>
    </div>
    <p>Your funds are now available for investments, VIP upgrades, and other opportunities.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/wallet" class="cta">View Balance</a>
    </p>
  `);
}

export function depositRejectedTemplate(amount: string) {
  return baseTemplate(`
    <h2>Deposit Review Status</h2>
    <p>Unfortunately, your deposit of $${amount} could not be processed at this time.</p>
    <p>Please contact our support team to learn more about this decision or to resubmit your deposit.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/support" class="cta">Contact Support</a>
    </p>
  `);
}

export function withdrawalSubmittedTemplate(amount: string, method: string) {
  return baseTemplate(`
    <h2>Withdrawal Request Received ✓</h2>
    <p>Your withdrawal request has been submitted successfully and is pending approval.</p>
    <div class="highlight">
      <p><strong>Amount:</strong> $${amount}</p>
      <p><strong>Method:</strong> ${method}</p>
      <p><strong>Status:</strong> Pending Review</p>
    </div>
    <p>Our team will review and process your withdrawal within 24 hours. You'll receive a confirmation email once approved.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/wallet" class="cta">View Status</a>
    </p>
  `);
}

export function withdrawalApprovedTemplate(amount: string, method: string) {
  return baseTemplate(`
    <h2>Withdrawal Approved! ✓</h2>
    <p>Your withdrawal has been approved and processed.</p>
    <div class="highlight">
      <p><strong>Amount:</strong> $${amount}</p>
      <p><strong>Method:</strong> ${method}</p>
      <p><strong>Status:</strong> Complete</p>
    </div>
    <p>The funds should arrive in your account within 2-5 business days depending on your payment method.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/wallet" class="cta">View History</a>
    </p>
  `);
}

export function withdrawalRejectedTemplate(amount: string) {
  return baseTemplate(`
    <h2>Withdrawal Review Status</h2>
    <p>Unfortunately, your withdrawal request of $${amount} could not be processed at this time.</p>
    <p>Please contact our support team to learn more or to submit a new withdrawal request.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/support" class="cta">Contact Support</a>
    </p>
  `);
}

export function kycSubmittedTemplate() {
  return baseTemplate(`
    <h2>KYC Verification Submitted ✓</h2>
    <p>Thank you! Your KYC verification documents have been submitted successfully.</p>
    <div class="highlight">
      <p><strong>Status:</strong> Under Review</p>
    </div>
    <p>Our compliance team will review your submission within 24-48 hours. You'll receive a confirmation email once your KYC is verified.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/kyc" class="cta">View Status</a>
    </p>
  `);
}

export function kycApprovedTemplate() {
  return baseTemplate(`
    <h2>KYC Verified! ✓</h2>
    <p>Congratulations! Your KYC verification has been approved.</p>
    <div class="highlight">
      <p><strong>Status:</strong> Verified ✓</p>
    </div>
    <p>You now have full access to all premium features and higher transaction limits.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard" class="cta">Explore Dashboard</a>
    </p>
  `);
}

export function kycRejectedTemplate(reason?: string) {
  return baseTemplate(`
    <h2>KYC Verification Status</h2>
    <p>Your KYC verification could not be completed at this time.</p>
    ${reason ? `<div class="highlight"><p><strong>Reason:</strong> ${reason}</p></div>` : ''}
    <p>Please contact our support team to resolve this issue or resubmit your documents.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/support" class="cta">Contact Support</a>
    </p>
  `);
}

export function vipActivatedTemplate(planName: string) {
  return baseTemplate(`
    <h2>VIP Membership Activated! 🎉</h2>
    <p>Welcome to the X Holding VIP community!</p>
    <div class="highlight">
      <p><strong>Plan:</strong> ${planName}</p>
      <p><strong>Status:</strong> Active</p>
    </div>
    <p>You now have access to exclusive benefits, premium features, and priority support.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/vip" class="cta">View Benefits</a>
    </p>
  `);
}

export function giveawayEntryTemplate(giveawayName: string = 'Grand Prize') {
  return baseTemplate(`
    <h2>Giveaway Entry Confirmed ✓</h2>
    <p>You have been successfully entered into the <strong>${giveawayName}</strong> giveaway!</p>
    <div class="highlight">
      <p><strong>Status:</strong> Entered</p>
      <p>Winners are selected randomly and announced on our website.</p>
    </div>
    <p>Good luck! We'll notify you immediately if you win.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/giveaway" class="cta">View Giveaways</a>
    </p>
  `);
}

export function supportTicketOpenedTemplate(ticketId: string) {
  return baseTemplate(`
    <h2>Support Ticket Created ✓</h2>
    <p>Thank you for contacting us. Your support ticket has been received.</p>
    <div class="highlight">
      <p><strong>Ticket ID:</strong> ${ticketId}</p>
      <p><strong>Status:</strong> Open</p>
    </div>
    <p>Our support team will review your request and respond as soon as possible, typically within 24 hours.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/support" class="cta">View Ticket</a>
    </p>
  `);
}

export function supportTicketReplyTemplate(ticketId: string) {
  return baseTemplate(`
    <h2>Support Ticket Response 📧</h2>
    <p>A new response has been added to your support ticket.</p>
    <div class="highlight">
      <p><strong>Ticket ID:</strong> ${ticketId}</p>
    </div>
    <p>Please check your ticket for the latest message from our support team.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/support" class="cta">View Response</a>
    </p>
  `);
}

export function orderSubmittedTemplate(orderId: string, total: string) {
  return baseTemplate(`
    <h2>Order Submitted ✓</h2>
    <p>Thank you for your order! It has been received and is pending payment.</p>
    <div class="highlight">
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Total:</strong> $${total}</p>
      <p><strong>Status:</strong> Awaiting Payment</p>
    </div>
    <p>Please complete payment to proceed with your order.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/orders" class="cta">Complete Payment</a>
    </p>
  `);
}

export function orderPaymentSubmittedTemplate(orderId: string, amount: string, paymentMethod: string) {
  return baseTemplate(`
    <h2>Payment Submitted ✓</h2>
    <p>Thank you for submitting your payment! We have received your transaction details and your order is now pending admin approval.</p>
    <div class="highlight">
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Amount:</strong> $${amount}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      <p><strong>Status:</strong> Pending Approval</p>
    </div>
    <p>Our team will review your payment within 24 hours. Once approved, your order will be confirmed and you'll receive another notification.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/orders" class="cta">View Order</a>
    </p>
  `);
}

export function orderPaymentApprovedTemplate(orderId: string, productName: string, amount: string) {
  return baseTemplate(`
    <h2>Order Confirmed! 🎉</h2>
    <p>Congratulations! Your payment has been approved and your order is confirmed.</p>
    <div class="highlight">
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Product:</strong> ${productName}</p>
      <p><strong>Amount Paid:</strong> $${amount}</p>
      <p><strong>Status:</strong> Confirmed</p>
    </div>
    <p>Thank you for your purchase! You can view your order details anytime in your dashboard.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/orders" class="cta">View Order Details</a>
    </p>
  `);
}

export function passwordChangedTemplate(fullName: string) {
  return baseTemplate(`
    <h2>Password Changed Successfully ✓</h2>
    <p>Hello ${fullName},</p>
    <p>Your account password has been changed successfully.</p>
    <div class="highlight">
      <p><strong>Status:</strong> Updated</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    </div>
    <p>If you did not make this change, please contact our support team immediately to secure your account.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/security" class="cta">View Security Settings</a>
    </p>
  `);
}

export function giveawayEntryApprovedTemplate(giveawayName: string) {
  return baseTemplate(`
    <h2>Giveaway Entry Confirmed! 🎉</h2>
    <p>Congratulations! Your entry to the <strong>${giveawayName}</strong> giveaway has been confirmed.</p>
    <div class="highlight">
      <p><strong>Giveaway:</strong> ${giveawayName}</p>
      <p><strong>Status:</strong> Entered</p>
      <p><strong>You're all set!</strong> Winners are drawn and announced regularly.</p>
    </div>
    <p>Good luck! We'll notify you immediately if you're selected as a winner.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/giveaways" class="cta">View My Entries</a>
    </p>
  `);
}

export function giveawayWinnerTemplate(giveawayName: string, prizeAmount: string) {
  return baseTemplate(`
    <h2>Congratulations - You Won! 🏆</h2>
    <p>Amazing news! You have been selected as a winner in the <strong>${giveawayName}</strong> giveaway!</p>
    <div class="highlight">
      <p><strong>Giveaway:</strong> ${giveawayName}</p>
      <p><strong>Prize:</strong> $${prizeAmount}</p>
      <p><strong>Status:</strong> Winner!</p>
    </div>
    <p>Your prize will be credited to your wallet within 24 hours. Thank you for participating!</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/wallet" class="cta">View Wallet</a>
    </p>
  `);
}

export function vipExpiringTemplate(planName: string, expiryDate: string, daysRemaining: number) {
  return baseTemplate(`
    <h2>VIP Membership Expiring Soon</h2>
    <p>Your VIP membership is expiring soon.</p>
    <div class="highlight">
      <p><strong>Plan:</strong> ${planName}</p>
      <p><strong>Expires:</strong> ${expiryDate}</p>
      <p><strong>Days Remaining:</strong> ${daysRemaining}</p>
    </div>
    <p>Renew your membership now to maintain your VIP status and continue enjoying exclusive benefits.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/vip/renew" class="cta">Renew VIP</a>
    </p>
  `);
}

export function supportTicketResolvedTemplate(ticketId: string) {
  return baseTemplate(`
    <h2>Support Ticket Resolved ✓</h2>
    <p>Your support ticket has been resolved and closed.</p>
    <div class="highlight">
      <p><strong>Ticket ID:</strong> ${ticketId}</p>
      <p><strong>Status:</strong> Resolved</p>
    </div>
    <p>If you need further assistance, feel free to submit a new support ticket at any time.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/support" class="cta">Submit New Ticket</a>
    </p>
  `);
}

export function accountBalanceCreditedTemplate(amount: string, reason: string) {
  return baseTemplate(`
    <h2>Account Credit Received ✓</h2>
    <p>Your account has been credited with funds.</p>
    <div class="highlight">
      <p><strong>Amount:</strong> $${amount}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
    </div>
    <p>The funds are now available in your wallet for use.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/wallet" class="cta">View Wallet</a>
    </p>
  `);
}

export function accountBalanceDebitedTemplate(amount: string, reason: string) {
  return baseTemplate(`
    <h2>Account Debit Processed ✓</h2>
    <p>A debit has been processed on your account.</p>
    <div class="highlight">
      <p><strong>Amount:</strong> $${amount}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
    </div>
    <p>Your updated wallet balance is available in your dashboard.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/wallet" class="cta">View Balance</a>
    </p>
  `);
}

export function depositRejectedWithReasonTemplate(amount: string, reason?: string) {
  return baseTemplate(`
    <h2>Deposit Could Not Be Processed</h2>
    <p>Unfortunately, we were unable to process your deposit at this time.</p>
    <div class="highlight">
      <p><strong>Amount:</strong> $${amount}</p>
      <p><strong>Status:</strong> Rejected</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    </div>
    <p>Please contact our support team to resolve this issue or to submit another deposit with corrected information.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/dashboard/support" class="cta">Contact Support</a>
    </p>
  `);
}

export function adminAlertTemplate(title: string, message: string, details?: Record<string, string>) {
  return baseTemplate(`
    <h2>${title}</h2>
    <p>${message}</p>
    ${details ? `
    <div class="highlight">
      ${Object.entries(details).map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`).join('')}
    </div>
    ` : ''}
    <div class="divider"></div>
    <p><small>This is an automated alert. Please review and take appropriate action.</small></p>
  `);
}
