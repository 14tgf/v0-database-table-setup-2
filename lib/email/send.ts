import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface TransportConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  const config: TransportConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASSWORD || '',
    },
  };

  transporter = nodemailer.createTransport(config);
  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('[v0] Email service not configured - missing SMTP credentials');
      return false;
    }

    const transporter = getTransporter();
    const from = options.from || process.env.FROM_EMAIL || 'noreply@web3trusts.online';

    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`[v0] Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error(`[v0] Failed to send email to ${options.to}:`, error);
    return false;
  }
}

export async function sendEmailSafely(options: EmailOptions): Promise<void> {
  try {
    await sendEmail(options);
  } catch (error) {
    console.error(`[v0] Email error (non-blocking): ${error}`);
  }
}
