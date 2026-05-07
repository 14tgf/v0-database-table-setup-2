import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { sendEmail, sendEmailToAdmin } from '@/lib/email/resend';
import { orderPaymentApprovedTemplate, adminAlertTemplate } from '@/lib/email/templates';

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  return neon(process.env.DATABASE_URL);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, action } = body;

    if (!order_id || !action) {
      return NextResponse.json(
        { error: 'Missing order_id or action' },
        { status: 400 }
      );
    }

    const sql = getSql();

    // Get order details
    const orderResult = await sql`
      SELECT o.*, u.email, u.full_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ${order_id}
    `;

    const orderArray = Array.isArray(orderResult) ? orderResult : (orderResult?.rows || []);
    if (orderArray.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderArray[0];
    console.log('[v0] Processing order action:', { order_id, action, status: order.status });

    if (action === 'approve') {
      // Update order status to Completed
      await sql`
        UPDATE orders 
        SET status = 'Completed', updated_at = NOW()
        WHERE id = ${order_id}
      `;

      console.log('[v0] Order approved:', order_id);

      // Send confirmation email to user (non-blocking)
      if (order.email) {
        sendEmail({
          to: order.email,
          subject: 'Order Confirmed! - #' + order_id.slice(0, 8),
          html: orderPaymentApprovedTemplate(
            order_id.slice(0, 8),
            order.product_name,
            String(order.amount)
          ),
        }).catch(err => console.error('[v0] Failed to send order approval email:', err));
      }

      // Notify admin (non-blocking)
      sendEmailToAdmin({
        subject: 'Product Order Approved',
        html: adminAlertTemplate(
          'Product Order Approved',
          'A product order has been approved and marked as completed.',
          {
            'Order ID': order_id.slice(0, 8),
            'Product': order.product_name,
            'Amount': `$${order.amount}`,
            'Customer': order.full_name,
          }
        ),
      }).catch(err => console.error('[v0] Failed to send admin notification:', err));

      return NextResponse.json({
        success: true,
        message: 'Order approved successfully',
      });
    } else if (action === 'reject') {
      // Update order status to Rejected
      await sql`
        UPDATE orders 
        SET status = 'Rejected', updated_at = NOW()
        WHERE id = ${order_id}
      `;

      console.log('[v0] Order rejected:', order_id);

      // Notify admin (non-blocking)
      sendEmailToAdmin({
        subject: 'Product Order Rejected',
        html: adminAlertTemplate(
          'Product Order Rejected',
          'A product order has been rejected.',
          {
            'Order ID': order_id.slice(0, 8),
            'Product': order.product_name,
            'Amount': `$${order.amount}`,
            'Customer': order.full_name,
          }
        ),
      }).catch(err => console.error('[v0] Failed to send admin notification:', err));

      return NextResponse.json({
        success: true,
        message: 'Order rejected successfully',
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('[v0] Error processing order action:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to process order: ' + errorMsg },
      { status: 500 }
    );
  }
}
