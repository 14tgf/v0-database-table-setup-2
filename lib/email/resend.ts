import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const RESEND_CONFIG = {
  apiKey: process.env.RESEND_API_KEY,
  fromEmail: 'noreply@web3trusts.online',
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
  if (!RESEND_CONFIG.apiKey) {
    console.warn('[v0] RESEND_API_KEY not configured. Email not sent:', options.subject);
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await resend.emails.send({
      from: RESEND_CONFIG.fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });

    console.log('[v0] Email sent successfully:', options.subject, 'to:', options.to);
    return { success: true, id: response.data?.id };
  } catch (error) {
    console.error('[v0] Failed to send email:', error);
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
