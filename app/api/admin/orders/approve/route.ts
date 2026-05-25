import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { sendEmail, sendEmailToAdmin } from '@/lib/email/resend';
import { orderPaymentApprovedTemplate, adminAlertTemplate } from '@/lib/email/templates';
import { notifyOrderApproved, notifyOrderRejected } from '@/lib/notifications';

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

      // Get product image if available
      let productImage: string | undefined;
      try {
        const { PRODUCTS } = await import('@/lib/products');
        const product = PRODUCTS.find(p => p.id === order.product_id);
        if (product && product.image) {
          // Use xholdi.com domain for absolute URL in emails
          productImage = product.image.startsWith('http') ? product.image : `https://xholdi.com${product.image}`;
        }
      } catch (error) {
        console.log('[v0] Could not load product image:', error);
      }

      // Send confirmation email to user (non-blocking)
      if (order.email) {
        sendEmail({
          to: order.email,
          subject: 'Order Approved! - #' + order_id.slice(0, 8),
          html: orderPaymentApprovedTemplate(
            order_id.slice(0, 8),
            order.product_name,
            String(order.amount),
            productImage
          ),
        }).catch(err => console.error('[v0] Failed to send order approval email:', err));
      }

      // Create in-app notification (non-blocking)
      notifyOrderApproved(order.user_id, order.product_name, order_id)
        .catch(err => console.error('[v0] Failed to create order approved notification:', err));

      // Notify admin (non-blocking)
      sendEmailToAdmin({
        subject: 'Product Order Approved',
        html: adminAlertTemplate(
          'Product Order Approved',
          'A product order has been approved and is now processing.',
          {
            'Order ID': order_id.slice(0, 8),
            'Product': order.product_name,
            'Amount': `$${order.amount}`,
            'Customer': order.full_name,
            'Payment Method': order.payment_method,
          }
        ),
      }).catch(err => console.error('[v0] Failed to send admin notification:', err));

      return NextResponse.json({
        success: true,
        message: 'Order approved successfully',
      });
    } else if (action === 'reject') {
      // Update order status to Rejected
      // NO wallet changes - rejections don't affect customer funds
      await sql`
        UPDATE orders 
        SET status = 'Rejected', updated_at = NOW()
        WHERE id = ${order_id}
      `;

      console.log('[v0] Order rejected:', order_id);

      // Send rejection notification to user (non-blocking)
      if (order.email) {
        sendEmail({
          to: order.email,
          subject: 'Order Rejected - #' + order_id.slice(0, 8),
          html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <p>Your order #${order_id.slice(0, 8)} for ${order.product_name} has been rejected.</p>
              <p>Please contact our support team for more information.</p>
            </div>
          `,
        }).catch(err => console.error('[v0] Failed to send rejection email:', err));
      }

      // Create in-app notification (non-blocking)
      notifyOrderRejected(order.user_id, order.product_name, order_id)
        .catch(err => console.error('[v0] Failed to create order rejected notification:', err));

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
