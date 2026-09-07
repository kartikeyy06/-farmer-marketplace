import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { query } from '../db/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order (Consumer)
router.post('/create-order', authenticateToken, requireRole('consumer'), async (req, res) => {
  try {
    const { orderId } = req.body;

    // Get order details
    const orderResult = await query(
      `SELECT o.*, cp.name as consumer_name, cp.phone_number as consumer_phone,
              fp.name as farmer_name, fp.phone_number as farmer_phone
       FROM orders o
       JOIN consumer_profiles cp ON o.consumer_id = cp.id
       JOIN farmer_profiles fp ON o.farmer_id = fp.id
       WHERE o.id = $1 AND o.consumer_id = (SELECT id FROM consumer_profiles WHERE user_id = $2)`,
      [orderId, req.user.userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Check if already paid
    if (order.payment_status === 'captured') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    // Create Razorpay order (amount in paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100), // Convert to paise
      currency: 'INR',
      receipt: order.order_number,
      notes: {
        orderId: order.id,
        orderNumber: order.order_number,
        consumerName: order.consumer_name,
        farmerName: order.farmer_name,
      },
    });

    // Save Razorpay order ID to our order
    await query(
      'UPDATE orders SET razorpay_order_id = $1, updated_at = NOW() WHERE id = $2',
      [razorpayOrder.id, orderId]
    );

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      consumerName: order.consumer_name,
      consumerPhone: order.consumer_phone,
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Verify Razorpay payment (Consumer)
router.post('/verify', authenticateToken, requireRole('consumer'), async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      // Payment verification failed
      await query(
        `UPDATE orders SET payment_status = 'failed', updated_at = NOW() WHERE id = $1`,
        [orderId]
      );
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Payment is authentic - update order
    await query(
      `UPDATE orders
       SET razorpay_payment_id = $1,
           payment_status = 'captured',
           status = 'confirmed',
           updated_at = NOW()
       WHERE id = $2`,
      [razorpay_payment_id, orderId]
    );

    res.json({
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Razorpay Webhook (handles payment events)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(req.body);
    const digest = shasum.digest('hex');

    if (signature !== digest) {
      console.error('Webhook signature mismatch');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(req.body);

    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        const orderId = payment.notes?.orderId;

        if (orderId) {
          await query(
            `UPDATE orders
             SET payment_status = 'captured',
                 status = 'confirmed',
                 updated_at = NOW()
             WHERE id = $1 AND payment_status != 'captured'`,
            [orderId]
          );
        }
        break;
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        const orderId = payment.notes?.orderId;

        if (orderId) {
          await query(
            `UPDATE orders
             SET payment_status = 'failed',
                 updated_at = NOW()
             WHERE id = $1`,
            [orderId]
          );
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get payment status for an order
router.get('/:orderId/status', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT razorpay_order_id, razorpay_payment_id, payment_status, total
       FROM orders WHERE id = $1`,
      [req.params.orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ payment: result.rows[0] });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

export default router;
