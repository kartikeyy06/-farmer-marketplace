# Farmer-to-Consumer Marketplace

A full-stack web application connecting farmers directly with consumers, featuring bilingual support (English/Hindi), location-based matching, and integrated payments.

## 🌟 Features

### Core Functionality
- **Phone OTP Authentication** - Secure login via SMS verification (Twilio)
- **Dual User Roles** - Separate experiences for farmers and consumers
- **Bilingual Support** - Full Hindi/English localization for farmer-facing UI
- **Location-Based Matching** - Consumers discover farmers within their radius
- **Product Management** - Farmers can list products with photos, pricing, and availability
- **Order Management** - Complete order flow from placement to fulfillment
- **Stripe Connect Payments** - Platform fee split between marketplace and farmers
- **Reviews & Ratings** - Post-purchase feedback system

## 🛠 Tech Stack

### Frontend
- **React 19** - UI framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **i18next** - Internationalization (English/Hindi)
- **Axios** - API client
- **Mapbox GL** - Maps and geolocation
- **Vite** - Build tool

### Backend
- **Node.js + Express** - Server framework
- **PostgreSQL** - Database
- **JWT** - Authentication tokens
- **Twilio** - SMS/OTP delivery
- **Stripe** - Payment processing
- **Helmet** - Security headers
- **Rate limiting** - DDoS protection

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Twilio account (for SMS OTP)
- Stripe account (for payments)
- Mapbox account (for maps)

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
cd farmer-marketplace
npm run install:all
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb farmer_marketplace
```

Copy backend environment file and configure:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/farmer_marketplace
JWT_SECRET=your-super-secret-jwt-key-change-this
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
STRIPE_SECRET_KEY=sk_test_...
MAPBOX_ACCESS_TOKEN=pk.ey...
NODE_ENV=development
PORT=3001
```

Run migrations:

```bash
npm run migrate
```

### 3. Frontend Setup

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

### 4. Run the Application

From the root directory:

```bash
npm run dev
```

This starts:
- Backend API on `http://localhost:3001`
- Frontend on `http://localhost:5173`

## 📱 Development Notes

### Phone OTP (Development Mode)

In development (`NODE_ENV=development`), OTPs are logged to the console instead of sent via SMS:

```
[DEV] OTP for +1234567890: 123456
```

This saves SMS credits during development.

### Default Test Credentials

Use any phone number format (e.g., `+1234567890`) and check backend console for the OTP.

## 🗂 Project Structure

```
farmer-marketplace/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js          # Database connection
│   │   │   ├── schema.sql        # Database schema
│   │   │   └── migrate.js        # Migration runner
│   │   ├── routes/
│   │   │   └── auth.js           # Auth endpoints
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT middleware
│   │   ├── utils/
│   │   │   └── otp.js            # OTP generation/verification
│   │   └── index.js              # Express server
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx   # Auth state management
│   │   ├── pages/
│   │   │   └── Login.jsx         # OTP login flow
│   │   ├── services/
│   │   │   └── api.js            # API client
│   │   ├── App.jsx               # Root component
│   │   ├── i18n.js               # i18next config
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
└── package.json                   # Root workspace config
```

## 📊 Database Schema

### Core Tables
- `users` - Phone numbers and role (farmer/consumer)
- `otps` - OTP verification codes
- `farmer_profiles` - Farmer details, location, language preference
- `consumer_profiles` - Consumer details and location
- `products` - Product listings with pricing and inventory
- `product_photos` - Product images
- `categories` - Product categories (bilingual)
- `orders` - Order records
- `order_items` - Line items per order
- `reviews` - Post-purchase ratings

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/request-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and login/register
- `GET /api/auth/me` - Get current user

### Coming in Phase 2+
- Farmer profile and product management
- Consumer marketplace browsing
- Order creation and management
- Stripe Connect onboarding
- Payment processing
- Reviews

## 🏗 Build Phases

### ✅ Phase 1: Foundation (COMPLETE)
- [x] Monorepo structure
- [x] PostgreSQL schema
- [x] Phone OTP authentication
- [x] Basic routing and protected routes
- [x] i18next setup with English/Hindi
- [x] Auth context and API client

### 🔄 Phase 2: Farmer Dashboard (NEXT)
- [ ] Farmer profile management (bilingual forms)
- [ ] Product CRUD with photo uploads
- [ ] Set delivery/pickup radius on map
- [ ] Language toggle (English ⇄ Hindi)

### 📅 Phase 3: Consumer Marketplace
- [ ] Browse products with filters
- [ ] Location-based farmer discovery
- [ ] Product detail pages
- [ ] Shopping cart

### 📅 Phase 4: Orders
- [ ] Checkout flow
- [ ] Order status management
- [ ] Email/SMS notifications
- [ ] Order history

### 📅 Phase 5: Payments
- [ ] Stripe Connect farmer onboarding
- [ ] Checkout with platform fee split
- [ ] Payout management

### 📅 Phase 6: Reviews & Polish
- [ ] Rating system
- [ ] Review display
- [ ] Mobile responsiveness pass
- [ ] Performance optimization

## 🔐 Security Features

- Helmet.js security headers
- Rate limiting (100 req/15min general, 3 OTP/min)
- JWT token authentication
- Input validation
- SQL injection protection via parameterized queries
- CORS configuration

## 🌍 Internationalization

The farmer-facing UI supports:
- **English** (default)
- **Hindi** with Devanagari script (Noto Sans Devanagari font)

Farmers can toggle language in settings. Product names/descriptions can be entered in Hindi.

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! This is a learning/demo project.

---

**Current Status:** Phase 1 (Foundation) complete. Ready to test OTP auth flow and proceed to Phase 2 (Farmer Dashboard).
