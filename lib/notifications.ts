import { sql } from '@/lib/db';

export type NotificationType =
  | 'deposit_approved'
  | 'deposit_rejected'
  | 'deposit_submitted'
  | 'withdrawal_approved'
  | 'withdrawal_rejected'
  | 'withdrawal_submitted'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'kyc_submitted'
  | 'order_approved'
  | 'order_rejected'
  | 'order_submitted'
  | 'appointment_approved'
  | 'appointment_rejected'
  | 'appointment_submitted'
  | 'support_ticket_created'
  | 'support_ticket_reply'
  | 'giveaway_entry'
  | 'password_changed'
  | 'welcome'
  | 'general';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: string;
  relatedType?: string;
}

/**
 * Creates a notification record in the database for a user.
 * This is called alongside every email send so the notification
 * appears in the user's in-app notification bell.
 */
export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    const db = sql();
    await db`
      INSERT INTO notifications (user_id, title, message, type, related_id, related_type)
      VALUES (
        ${params.userId},
        ${params.title},
        ${params.message},
        ${params.type},
        ${params.relatedId ?? null},
        ${params.relatedType ?? null}
      )
    `;
  } catch (error) {
    // Non-blocking — never let notification creation crash the main flow
    console.error('[v0] Failed to create notification:', error);
  }
}

// ─── Convenience helpers ──────────────────────────────────────────────────────

export const notifyDepositApproved = (userId: string, amount: string, relatedId?: string) =>
  createNotification({
    userId,
    title: 'Deposit Approved',
    message: `Your deposit of $${amount} USD has been approved and credited to your wallet.`,
    type: 'deposit_approved',
    relatedId,
    relatedType: 'deposit',
  });

export const notifyDepositRejected = (userId: string, amount: string, relatedId?: string) =>
  createNotification({
    userId,
    title: 'Deposit Not Approved',
    message: `Your deposit of $${amount} USD was not approved. Please contact support for more information.`,
    type: 'deposit_rejected',
    relatedId,
    relatedType: 'deposit',
  });

export const notifyWithdrawalApproved = (userId: string, amount: string, method: string, relatedId?: string) =>
  createNotification({
    userId,
    title: 'Withdrawal Approved',
    message: `Your withdrawal of $${amount} USD via ${method} has been approved and is being processed.`,
    type: 'withdrawal_approved',
    relatedId,
    relatedType: 'withdrawal',
  });

export const notifyWithdrawalRejected = (userId: string, amount: string, relatedId?: string) =>
  createNotification({
    userId,
    title: 'Withdrawal Rejected',
    message: `Your withdrawal of $${amount} USD could not be processed. Please contact support.`,
    type: 'withdrawal_rejected',
    relatedId,
    relatedType: 'withdrawal',
  });

export const notifyKycApproved = (userId: string) =>
  createNotification({
    userId,
    title: 'KYC Verification Approved',
    message: 'Your identity has been verified successfully. Your account is now fully activated.',
    type: 'kyc_approved',
  });

export const notifyKycRejected = (userId: string, reason?: string) =>
  createNotification({
    userId,
    title: 'KYC Verification Requires Attention',
    message: reason
      ? `Your KYC submission was not approved: ${reason}`
      : 'Your KYC submission could not be verified. Please resubmit with updated documents.',
    type: 'kyc_rejected',
  });

export const notifyOrderApproved = (userId: string, productName: string, orderId: string) =>
  createNotification({
    userId,
    title: 'Order Approved',
    message: `Your order for ${productName} (#${orderId.slice(0, 8)}) has been approved and is now processing.`,
    type: 'order_approved',
    relatedId: orderId,
    relatedType: 'order',
  });

export const notifyOrderRejected = (userId: string, productName: string, orderId: string) =>
  createNotification({
    userId,
    title: 'Order Rejected',
    message: `Your order for ${productName} (#${orderId.slice(0, 8)}) was rejected. Please contact support.`,
    type: 'order_rejected',
    relatedId: orderId,
    relatedType: 'order',
  });

export const notifyAppointmentApproved = (userId: string, ticketNumber: string) =>
  createNotification({
    userId,
    title: 'Appointment Confirmed',
    message: `Your appointment with Elon Musk has been confirmed. Ticket: ${ticketNumber}.`,
    type: 'appointment_approved',
  });

export const notifyAppointmentRejected = (userId: string) =>
  createNotification({
    userId,
    title: 'Appointment Not Approved',
    message: 'Your appointment request was not approved. Please contact support for more details.',
    type: 'appointment_rejected',
  });

// ─── Submission / User-initiated action notifications ─────────────────────────

export const notifyDepositSubmitted = (userId: string, amount: string, method: string, relatedId?: string) =>
  createNotification({
    userId,
    title: 'Deposit Submitted',
    message: `Your deposit of $${amount} USD via ${method} has been submitted and is pending review.`,
    type: 'deposit_submitted',
    relatedId,
    relatedType: 'deposit',
  });

export const notifyWithdrawalSubmitted = (userId: string, amount: string, method: string, relatedId?: string) =>
  createNotification({
    userId,
    title: 'Withdrawal Requested',
    message: `Your withdrawal request for $${amount} USD via ${method} has been submitted and is pending approval.`,
    type: 'withdrawal_submitted',
    relatedId,
    relatedType: 'withdrawal',
  });

export const notifyKycSubmitted = (userId: string) =>
  createNotification({
    userId,
    title: 'KYC Submitted',
    message: 'Your identity verification documents have been submitted and are under review.',
    type: 'kyc_submitted',
  });

export const notifyOrderSubmitted = (userId: string, productName: string, orderId: string) =>
  createNotification({
    userId,
    title: 'Order Payment Submitted',
    message: `Your payment for ${productName} (#${orderId.slice(0, 8)}) has been submitted and is awaiting confirmation.`,
    type: 'order_submitted',
    relatedId: orderId,
    relatedType: 'order',
  });

export const notifyAppointmentSubmitted = (userId: string, ticketNumber: string) =>
  createNotification({
    userId,
    title: 'Appointment Request Submitted',
    message: `Your appointment request (Ticket: ${ticketNumber}) has been submitted and is under review.`,
    type: 'appointment_submitted',
  });

export const notifySupportTicketCreated = (userId: string, ticketId: string, subject: string) =>
  createNotification({
    userId,
    title: 'Support Ticket Created',
    message: `Your support ticket "${subject}" (#${ticketId.slice(0, 8)}) has been created. We will respond shortly.`,
    type: 'support_ticket_created',
    relatedId: ticketId,
    relatedType: 'support_ticket',
  });

export const notifyGiveawayEntry = (userId: string, giveawayName: string) =>
  createNotification({
    userId,
    title: 'Giveaway Entry Confirmed',
    message: `You have been entered into the ${giveawayName} giveaway. Good luck!`,
    type: 'giveaway_entry',
  });

export const notifyPasswordChanged = (userId: string) =>
  createNotification({
    userId,
    title: 'Password Changed',
    message: 'Your account password has been changed successfully. If you did not make this change, contact support immediately.',
    type: 'password_changed',
  });

export const notifyWelcome = (userId: string, fullName: string) =>
  createNotification({
    userId,
    title: 'Welcome to X Holding!',
    message: `Hi ${fullName}, welcome to X Holding. Your account is now active. Start exploring investment opportunities today!`,
    type: 'welcome',
  });
