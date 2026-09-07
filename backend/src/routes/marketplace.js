import express from 'express';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all public products with filters and search
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      search,
      category_id,
      is_organic,
      min_price,
      max_price,
      latitude,
      longitude,
      max_distance_km,
      sort = 'created_at',
      order = 'DESC',
      limit = 50,
      offset = 0
    } = req.query;

    let queryText = `
      SELECT
        p.*,
        c.name_en as category_name_en,
        c.name_hi as category_name_hi,
        fp.farm_name,
        fp.name as farmer_name,
        fp.latitude as farmer_latitude,
        fp.longitude as farmer_longitude,
        fp.supports_pickup,
        fp.supports_delivery,
        fp.delivery_radius_km,
        COALESCE(
          json_agg(
            json_build_object('id', pp.id, 'photo_url', pp.photo_url, 'display_order', pp.display_order)
            ORDER BY pp.display_order
          ) FILTER (WHERE pp.id IS NOT NULL),
          '[]'
        ) as photos
      FROM products p
      JOIN farmer_profiles fp ON p.farmer_id = fp.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_photos pp ON p.id = pp.product_id
      WHERE p.is_active = true AND p.quantity_available > 0
    `;

    const params = [];
    let paramIndex = 1;

    // Search filter
    if (search) {
      queryText += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Category filter
    if (category_id) {
      queryText += ` AND p.category_id = $${paramIndex}`;
      params.push(category_id);
      paramIndex++;
    }

    // Organic filter
    if (is_organic === 'true') {
      queryText += ` AND p.is_organic = true`;
    }

    // Price range filter
    if (min_price) {
      queryText += ` AND p.price >= $${paramIndex}`;
      params.push(parseFloat(min_price));
      paramIndex++;
    }

    if (max_price) {
      queryText += ` AND p.price <= $${paramIndex}`;
      params.push(parseFloat(max_price));
      paramIndex++;
    }

    queryText += ` GROUP BY p.id, c.name_en, c.name_hi, fp.farm_name, fp.name, fp.latitude, fp.longitude, fp.supports_pickup, fp.supports_delivery, fp.delivery_radius_km`;

    // Distance filter (post-grouping)
    if (latitude && longitude && max_distance_km) {
      queryText = `
        SELECT *,
          (6371 * acos(
            cos(radians($${paramIndex})) * cos(radians(farmer_latitude)) *
            cos(radians(farmer_longitude) - radians($${paramIndex + 1})) +
            sin(radians($${paramIndex})) * sin(radians(farmer_latitude))
          )) as distance_km
        FROM (${queryText}) as products_with_info
        WHERE (6371 * acos(
          cos(radians($${paramIndex})) * cos(radians(farmer_latitude)) *
          cos(radians(farmer_longitude) - radians($${paramIndex + 1})) +
          sin(radians($${paramIndex})) * sin(radians(farmer_latitude))
        )) <= $${paramIndex + 2}
      `;
      params.push(parseFloat(latitude), parseFloat(longitude), parseFloat(max_distance_km));
      paramIndex += 3;
    }

    // Sorting
    const validSortFields = ['created_at', 'price', 'name'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    queryText += ` ORDER BY ${sortField} ${sortOrder}`;

    // Pagination
    queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    res.json({
      products: result.rows,
      count: result.rows.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get marketplace products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product detail (public)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT
        p.*,
        c.name_en as category_name_en,
        c.name_hi as category_name_hi,
        fp.farm_name,
        fp.name as farmer_name,
        fp.bio as farmer_bio,
        fp.latitude as farmer_latitude,
        fp.longitude as farmer_longitude,
        fp.address as farmer_address,
        fp.city as farmer_city,
        fp.state as farmer_state,
        fp.supports_pickup,
        fp.supports_delivery,
        fp.delivery_radius_km,
        COALESCE(
          json_agg(
            json_build_object('id', pp.id, 'photo_url', pp.photo_url, 'display_order', pp.display_order)
            ORDER BY pp.display_order
          ) FILTER (WHERE pp.id IS NOT NULL),
          '[]'
        ) as photos,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM products p
      JOIN farmer_profiles fp ON p.farmer_id = fp.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_photos pp ON p.id = pp.product_id
      LEFT JOIN reviews r ON r.farmer_id = fp.id
      WHERE p.id = $1 AND p.is_active = true
      GROUP BY p.id, c.name_en, c.name_hi, fp.farm_name, fp.name, fp.bio, fp.latitude, fp.longitude, fp.address, fp.city, fp.state, fp.supports_pickup, fp.supports_delivery, fp.delivery_radius_km`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error('Get product detail error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get farmer's products (for farmer detail page)
router.get('/farmer/:farmerId', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT
        p.*,
        c.name_en as category_name_en,
        c.name_hi as category_name_hi,
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
      WHERE p.farmer_id = $1 AND p.is_active = true AND p.quantity_available > 0
      GROUP BY p.id, c.name_en, c.name_hi
      ORDER BY p.created_at DESC`,
      [req.params.farmerId]
    );

    res.json({ products: result.rows });
  } catch (error) {
    console.error('Get farmer products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

export default router;
