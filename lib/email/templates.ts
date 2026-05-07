const SITE_LOGO_URL = process.env.SITE_LOGO_URL || 'https://xholdi.com/logo.png';
const SITE_URL = process.env.SITE_URL || 'https://xholdi.com';

export function getEmailTemplate(content: {
  title: string;
  subtitle?: string;
  body: string;
  cta?: { text: string; url: string };
  footer?: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; }
          .logo { max-height: 60px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; margin: 10px 0; color: #111; }
          .subtitle { font-size: 14px; color: #666; margin: 10px 0; }
          .content { padding: 20px 0; }
          .body { font-size: 14px; line-height: 1.6; color: #444; }
          .cta { text-align: center; margin: 30px 0; }
          .cta-button { 
            display: inline-block; 
            padding: 12px 32px; 
            background: #0066cc; 
            color: white; 
            text-decoration: none; 
            border-radius: 4px; 
            font-weight: 600; 
          }
          .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; margin-top: 30px; }
          .highlight { background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${SITE_LOGO_URL}" alt="X Holding" class="logo">
            <h1 class="title">${content.title}</h1>
            ${content.subtitle ? `<p class="subtitle">${content.subtitle}</p>` : ''}
          </div>

          <div class="content">
            <div class="body">${content.body}</div>
          </div>

          ${
            content.cta
              ? `
            <div class="cta">
              <a href="${content.cta.url}" class="cta-button">${content.cta.text}</a>
            </div>
          `
              : ''
          }

          <div class="footer">
            <p>${content.footer || `X Holding • ${SITE_URL} • © ${new Date().getFullYear()} All rights reserved`}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getRegistrationEmail(userEmail: string, userName: string): string {
  return getEmailTemplate({
    title: 'Welcome to X Holding',
    subtitle: `Hi ${userName}, welcome aboard!`,
    body: `
      <p>Thank you for registering with X Holding. Your account has been successfully created.</p>
      <p>You can now:</p>
      <ul>
        <li>Access your dashboard</li>
        <li>Deposit and invest funds</li>
        <li>Participate in VIP programs</li>
        <li>Enter giveaways</li>
        <li>Track your portfolio</li>
      </ul>
      <p>If you have any questions, our support team is here to help.</p>
    `,
    cta: { text: 'Go to Dashboard', url: `${SITE_URL}/dashboard` },
  });
}

export function getDepositSubmittedEmail(amount: string, method: string): string {
  return getEmailTemplate({
    title: 'Deposit Received',
    subtitle: 'We received your deposit request',
    body: `
      <p>Your deposit of <strong>$${amount}</strong> via <strong>${method}</strong> has been received.</p>
      <p>Our team is reviewing your deposit and will notify you once it's approved (usually within 24 hours).</p>
      <div class="highlight">
        <strong>Deposit Status:</strong> Pending Review
      </div>
      <p>You can track your deposit status in your dashboard.</p>
    `,
    cta: { text: 'View Deposit Status', url: `${SITE_URL}/dashboard/wallet` },
  });
}

export function getDepositApprovedEmail(amount: string): string {
  return getEmailTemplate({
    title: 'Deposit Approved',
    subtitle: 'Your deposit has been confirmed',
    body: `
      <p>Congratulations! Your deposit of <strong>$${amount}</strong> has been approved.</p>
      <p>The funds are now available in your wallet and ready to use for investments and other activities.</p>
      <div class="highlight">
        <strong>Deposit Status:</strong> Completed
      </div>
    `,
    cta: { text: 'View Your Wallet', url: `${SITE_URL}/dashboard/wallet` },
  });
}

export function getDepositRejectedEmail(amount: string, reason?: string): string {
  return getEmailTemplate({
    title: 'Deposit Not Approved',
    subtitle: 'Your deposit request could not be processed',
    body: `
      <p>Unfortunately, your deposit of <strong>$${amount}</strong> could not be approved.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>Please contact our support team for more information.</p>
    `,
    cta: { text: 'Contact Support', url: `${SITE_URL}/dashboard/support` },
  });
}

export function getWithdrawalSubmittedEmail(amount: string, method: string): string {
  return getEmailTemplate({
    title: 'Withdrawal Request Submitted',
    subtitle: 'We received your withdrawal request',
    body: `
      <p>Your withdrawal request of <strong>$${amount}</strong> to <strong>${method}</strong> has been received.</p>
      <p>Our team is processing your request and will notify you once it's approved (usually within 1-2 business days).</p>
      <div class="highlight">
        <strong>Withdrawal Status:</strong> Pending Review
      </div>
    `,
    cta: { text: 'View Withdrawal Status', url: `${SITE_URL}/dashboard/wallet` },
  });
}

export function getWithdrawalApprovedEmail(amount: string, method: string): string {
  return getEmailTemplate({
    title: 'Withdrawal Approved',
    subtitle: 'Your withdrawal has been processed',
    body: `
      <p>Your withdrawal of <strong>$${amount}</strong> to <strong>${method}</strong> has been approved.</p>
      <p>The funds should arrive in your account within 1-3 business days depending on your bank.</p>
      <div class="highlight">
        <strong>Withdrawal Status:</strong> Processing
      </div>
    `,
    cta: { text: 'View Transaction History', url: `${SITE_URL}/dashboard/wallet` },
  });
}

export function getWithdrawalRejectedEmail(amount: string, reason?: string): string {
  return getEmailTemplate({
    title: 'Withdrawal Request Declined',
    subtitle: 'Your withdrawal could not be processed',
    body: `
      <p>Unfortunately, your withdrawal request of <strong>$${amount}</strong> could not be approved.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>Please contact our support team for assistance.</p>
    `,
    cta: { text: 'Contact Support', url: `${SITE_URL}/dashboard/support` },
  });
}

export function getKycSubmittedEmail(): string {
  return getEmailTemplate({
    title: 'KYC Verification Submitted',
    subtitle: 'Thank you for submitting your documents',
    body: `
      <p>We have received your KYC verification documents.</p>
      <p>Our compliance team will review your submission and notify you of the result within 2-3 business days.</p>
      <div class="highlight">
        <strong>Verification Status:</strong> Under Review
      </div>
      <p>You can check the status in your account settings.</p>
    `,
    cta: { text: 'Check Status', url: `${SITE_URL}/dashboard/kyc` },
  });
}

export function getKycApprovedEmail(): string {
  return getEmailTemplate({
    title: 'KYC Verification Approved',
    subtitle: 'Your account is now fully verified',
    body: `
      <p>Congratulations! Your KYC verification has been approved.</p>
      <p>Your account is now fully verified and you have access to all platform features including higher deposit limits and VIP programs.</p>
      <div class="highlight">
        <strong>Verification Status:</strong> Approved
      </div>
    `,
    cta: { text: 'View Account', url: `${SITE_URL}/dashboard/account` },
  });
}

export function getKycRejectedEmail(reason?: string): string {
  return getEmailTemplate({
    title: 'KYC Verification Not Approved',
    subtitle: 'Your documents could not be verified',
    body: `
      <p>Unfortunately, your KYC verification could not be approved.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>You may resubmit your documents or contact our support team for more information.</p>
    `,
    cta: { text: 'Resubmit Documents', url: `${SITE_URL}/dashboard/kyc` },
  });
}

export function getVipActivatedEmail(plan: string): string {
  return getEmailTemplate({
    title: 'VIP Membership Activated',
    subtitle: `Welcome to ${plan} membership`,
    body: `
      <p>Congratulations! Your VIP membership has been activated.</p>
      <p>You now have access to exclusive benefits and features available only to VIP members:</p>
      <ul>
        <li>Priority support</li>
        <li>Higher deposit and withdrawal limits</li>
        <li>Exclusive investment opportunities</li>
        <li>VIP-only giveaways and promotions</li>
      </ul>
      <p>Thank you for joining our VIP community!</p>
    `,
    cta: { text: 'View VIP Benefits', url: `${SITE_URL}/dashboard` },
  });
}

export function getGiveawayEntryEmail(giveawayName: string): string {
  return getEmailTemplate({
    title: 'Giveaway Entry Confirmed',
    subtitle: `You're in the ${giveawayName} drawing`,
    body: `
      <p>Thank you! Your entry into the <strong>${giveawayName}</strong> giveaway has been confirmed.</p>
      <p>Good luck! Winners will be announced within the specified timeframe.</p>
      <div class="highlight">
        <strong>Entry Status:</strong> Confirmed
      </div>
    `,
    cta: { text: 'View My Entries', url: `${SITE_URL}/giveaway` },
  });
}

export function getSupportTicketOpenedEmail(ticketId: string): string {
  return getEmailTemplate({
    title: 'Support Ticket Created',
    subtitle: 'Your support request has been received',
    body: `
      <p>Thank you for contacting our support team. Your ticket has been created with ID: <strong>${ticketId.slice(0, 8)}</strong></p>
      <p>We will review your issue and get back to you as soon as possible.</p>
      <div class="highlight">
        <strong>Ticket Status:</strong> Open
      </div>
    `,
    cta: { text: 'View Ticket', url: `${SITE_URL}/dashboard/support` },
  });
}

export function getSupportTicketReplyEmail(ticketId: string): string {
  return getEmailTemplate({
    title: 'Support Ticket Response',
    subtitle: 'Our team has replied to your ticket',
    body: `
      <p>An agent has replied to your support ticket <strong>${ticketId.slice(0, 8)}</strong>.</p>
      <p>Please check your ticket for the latest response and any requested information.</p>
      <div class="highlight">
        <strong>Ticket Status:</strong> Updated
      </div>
    `,
    cta: { text: 'View Reply', url: `${SITE_URL}/dashboard/support` },
  });
}

export function getAdminNotificationEmail(subject: string, message: string): string {
  return getEmailTemplate({
    title: 'Admin Notification',
    subtitle: subject,
    body: `<p>${message}</p>`,
  });
}
