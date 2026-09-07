# Quick Start Guide - Phase 1

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ PostgreSQL 14+ installed and running
- ✅ npm installed (`npm --version`)

## Step-by-Step Setup

### 1. Create Database

```bash
createdb farmer_marketplace
```

Or using psql:
```bash
psql -U postgres
CREATE DATABASE farmer_marketplace;
\q
```

### 2. Configure Backend

The `.env` file is already created in `backend/.env`. Update these values:

**Required for testing Phase 1:**
```env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/farmer_marketplace
JWT_SECRET=your-secret-key-here
```

**Optional (for Phase 5):**
- `TWILIO_*` - SMS OTP (dev mode logs OTPs to console)
- `STRIPE_*` - Payments
- `MAPBOX_ACCESS_TOKEN` - Maps

### 3. Run Database Migration

```bash
cd backend
npm run migrate
```

You should see:
```
✓ Migration completed successfully
```

### 4. Start Development Servers

**Option A: Start both servers (from root):**
```bash
npm run dev
```

**Option B: Start individually:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

## Testing Phase 1

1. Open http://localhost:5173
2. Click "Get Started"
3. Enter any phone number (e.g., `+1234567890`)
4. Click "Send OTP"
5. Check the backend console for the OTP:
   ```
   [DEV] OTP for +1234567890: 123456
   ```
6. Enter the OTP code
7. Select role (Farmer/Consumer) and enter name
8. You should be redirected to the appropriate dashboard placeholder

## Verification Checklist

- [ ] Frontend loads at http://localhost:5173
- [ ] Backend API responds at http://localhost:3001/health
- [ ] OTP is logged to backend console
- [ ] Login flow completes successfully
- [ ] User is redirected based on role
- [ ] JWT token stored in localStorage

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Fix:** Ensure PostgreSQL is running
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Start PostgreSQL service from Services app
```

### Port Already in Use
```
Error: Port 3001 is already in use
```
**Fix:** Kill the process or change PORT in `backend/.env`
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Migration Fails
```
Error: relation "users" already exists
```
**Fix:** Drop and recreate the database
```bash
dropdb farmer_marketplace
createdb farmer_marketplace
cd backend && npm run migrate
```

## Next Steps

Once Phase 1 is verified:
- ✅ **Phase 2:** Farmer Dashboard (product management, bilingual UI)
- 📅 **Phase 3:** Consumer Marketplace
- 📅 **Phase 4:** Orders
- 📅 **Phase 5:** Payments
- 📅 **Phase 6:** Reviews & Polish

## Database Schema Overview

Tables created in Phase 1:
- `users` - User accounts with phone & role
- `otps` - OTP verification codes
- `farmer_profiles` - Farmer information
- `consumer_profiles` - Consumer information
- `products` - Product listings
- `product_photos` - Product images
- `categories` - Product categories (with Hindi translations)
- `orders` - Order records
- `order_items` - Order line items
- `reviews` - Ratings and reviews

All tables are ready for Phases 2-6.
