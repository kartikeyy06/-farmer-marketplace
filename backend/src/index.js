import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import farmerRoutes from './routes/farmer.js';
import productsRoutes from './routes/products.js';
import consumerRoutes from './routes/consumer.js';
import marketplaceRoutes from './routes/marketplace.js';
import ordersRoutes from './routes/orders.js';
import paymentsRoutes from './routes/payments.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173'
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// OTP-specific rate limiting
const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 OTP requests per minute
  message: { error: 'Too many OTP requests. Please try again later.' }
});

// Body parsing (JSON)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Razorpay webhook needs raw body for signature verification
// This is handled in the payments route itself

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', otpLimiter, authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/consumer', consumerRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});
