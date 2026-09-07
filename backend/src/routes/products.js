import express from 'express';
import { query } from '../db/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all products for logged-in farmer
router.get('/', authenticateToken, requireRole('farmer'), async (req, res) => {
  try {
    // Get farmer profile first
    const farmerResult = await query(
      'SELECT id FROM farmer_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (farmerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }

    const farmerId = farmerResult.rows[0].id;

    const result = await query(
      `SELECT p.*, c.name_en as category_name_en, c.name_hi as category_name_hi,
              COALESCE(
                json_agg(
                  json_build_object('id', pp.id, 'photo_url', pp.photo_url, 'display_order', pp.display_order)
                  ORDER BY pp.display_order
                ) FILTER (WHERE pp.id IS NOT NULL),
                '[]'
              ) as photos
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN product_photos pp ON p.id = pp.product_id
       WHERE p.farmer_id = $1
       GROUP BY p.id, c.name_en, c.name_hi
       ORDER BY p.created_at DESC`,
      [farmerId]
    );

    res.json({ products: result.rows });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', authenticateToken, requireRole('farmer'), async (req, res) => {
  try {
    const farmerResult = await query(
      'SELECT id FROM farmer_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (farmerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }

    const result = await query(
      `SELECT p.*, c.name_en as category_name_en, c.name_hi as category_name_hi,
              COALESCE(
                json_agg(
                  json_build_object('id', pp.id, 'photo_url', pp.photo_url, 'display_order', pp.display_order)
                  ORDER BY pp.display_order
                ) FILTER (WHERE pp.id IS NOT NULL),
                '[]'
              ) as photos
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN product_photos pp ON p.id = pp.product_id
       WHERE p.id = $1 AND p.farmer_id = $2
       GROUP BY p.id, c.name_en, c.name_hi`,
      [req.params.id, farmerResult.rows[0].id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product
router.post('/', authenticateToken, requireRole('farmer'), async (req, res) => {
  try {
    const {
      name,
      description,
      category_id,
      price,
      unit,
      quantity_available,
      harvest_date,
      availability_date,
      is_organic,
      certification_flags
    } = req.body;

    // Get farmer profile
    const farmerResult = await query(
      'SELECT id FROM farmer_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (farmerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }

    const farmerId = farmerResult.rows[0].id;

    const result = await query(
      `INSERT INTO products (
        farmer_id, name, description, category_id, price, unit,
        quantity_available, harvest_date, availability_date,
        is_organic, certification_flags, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
      RETURNING *`,
      [
        farmerId, name, description, category_id, price, unit,
        quantity_available, harvest_date, availability_date,
        is_organic, certification_flags
      ]
    );

    res.status(201).json({ product: result.rows[0] });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', authenticateToken, requireRole('farmer'), async (req, res) => {
  try {
    const {
      name,
      description,
      category_id,
      price,
      unit,
      quantity_available,
      harvest_date,
      availability_date,
      is_organic,
      certification_flags,
      is_active
    } = req.body;

    // Get farmer profile
    const farmerResult = await query(
      'SELECT id FROM farmer_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (farmerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }

    const result = await query(
      `UPDATE products
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           category_id = COALESCE($3, category_id),
           price = COALESCE($4, price),
           unit = COALESCE($5, unit),
           quantity_available = COALESCE($6, quantity_available),
           harvest_date = COALESCE($7, harvest_date),
           availability_date = COALESCE($8, availability_date),
           is_organic = COALESCE($9, is_organic),
           certification_flags = COALESCE($10, certification_flags),
           is_active = COALESCE($11, is_active),
           updated_at = NOW()
       WHERE id = $12 AND farmer_id = $13
       RETURNING *`,
      [
        name, description, category_id, price, unit, quantity_available,
        harvest_date, availability_date, is_organic, certification_flags,
        is_active, req.params.id, farmerResult.rows[0].id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', authenticateToken, requireRole('farmer'), async (req, res) => {
  try {
    const farmerResult = await query(
      'SELECT id FROM farmer_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (farmerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }

    const result = await query(
      'DELETE FROM products WHERE id = $1 AND farmer_id = $2 RETURNING id',
      [req.params.id, farmerResult.rows[0].id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get categories
router.get('/categories/all', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM categories ORDER BY name_en');
    res.json({ categories: result.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
