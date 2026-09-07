import express from 'express';
import { query } from '../db/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get consumer profile
router.get('/profile', authenticateToken, requireRole('consumer'), async (req, res) => {
  try {
    const result = await query(
      `SELECT cp.*, u.phone_number
       FROM consumer_profiles cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.user_id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consumer profile not found' });
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Get consumer profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update consumer profile
router.put('/profile', authenticateToken, requireRole('consumer'), async (req, res) => {
  try {
    const {
      name,
      photo_url,
      latitude,
      longitude,
      address,
      city,
      state,
      postal_code
    } = req.body;

    const result = await query(
      `UPDATE consumer_profiles
       SET name = COALESCE($1, name),
           photo_url = COALESCE($2, photo_url),
           latitude = COALESCE($3, latitude),
           longitude = COALESCE($4, longitude),
           address = COALESCE($5, address),
           city = COALESCE($6, city),
           state = COALESCE($7, state),
           postal_code = COALESCE($8, postal_code),
           updated_at = NOW()
       WHERE user_id = $9
       RETURNING *`,
      [name, photo_url, latitude, longitude, address, city, state, postal_code, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consumer profile not found' });
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Update consumer profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
