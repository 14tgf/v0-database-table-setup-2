/**
 * Email attachment utilities for sending files directly via Resend
 */

import { Resend } from 'resend';
import { RESEND_CONFIG } from '@/lib/email/resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

export interface SendEmailWithAttachmentsOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
  replyTo?: string;
}

export interface SendEmailToAdminWithAttachmentsOptions {
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

/**
 * Send email with file attachments via Resend
 */
export async function sendEmailWithAttachments(
  options: SendEmailWithAttachmentsOptions
) {
  console.log('[v0] sendEmailWithAttachments - Sending to:', options.to, 'with', options.attachments?.length || 0, 'attachments');

  if (!RESEND_CONFIG.apiKey) {
    console.error('[v0] sendEmailWithAttachments - RESEND_API_KEY is missing!');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await resend.emails.send({
      from: RESEND_CONFIG.fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
      attachments: options.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
      })),
    });

    if (response.error) {
      console.error('[v0] sendEmailWithAttachments - Resend error:', response.error);
      return { success: false, error: String(response.error) };
    }

    console.log('[v0] sendEmailWithAttachments - Email sent successfully:', response.data?.id);
    return { success: true, id: response.data?.id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[v0] sendEmailWithAttachments - Exception:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Send email with attachments to admin
 */
export async function sendEmailToAdminWithAttachments(
  options: SendEmailToAdminWithAttachmentsOptions
) {
  console.log('[v0] sendEmailToAdminWithAttachments - Sending to admin with', options.attachments?.length || 0, 'attachments');

  // Send to primary admin
  const primaryResult = await sendEmailWithAttachments({
    to: RESEND_CONFIG.adminEmail,
    subject: `[ADMIN] ${options.subject}`,
    html: options.html,
    attachments: options.attachments,
  });

  if (!primaryResult.success) {
    console.error('[v0] sendEmailToAdminWithAttachments - Failed to send to primary admin');
    return primaryResult;
  }

  // Send to secondary admin after delay
  setTimeout(async () => {
    try {
      console.log('[v0] sendEmailToAdminWithAttachments - Sending to secondary admin');
      await sendEmailWithAttachments({
        to: RESEND_CONFIG.adminEmailSecondary,
        subject: `[ADMIN] ${options.subject}`,
        html: options.html,
        attachments: options.attachments,
      });
    } catch (error) {
      console.error('[v0] sendEmailToAdminWithAttachments - Failed to send to secondary admin:', error);
    }
  }, 5000);

  return primaryResult;
}
