import express from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';
import { generateOTP, sendOTP, saveOTP, verifyOTP } from '../utils/otp.js';

const router = express.Router();

// Request OTP
router.post('/request-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Generate and send OTP
    const otp = generateOTP();
    await saveOTP(phoneNumber, otp);
    await sendOTP(phoneNumber, otp);

    res.json({
      message: 'OTP sent successfully',
      expiresIn: 600 // seconds
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP and register/login
router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp, role, name } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    // Verify OTP
    const isValid = await verifyOTP(phoneNumber, otp);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Check if user exists
    let userResult = await query(
      'SELECT * FROM users WHERE phone_number = $1',
      [phoneNumber]
    );

    let user;
    let isNewUser = false;

    if (userResult.rows.length === 0) {
      // New user - require role and name
      if (!role || !name) {
        return res.status(400).json({
          error: 'Role and name are required for registration',
          requiresRegistration: true
        });
      }

      if (!['farmer', 'consumer'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      // Create new user
      userResult = await query(
        'INSERT INTO users (phone_number, role) VALUES ($1, $2) RETURNING *',
        [phoneNumber, role]
      );
      user = userResult.rows[0];
      isNewUser = true;

      // Create profile based on role
      if (role === 'farmer') {
        await query(
          'INSERT INTO farmer_profiles (user_id, name, farm_name) VALUES ($1, $2, $3)',
          [user.id, name, name] // Use name as farm_name initially
        );
      } else {
        await query(
          'INSERT INTO consumer_profiles (user_id, name) VALUES ($1, $2)',
          [user.id, name]
        );
      }
    } else {
      user = userResult.rows[0];
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        phoneNumber: user.phone_number
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        phoneNumber: user.phone_number,
        role: user.role
      },
      isNewUser
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userResult = await query(
      'SELECT id, phone_number, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: userResult.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
