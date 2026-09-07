import express from 'express';
import { query } from '../db/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get farmer profile
router.get('/profile', authenticateToken, requireRole('farmer'), async (req, res) => {
  try {
    const result = await query(
      `SELECT fp.*, u.phone_number
       FROM farmer_profiles fp
       JOIN users u ON fp.user_id = u.id
       WHERE fp.user_id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Get farmer profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update farmer profile
router.put('/profile', authenticateToken, requireRole('farmer'), async (req, res) => {
  try {
    const {
      name,
      farm_name,
      bio,
      photo_url,
      latitude,
      longitude,
      address,
      city,
      state,
      postal_code,
      delivery_radius_km,
      supports_pickup,
      supports_delivery,
      preferred_language
    } = req.body;

    const result = await query(
      `UPDATE farmer_profiles
       SET name = COALESCE($1, name),
           farm_name = COALESCE($2, farm_name),
           bio = COALESCE($3, bio),
           photo_url = COALESCE($4, photo_url),
           latitude = COALESCE($5, latitude),
           longitude = COALESCE($6, longitude),
           address = COALESCE($7, address),
           city = COALESCE($8, city),
           state = COALESCE($9, state),
           postal_code = COALESCE($10, postal_code),
           delivery_radius_km = COALESCE($11, delivery_radius_km),
           supports_pickup = COALESCE($12, supports_pickup),
           supports_delivery = COALESCE($13, supports_delivery),
           preferred_language = COALESCE($14, preferred_language),
           updated_at = NOW()
       WHERE user_id = $15
       RETURNING *`,
      [
        name, farm_name, bio, photo_url, latitude, longitude,
        address, city, state, postal_code, delivery_radius_km,
        supports_pickup, supports_delivery, preferred_language,
        req.user.userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Update farmer profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
