import express from 'express';
import { query } from '../db/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { sendOrderNotification } from '../utils/notifications.js';

const router = express.Router();

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
};

// Create order (Consumer)
router.post('/', authenticateToken, requireRole('consumer'), async (req, res) => {
  const client = await query('BEGIN');

  try {
    const { items, fulfillment_type, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    if (!['pickup', 'delivery'].includes(fulfillment_type)) {
      return res.status(400).json({ error: 'Invalid fulfillment type' });
    }

    // Get consumer profile
    const consumerResult = await client.query(
      'SELECT id FROM consumer_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (consumerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Consumer profile not found' });
    }

    const consumerId = consumerResult.rows[0].id;

    // Group items by farmer
    const farmerOrders = {};
    for (const item of items) {
      // Get product with farmer info
      const productResult = await client.query(
        `SELECT p.*, p.farmer_id, fp.supports_pickup, fp.supports_delivery
         FROM products p
         JOIN farmer_profiles fp ON p.farmer_id = fp.id
         WHERE p.id = $1 AND p.is_active = true`,
        [item.productId]
      );

      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: `Product ${item.productId} not found or inactive` });
      }

      const product = productResult.rows[0];

      // Check stock
      if (product.quantity_available < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.quantity_available}`
        });
      }

      // Check if farmer supports fulfillment type
      if (fulfillment_type === 'pickup' && !product.supports_pickup) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Farmer does not support pickup` });
      }

      if (fulfillment_type === 'delivery' && !product.supports_delivery) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Farmer does not support delivery` });
      }

      // Group by farmer
      if (!farmerOrders[product.farmer_id]) {
        farmerOrders[product.farmer_id] = [];
      }

      farmerOrders[product.farmer_id].push({
        ...item,
        product
      });
    }

    const createdOrders = [];

    // Create separate order for each farmer
    for (const [farmerId, farmerItems] of Object.entries(farmerOrders)) {
      let subtotal = 0;

      for (const item of farmerItems) {
        subtotal += item.product.price * item.quantity;
      }

      const platformFee = subtotal * 0.10; // 10% platform fee
      const total = subtotal + platformFee;
      const orderNumber = generateOrderNumber();

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (
          order_number, consumer_id, farmer_id, status, fulfillment_type,
          subtotal, platform_fee, total, notes
        ) VALUES ($1, $2, $3, 'placed', $4, $5, $6, $7, $8)
        RETURNING *`,
        [orderNumber, consumerId, farmerId, fulfillment_type, subtotal, platformFee, total, notes]
      );

      const order = orderResult.rows[0];

      // Create order items and reduce stock
      for (const item of farmerItems) {
        await client.query(
          `INSERT INTO order_items (
            order_id, product_id, product_name, quantity, unit_price, total_price
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            order.id,
            item.product.id,
            item.product.name,
            item.quantity,
            item.product.price,
            item.product.price * item.quantity
          ]
        );

        // Reduce product stock
        await client.query(
          'UPDATE products SET quantity_available = quantity_available - $1 WHERE id = $2',
          [item.quantity, item.product.id]
        );
      }

      createdOrders.push(order);
    }

    await client.query('COMMIT');

    // Send notifications for each created order
    for (const order of createdOrders) {
      // Get farmer phone and consumer phone for notifications
      const farmerResult = await query(
        `SELECT u.phone_number FROM users u
         JOIN farmer_profiles fp ON u.id = fp.user_id
         WHERE fp.id = $1`,
        [order.farmer_id]
      );
      const consumerResult = await query(
        `SELECT u.phone_number FROM users u
         JOIN consumer_profiles cp ON u.id = cp.user_id
         WHERE cp.id = $1`,
        [order.consumer_id]
      );

      if (farmerResult.rows.length > 0 && consumerResult.rows.length > 0) {
        await sendOrderNotification({
          type: 'placed',
          order,
          farmerPhone: farmerResult.rows[0].phone_number,
          consumerPhone: consumerResult.rows[0].phone_number
        });
      }
    }

    res.status(201).json({
      message: 'Order(s) placed successfully',
      orders: createdOrders
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get consumer orders
router.get('/consumer', authenticateToken, requireRole('consumer'), async (req, res) => {
  try {
    const consumerResult = await query(
      'SELECT id FROM consumer_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (consumerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Consumer profile not found' });
    }

    const result = await query(
      `SELECT o.*,
              fp.farm_name, fp.name as farmer_name,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', oi.id,
                    'product_name', oi.product_name,
                    'quantity', oi.quantity,
                    'unit_price', oi.unit_price,
                    'total_price', oi.total_price
                  )
                  ORDER BY oi.created_at
                ) FILTER (WHERE oi.id IS NOT NULL),
                '[]'
              ) as items
       FROM orders o
       JOIN farmer_profiles fp ON o.farmer_id = fp.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.consumer_id = $1
       GROUP BY o.id, fp.farm_name, fp.name
       ORDER BY o.created_at DESC`,
      [consumerResult.rows[0].id]
    );

    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Get consumer orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get farmer orders
router.get('/farmer', authenticateToken, requireRole('farmer'), async (req, res) => {
  try {
    const farmerResult = await query(
      'SELECT id FROM farmer_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (farmerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }

    const result = await query(
      `SELECT o.*,
              cp.name as consumer_name,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', oi.id,
                    'product_name', oi.product_name,
                    'quantity', oi.quantity,
                    'unit_price', oi.unit_price,
                    'total_price', oi.total_price
                  )
                  ORDER BY oi.created_at
                ) FILTER (WHERE oi.id IS NOT NULL),
                '[]'
              ) as items
       FROM orders o
       JOIN consumer_profiles cp ON o.consumer_id = cp.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.farmer_id = $1
       GROUP BY o.id, cp.name
       ORDER BY o.created_at DESC`,
      [farmerResult.rows[0].id]
    );

    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Get farmer orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order detail
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT o.*,
              fp.farm_name, fp.name as farmer_name, fp.address as farmer_address,
              fp.city as farmer_city, fp.state as farmer_state,
              cp.name as consumer_name, cp.address as consumer_address,
              cp.city as consumer_city, cp.state as consumer_state,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', oi.id,
                    'product_name', oi.product_name,
                    'quantity', oi.quantity,
                    'unit_price', oi.unit_price,
                    'total_price', oi.total_price
                  )
                  ORDER BY oi.created_at
                ) FILTER (WHERE oi.id IS NOT NULL),
                '[]'
              ) as items
       FROM orders o
       JOIN farmer_profiles fp ON o.farmer_id = fp.id
       JOIN consumer_profiles cp ON o.consumer_id = cp.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = $1
       GROUP BY o.id, fp.farm_name, fp.name, fp.address, fp.city, fp.state,
                cp.name, cp.address, cp.city, cp.state`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order: result.rows[0] });
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status (Farmer only)
router.patch('/:id/status', authenticateToken, requireRole('farmer'), async (req, res) => {
  try {
    const { status, cancelled_reason } = req.body;

    if (!['confirmed', 'ready', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const farmerResult = await query(
      'SELECT id FROM farmer_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (farmerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }

    const result = await query(
      `UPDATE orders
       SET status = $1,
           cancelled_reason = $2,
           updated_at = NOW()
       WHERE id = $3 AND farmer_id = $4
       RETURNING *`,
      [status, cancelled_reason || null, req.params.id, farmerResult.rows[0].id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = result.rows[0];

    // Send notification about status change
    const farmerResult = await query(
      `SELECT u.phone_number FROM users u
       JOIN farmer_profiles fp ON u.id = fp.user_id
       WHERE fp.id = $1`,
      [updatedOrder.farmer_id]
    );
    const consumerResult = await query(
      `SELECT u.phone_number FROM users u
       JOIN consumer_profiles cp ON u.id = cp.user_id
       WHERE cp.id = $1`,
      [updatedOrder.consumer_id]
    );

    if (farmerResult.rows.length > 0 && consumerResult.rows.length > 0) {
      await sendOrderNotification({
        type: status,
        order: updatedOrder,
        farmerPhone: farmerResult.rows[0].phone_number,
        consumerPhone: consumerResult.rows[0].phone_number
      });
    }

    res.json({ order: updatedOrder });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;
