import { Resend } from 'resend';

console.log('[v0] Resend - Initializing with API key:', process.env.RESEND_API_KEY ? 'Present' : 'MISSING');

let resend: Resend | null = null;

function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export const RESEND_CONFIG = {
  apiKey: process.env.RESEND_API_KEY,
  fromEmail: '"X-holdings" <noreply@web3trusts.online>',
  adminEmail: 'admin@xholdi.com',
  supportEmail: 'support@xholdi.com',
  siteUrl: 'https://xholdi.com',
  siteLogo: 'https://xholdi.com/logo.png',
};

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  console.log('[v0] sendEmail - Called with:', options.to, options.subject);
  
  if (!RESEND_CONFIG.apiKey) {
    console.error('[v0] sendEmail - CRITICAL: RESEND_API_KEY is not configured!');
    console.warn('[v0] sendEmail - Email not sent:', options.subject);
    return { success: false, error: 'Email service not configured - RESEND_API_KEY missing' };
  }

  try {
    const client = getResend();
    if (!client) {
      throw new Error('Resend client could not be initialized');
    }
    console.log('[v0] sendEmail - Sending email via Resend');
    const response = await client.emails.send({
      from: RESEND_CONFIG.fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });

    console.log('[v0] sendEmail - Email sent successfully:', options.subject, 'to:', options.to, 'Response:', response);
    return { success: true, id: response.data?.id };
  } catch (error) {
    console.error('[v0] sendEmail - ERROR sending email:', error);
    console.error('[v0] sendEmail - Error details:', JSON.stringify(error));
    // Fail gracefully - never throw
    return { success: false, error: String(error) };
  }
}

export async function sendEmailToAdmin(options: {
  subject: string;
  html: string;
}) {
  return sendEmail({
    to: RESEND_CONFIG.adminEmail,
    subject: `[ADMIN] ${options.subject}`,
    html: options.html,
  });
}
