/**
 * Email templates for upload notifications
 */

import { RESEND_CONFIG } from '@/lib/email/resend';

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; color: white; }
    .content { background: white; padding: 30px 20px; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
    .cta { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    h1 { margin: 0; font-size: 28px; }
    h2 { color: #1e40af; margin-top: 0; font-size: 22px; }
    p { margin: 15px 0; }
    .highlight { background: #f0f9ff; padding: 15px; border-left: 4px solid #1e40af; margin: 15px 0; border-radius: 4px; }
    .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
    .file-list { background: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .user-info { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
    td:first-child { font-weight: 600; color: #1e40af; width: 30%; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📎 File Upload Notification</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} X Holding. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export function depositProofAdminTemplate(data: {
  userId: string;
  amount: string;
  method: string;
  userEmail?: string;
  timestamp: string;
  files: Array<{ name: string; size: string }>;
}) {
  const filesList = data.files
    .map(f => `<tr><td>📄 ${f.name}</td><td>${f.size}</td></tr>`)
    .join('');

  return baseTemplate(`
    <h2>💰 New Deposit Proof Submitted</h2>
    <p>A user has submitted a deposit with proof of payment.</p>
    
    <div class="highlight">
      <table>
        <tr><td>User ID:</td><td>${data.userId}</td></tr>
        <tr><td>Amount:</td><td>$${data.amount}</td></tr>
        <tr><td>Method:</td><td>${data.method}</td></tr>
        ${data.userEmail ? `<tr><td>Email:</td><td>${data.userEmail}</td></tr>` : ''}
        <tr><td>Submitted:</td><td>${data.timestamp}</td></tr>
      </table>
    </div>

    <div class="file-list">
      <p><strong>Attached Files:</strong></p>
      <table>
        ${filesList}
      </table>
    </div>

    <p><strong>Action Required:</strong> Review the attached proof and approve or reject the deposit.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/admin/deposits" class="cta">Review Deposit</a>
    </p>
  `);
}

export function kycVerificationAdminTemplate(data: {
  userId: string;
  userEmail?: string;
  timestamp: string;
  files: Array<{ name: string; size: string }>;
}) {
  const filesList = data.files
    .map(f => `<tr><td>📄 ${f.name}</td><td>${f.size}</td></tr>`)
    .join('');

  return baseTemplate(`
    <h2>✅ New KYC Verification Submitted</h2>
    <p>A user has submitted their KYC verification documents.</p>
    
    <div class="highlight">
      <table>
        <tr><td>User ID:</td><td>${data.userId}</td></tr>
        ${data.userEmail ? `<tr><td>Email:</td><td>${data.userEmail}</td></tr>` : ''}
        <tr><td>Submitted:</td><td>${data.timestamp}</td></tr>
      </table>
    </div>

    <div class="file-list">
      <p><strong>Attached Documents:</strong></p>
      <table>
        ${filesList}
      </table>
    </div>

    <p><strong>Action Required:</strong> Review the KYC documents and approve or request resubmission.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/admin/kyc" class="cta">Review KYC</a>
    </p>
  `);
}

export function giftCardProofAdminTemplate(data: {
  userId: string;
  amount: string;
  userEmail?: string;
  timestamp: string;
  files: Array<{ name: string; size: string }>;
}) {
  const filesList = data.files
    .map(f => `<tr><td>📄 ${f.name}</td><td>${f.size}</td></tr>`)
    .join('');

  return baseTemplate(`
    <h2>🎁 New Gift Card Payment Proof Submitted</h2>
    <p>A user has submitted proof of gift card payment.</p>
    
    <div class="highlight">
      <table>
        <tr><td>User ID:</td><td>${data.userId}</td></tr>
        <tr><td>Amount:</td><td>$${data.amount}</td></tr>
        ${data.userEmail ? `<tr><td>Email:</td><td>${data.userEmail}</td></tr>` : ''}
        <tr><td>Submitted:</td><td>${data.timestamp}</td></tr>
      </table>
    </div>

    <div class="file-list">
      <p><strong>Attached Proof:</strong></p>
      <table>
        ${filesList}
      </table>
    </div>

    <p><strong>Action Required:</strong> Verify the gift card and approve or reject the payment.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/admin/payments" class="cta">Review Payment</a>
    </p>
  `);
}

export function cryptoProofAdminTemplate(data: {
  userId: string;
  amount: string;
  cryptoType: string;
  userEmail?: string;
  timestamp: string;
  files: Array<{ name: string; size: string }>;
}) {
  const filesList = data.files
    .map(f => `<tr><td>📄 ${f.name}</td><td>${f.size}</td></tr>`)
    .join('');

  return baseTemplate(`
    <h2>🔐 New Crypto Payment Proof Submitted</h2>
    <p>A user has submitted proof of cryptocurrency payment.</p>
    
    <div class="highlight">
      <table>
        <tr><td>User ID:</td><td>${data.userId}</td></tr>
        <tr><td>Amount:</td><td>$${data.amount}</td></tr>
        <tr><td>Crypto Type:</td><td>${data.cryptoType}</td></tr>
        ${data.userEmail ? `<tr><td>Email:</td><td>${data.userEmail}</td></tr>` : ''}
        <tr><td>Submitted:</td><td>${data.timestamp}</td></tr>
      </table>
    </div>

    <div class="file-list">
      <p><strong>Attached Proof:</strong></p>
      <table>
        ${filesList}
      </table>
    </div>

    <p><strong>Action Required:</strong> Verify the transaction and approve or reject the payment.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/admin/payments" class="cta">Review Payment</a>
    </p>
  `);
}

export function userDocumentAdminTemplate(data: {
  userId: string;
  documentType: string;
  userEmail?: string;
  description?: string;
  timestamp: string;
  files: Array<{ name: string; size: string }>;
}) {
  const filesList = data.files
    .map(f => `<tr><td>📄 ${f.name}</td><td>${f.size}</td></tr>`)
    .join('');

  return baseTemplate(`
    <h2>📋 New Document Submitted</h2>
    <p>A user has submitted a document for verification.</p>
    
    <div class="highlight">
      <table>
        <tr><td>User ID:</td><td>${data.userId}</td></tr>
        <tr><td>Document Type:</td><td>${data.documentType}</td></tr>
        ${data.userEmail ? `<tr><td>Email:</td><td>${data.userEmail}</td></tr>` : ''}
        ${data.description ? `<tr><td>Description:</td><td>${data.description}</td></tr>` : ''}
        <tr><td>Submitted:</td><td>${data.timestamp}</td></tr>
      </table>
    </div>

    <div class="file-list">
      <p><strong>Attached Documents:</strong></p>
      <table>
        ${filesList}
      </table>
    </div>

    <p><strong>Action Required:</strong> Review the submitted document and take appropriate action.</p>
  `);
}

export function supportTicketAdminTemplate(data: {
  ticketId: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
  userEmail?: string;
  timestamp: string;
  files: Array<{ name: string; size: string }>;
}) {
  const filesList = data.files
    .map(f => `<tr><td>📄 ${f.name}</td><td>${f.size}</td></tr>`)
    .join('');

  const priorityColor = data.priority === 'Urgent' ? '#ef4444' :
                        data.priority === 'High' ? '#f97316' :
                        data.priority === 'Medium' ? '#eab308' : '#22c55e';

  return baseTemplate(`
    <h2>🎫 New Support Ticket with Attachment</h2>
    <p>A user has submitted a support ticket with an attachment.</p>
    
    <div class="highlight">
      <table>
        <tr><td>Ticket ID:</td><td>${data.ticketId}</td></tr>
        <tr><td>Subject:</td><td>${data.subject}</td></tr>
        <tr><td>Category:</td><td>${data.category}</td></tr>
        <tr><td>Priority:</td><td><span style="color: ${priorityColor}; font-weight: bold;">${data.priority}</span></td></tr>
        ${data.userEmail ? `<tr><td>Email:</td><td>${data.userEmail}</td></tr>` : ''}
        <tr><td>Submitted:</td><td>${data.timestamp}</td></tr>
      </table>
    </div>

    <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${data.message}</p>
    </div>

    <div class="file-list">
      <p><strong>Attached Files:</strong></p>
      <table>
        ${filesList}
      </table>
    </div>

    <p><strong>Action Required:</strong> Review the support ticket and respond to the user.</p>
    <p style="text-align: center;">
      <a href="${RESEND_CONFIG.siteUrl}/admin/support" class="cta">View Ticket</a>
    </p>
  `);
}
