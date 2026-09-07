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
│   │   │   ├── auth.js           # Auth endpoints
│   │   │   ├── farmer.js         # Farmer profile
│   │   │   ├── products.js       # Product CRUD
│   │   │   ├── consumer.js       # Consumer profile
│   │   │   ├── marketplace.js    # Marketplace browsing
│   │   │   └── orders.js         # Order management
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT middleware
│   │   ├── utils/
│   │   │   ├── otp.js            # OTP generation/verification
│   │   │   └── notifications.js  # Email/SMS notifications
│   │   └── index.js              # Express server
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── DashboardLayout.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── farmer/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   ├── ProductsList.jsx
│   │   │   │   ├── ProductForm.jsx
│   │   │   │   └── Orders.jsx
│   │   │   └── consumer/
│   │   │       ├── Marketplace.jsx
│   │   │       ├── ProductDetail.jsx
│   │   │       ├── Cart.jsx
│   │   │       ├── Checkout.jsx
│   │   │       ├── Orders.jsx
│   │   │       └── OrderDetail.jsx
│   │   ├── services/
│   │   │   ├── apiClient.js
│   │   │   └── api.js
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

### Farmer (Phase 2)
- `GET /api/farmer/profile` - Get farmer profile
- `PUT /api/farmer/profile` - Update profile

### Products (Phase 2)
- `GET /api/products` - List farmer's products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/categories/all` - Get categories

### Consumer (Phase 3)
- `GET /api/consumer/profile` - Get consumer profile
- `PUT /api/consumer/profile` - Update profile

### Marketplace (Phase 3)
- `GET /api/marketplace` - Browse products (with filters)
  - Query params: `search`, `category_id`, `is_organic`, `min_price`, `max_price`, `latitude`, `longitude`, `max_distance_km`, `sort`, `order`
- `GET /api/marketplace/:id` - Get product detail with farmer info
- `GET /api/marketplace/farmer/:farmerId` - Get farmer's products

### Orders (Phase 4)
- `POST /api/orders` - Create order from cart items
- `GET /api/orders/consumer` - Get consumer's orders
- `GET /api/orders/farmer` - Get farmer's incoming orders
- `GET /api/orders/:id` - Get order detail
- `PATCH /api/orders/:id/status` - Update order status

## 🏗 Build Phases

### ✅ Phase 1: Foundation (COMPLETE)
- [x] Monorepo structure
- [x] PostgreSQL schema
- [x] Phone OTP authentication
- [x] Basic routing and protected routes
- [x] i18next setup with English/Hindi
- [x] Auth context and API client

### ✅ Phase 2: Farmer Dashboard (COMPLETE)
- [x] Farmer profile management (bilingual forms)
- [x] Product CRUD operations
- [x] Language toggle (English ⇄ Hindi)
- [x] Dashboard with stats and quick actions
- [x] Category management (bilingual)
- [x] Delivery radius configuration
- [x] Active/inactive product status

### ✅ Phase 3: Consumer Marketplace (COMPLETE)
- [x] Browse products with filters
- [x] Search and advanced filtering
- [x] Product detail pages
- [x] Shopping cart with persistence
- [x] Platform fee calculation (10%)

### ✅ Phase 4: Orders & Checkout (COMPLETE)
- [x] Checkout flow with fulfillment type selection
- [x] Order creation with multi-farmer support
- [x] Stock validation and reduction
- [x] Order status tracking (placed → confirmed → ready → completed)
- [x] Farmer order management with status actions
- [x] Consumer order history with filters
- [x] Order detail page with status timeline
- [x] Email/SMS notifications (console in dev mode)

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

## 📸 Screenshots

### Farmer Dashboard (Phase 2)
- Dashboard with product stats and quick actions
- Product management with grid view
- Bilingual forms (English/Hindi)
- Profile editor with delivery settings
- Language toggle in header

### Consumer Marketplace (Phase 3)
- Product browsing with search and filters
- Product detail pages with farmer info
- Shopping cart with order summary
- Platform fee breakdown (10%)
- Responsive design

### Orders & Checkout (Phase 4)
- Checkout with delivery/pickup selection
- Order history with status filters
- Order detail with timeline tracking
- Farmer order management with actions

## 🧪 Testing

### Test as Farmer
1. Start servers: `npm run dev`
2. Go to http://localhost:5173
3. Enter any phone number
4. Get OTP from backend console
5. Select "Farmer" role
6. Add products with various categories and prices
7. Test bilingual UI (toggle language)

### Test as Consumer
1. Logout and login again
2. Select "Consumer" role
3. Browse marketplace
4. Use search and filters
5. View product details
6. Add items to cart
7. Update quantities
8. View order summary
9. Proceed to checkout
10. Place order and view in order history

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! This is a learning/demo project.

---

**Current Status:** Phase 4 Complete ✅
**Next:** Phase 5 - Stripe Connect Payments
**Last Updated:** 2026-09-06
