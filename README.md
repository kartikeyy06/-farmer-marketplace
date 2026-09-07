# 🌾 Farmer-to-Consumer Marketplace

A full-stack web application connecting local farmers directly with consumers — featuring bilingual support (English/Hindi), UPI payments via Razorpay, and a complete order management system.

---

## 🌟 Features at a Glance

| Feature | Description |
|---------|-------------|
| 🔐 Phone OTP Login | Secure login with SMS verification |
| 🧑‍🌾 Farmer Dashboard | Manage products, orders, profile in Hindi or English |
| 🛒 Consumer Marketplace | Browse, search, filter, and buy fresh produce |
| 💳 UPI Payments | Pay via Google Pay, PhonePe, BHIM, cards, netbanking |
| 📦 Order Tracking | Full order lifecycle: placed → confirmed → ready → completed |
| 🌐 Bilingual UI | Complete Hindi/English support with Devanagari font |
| 📍 Location Matching | Find farmers within your delivery radius |
| 📱 Notifications | Email/SMS alerts on order status changes |

---

## 🛠 Tech Stack

**Frontend:** React 19 · Tailwind CSS · React Router · i18next · Axios · Vite

**Backend:** Node.js · Express · PostgreSQL · JWT · Twilio (OTP) · Razorpay (Payments) · Helmet · Rate Limiting

---

## 📋 Prerequisites

Before you start, you need:

| Requirement | Why | Free? |
|-------------|-----|-------|
| Node.js 18+ | Runtime | ✅ |
| npm | Package manager | ✅ |
| PostgreSQL 14+ | Database | ✅ |
| Razorpay account | UPI payments | ✅ (test mode) |
| Twilio account | SMS OTP | ✅ (trial) |
| Mapbox account | Maps (optional) | ✅ |

---

## 🚀 Complete Setup Guide

### Step 1: Clone & Install Dependencies

```bash
# Clone the repo
git clone https://github.com/kartikeyy06/-farmer-marketplace.git
cd farmer-marketplace

# Install all dependencies (root + backend + frontend)
npm run install:all
```

---

### Step 2: Set Up PostgreSQL Database

**2a.** Install PostgreSQL if you haven't already, then create the database:

```bash
# Log into PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE farmer_marketplace;

# Exit
\q
```

**2b.** Open `backend/.env.example`, rename it to `backend/.env`, and edit it:

```bash
cd backend
cp .env.example .env
```

**Open `backend/.env` and fill in these values:**

```env
# ========== DATABASE ==========
# Replace username/password with your PostgreSQL credentials
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/farmer_marketplace

# ========== JWT ==========
# Any random string works - just change it for security
JWT_SECRET=my-super-secret-key-change-this-to-something-random

# ========== TWILIO (OTP SMS) ==========
# Get these from https://console.twilio.com/
# In development, OTPs are logged to console (no SMS sent)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# ========== RAZORPAY (UPI PAYMENTS) ==========
# Get these from https://dashboard.razorpay.com/
# Use test keys while developing
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_here

# ========== MAPBOX (Optional - for maps) ==========
# Get from https://account.mapbox.com/
MAPBOX_ACCESS_TOKEN=pk.eyJ1xxxxxxxxxxxxxxxxxxxxxx

# ========== SERVER ==========
PORT=3001
NODE_ENV=development

# ========== REGION ==========
# Set your marketplace region (city/area name and coordinates)
REGION_NAME=Jaipur
REGION_LAT=26.9124
REGION_LNG=75.7873
MAX_DISTANCE_KM=50
```

**2c. Run the database migration:**

```bash
# From the backend directory
npm run migrate
```

This creates all tables (users, products, orders, etc.) and inserts default categories.

---

### Step 3: Set Up Frontend Environment

```bash
cd ../frontend
cp .env.example .env
```

**Open `frontend/.env` and edit:**

```env
# Point to your backend server
VITE_API_URL=http://localhost:3001
```

That's it — only one variable to set.

---

### Step 4: Start the Application

```bash
# Go back to root directory
cd ..

# Start both backend and frontend
npm run dev
```

You'll see:
```
✓ Backend API running on http://localhost:3001
✓ Frontend running on http://localhost:5173
```

**Open `http://localhost:5173` in your browser.**

---

## 📱 Where to Get Your API Keys

### Razorpay (Required for Payments)

1. Go to [razorpay.com](https://razorpay.com) and create a free account
2. Go to **Settings → API Keys**
3. Click **Generate Test Key**
4. Copy `Key ID` and `Key Secret`
5. Paste them into `backend/.env` as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

> ⚠️ Use **test keys** (`rzp_test_...`) while developing. Switch to live keys (`rzp_live_...`) only when going to production.

### Twilio (Required for OTP)

1. Go to [twilio.com](https://www.twilio.com) and create a free trial account
2. Go to **Console Dashboard**
3. Copy your `Account SID` and `Auth Token`
4. Go to **Phone Numbers → Manage → Active Numbers**
5. Copy your Twilio phone number
6. Paste all three into `backend/.env`

> 💡 In development mode (`NODE_ENV=development`), OTPs are logged to the terminal instead of sending SMS — so you don't need to verify your Twilio number during development.

### Mapbox (Optional — for Maps)

1. Go to [mapbox.com](https://www.mapbox.com) and create a free account
2. Go to **Account → Access Tokens**
3. Copy your default public token
4. Paste into `backend/.env` as `MAPBOX_ACCESS_TOKEN`

---

## 👨‍🌾 How to Use as a FARMER

### Step 1: Register as Farmer

1. Open `http://localhost:5173`
2. Click **"Get Started"**
3. Enter your phone number (any number works in dev mode)
4. Check the **backend terminal** for the OTP:
   ```
   [DEV] OTP for +1234567890: 123456
   ```
5. Enter the OTP code
6. Select **"I am a Farmer"**
7. Enter your name → Click **Register**

### Step 2: Set Up Your Farm Profile

1. Click **"Profile"** in the sidebar
2. Fill in:
   - **Farm Name** — Your farm/shop name
   - **Bio** — Tell customers about your farm (e.g., "We grow organic vegetables using traditional methods")
   - **Address, City, State, Postal Code** — Your farm location
   - **Location coordinates** — Latitude/Longitude of your farm (Google Maps → right-click → "What's here?")
   - **Delivery Radius** — How far you'll deliver (in km)
   - **Pickup/Delivery** — Toggle which options you support
   - **Preferred Language** — Choose English or Hindi
3. Click **"Save Changes"**

> 💡 Toggle the language switch in the header (🌐) to switch between English and Hindi at any time.

### Step 3: Add Your Products

1. Click **"My Products"** in the sidebar
2. Click **"Add Product"**
3. Fill in the form:
   - **Product Name** — e.g., "Fresh Tomatoes", "ताज़े टमाटर"
   - **Description** — What makes your product special
   - **Category** — Select from dropdown (Vegetables, Fruits, Grains, Dairy, etc.)
   - **Price** — In ₹ (Indian Rupees)
   - **Unit** — kg, lb, each, bunch, or dozen
   - **Quantity Available** — How many units you have in stock
   - **Harvest Date** — When you harvested
   - **Organic** — Check if it's certified organic
4. Click **"Save"**

> You can create products in Hindi — the marketplace shows them in the language you enter.

### Step 4: Manage Incoming Orders

1. Click **"Orders"** in the sidebar
2. You'll see orders as customers place them
3. For each order you can:
   - **✓ Confirm** — Accept the order (customer gets notified)
   - **📦 Mark Ready** — Ready for pickup/delivery
   - **✓ Mark Completed** — Order fulfilled
   - **✗ Cancel** — Reject order (with reason)

### Order Status Flow
```
Customer places order → Placed
You confirm it       → Confirmed
You prepare it       → Ready for Pickup/Delivery
Customer collects    → Completed
```

---

## 🛒 How to Use as a CONSUMER

### Step 1: Register as Consumer

1. Open `http://localhost:5173`
2. Click **"Get Started"**
3. Enter your phone number
4. Check the **backend terminal** for the OTP
5. Enter the OTP
6. Select **"I am a Consumer"**
7. Enter your name → Click **Register**

### Step 2: Browse the Marketplace

1. You'll land on the **Marketplace** page
2. Browse products from local farmers
3. Use the **search bar** to find specific items
4. **Filter by category** — Vegetables, Fruits, Grains, Dairy, etc.
5. **Sort by** — Newest, Price (low to high / high to low), Name
6. Toggle **"Organic Only"** to see only organic products

### Step 3: View Product Details

1. Click on any product card
2. See the product details:
   - Price per unit
   - Quantity available
   - Harvest/availability date
   - Whether it's organic
3. See the **farmer's info** — name, farm name, bio
4. Click **"Add to Cart"** (you can add multiple items)

### Step 4: Manage Your Cart

1. Click the **🛒 Cart** icon in the header
2. See all items in your cart
3. **Adjust quantities** — Increase/decrease with + and - buttons
4. **Remove items** — Click the ✗ button
5. See the **Order Summary**:
   - Subtotal (sum of all items)
   - Platform Fee (10%)
   - Grand Total

### Step 5: Checkout & Pay

1. Click **"Proceed to Checkout"**
2. Review your **delivery information** (name and address from your profile)
3. Select **Fulfillment Type**:
   - 🚚 **Delivery** — Products delivered to your address
   - 🏪 **Pickup** — You pick up from the farm
4. Add **order notes** (optional) — Special instructions for the farmer
5. Review the **order summary** with total
6. Click **"Pay with UPI / Card"**
7. **Razorpay checkout opens** — Choose your payment method:
   - 📱 **UPI** — Enter your UPI ID or scan QR code
   - 💳 **Credit/Debit Card** — Enter card details
   - 🏦 **Netbanking** — Select your bank
8. Complete the payment
9. You'll be redirected to your **Order Detail** page

### Step 6: Track Your Orders

1. Click **"My Orders"** in the header
2. See all your orders with status:
   - 🔵 **Placed** — Order submitted, waiting for farmer
   - 🟢 **Confirmed** — Farmer accepted your order
   - 🟣 **Ready** — Ready for pickup/delivery
   - ⚪ **Completed** — Order fulfilled
   - 🔴 **Cancelled** — Order was cancelled
3. **Filter orders** by status using the tabs
4. **Click any order** to see full details:
   - Status timeline
   - Items ordered
   - Payment status
   - Farmer info
   - Fulfillment type (delivery/pickup)

---

## 🧪 Quick Test Walkthrough

### Full End-to-End Test

**Setup (2 minutes):**
```bash
# Terminal 1
cd farmer-marketplace
npm run dev

# Wait for servers to start
```

**Test as Farmer (3 minutes):**
1. Open `http://localhost:5173`
2. Enter phone: `9876543210`
3. Check terminal for OTP → enter it
4. Pick **Farmer** → Enter name "Ramesh Kumar"
5. Go to Profile → Fill farm details → Save
6. Go to My Products → Add 3-4 products (Tomatoes ₹40/kg, Onions ₹25/kg, etc.)
7. Toggle language to Hindi (🌐 button)

**Test as Consumer (5 minutes):**
1. Logout (sidebar) → Login again
2. Enter phone: `1234567890`
3. Check terminal for OTP → enter it
4. Pick **Consumer** → Enter name "Priya Sharma"
5. Browse marketplace → See Ramesh's products
6. Add items to cart → Go to cart → Proceed to checkout
7. Select delivery → Place order → Pay with Razorpay test UPI

**Test Order Management (2 minutes):**
1. Login as Farmer again (phone: `9876543210`)
2. Go to Orders → See the new order
3. Confirm → Mark Ready → Mark Completed

---

## 🗂 Complete Project Structure

```
farmer-marketplace/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js              # PostgreSQL connection pool
│   │   │   ├── schema.sql            # All database tables
│   │   │   └── migrate.js            # Runs schema.sql on database
│   │   ├── routes/
│   │   │   ├── auth.js               # OTP login/register
│   │   │   ├── farmer.js             # Farmer profile CRUD
│   │   │   ├── products.js           # Product CRUD + categories
│   │   │   ├── consumer.js           # Consumer profile CRUD
│   │   │   ├── marketplace.js        # Product browsing with filters
│   │   │   ├── orders.js             # Order creation + status management
│   │   │   └── payments.js           # Razorpay payment processing
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT verification + role check
│   │   ├── utils/
│   │   │   ├── otp.js                # OTP generation (Twilio or console)
│   │   │   └── notifications.js      # Email/SMS notification templates
│   │   └── index.js                  # Express server entry point
│   ├── .env.example                  # Copy to .env and fill in
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx    # Role-based route guard
│   │   │   └── DashboardLayout.jsx   # Farmer dashboard layout + sidebar
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx       # User auth state + JWT
│   │   │   └── CartContext.jsx       # Shopping cart (localStorage)
│   │   ├── pages/
│   │   │   ├── Login.jsx             # OTP login flow
│   │   │   ├── farmer/
│   │   │   │   ├── Dashboard.jsx     # Stats overview
│   │   │   │   ├── Profile.jsx       # Farm profile editor
│   │   │   │   ├── ProductsList.jsx  # Product grid view
│   │   │   │   ├── ProductForm.jsx   # Create/edit products
│   │   │   │   └── Orders.jsx        # Incoming orders management
│   │   │   └── consumer/
│   │   │       ├── Marketplace.jsx   # Browse products
│   │   │       ├── ProductDetail.jsx # Single product view
│   │   │       ├── Cart.jsx          # Shopping cart
│   │   │       ├── Checkout.jsx      # Razorpay checkout
│   │   │       ├── Orders.jsx        # Order history
│   │   │       └── OrderDetail.jsx   # Order detail + timeline
│   │   ├── services/
│   │   │   ├── apiClient.js          # Axios instance with auth
│   │   │   └── api.js                # All API endpoint methods
│   │   ├── App.jsx                   # Router + all routes
│   │   ├── i18n.js                   # English/Hindi translations
│   │   ├── index.css                 # Tailwind + fonts
│   │   └── main.jsx                  # React entry point
│   ├── .env.example                  # Copy to .env
│   └── package.json
├── package.json                      # Root workspace config
└── README.md
```

---

## 📊 Database Schema (10 Tables)

| Table | Purpose |
|-------|---------|
| `users` | Phone numbers, roles (farmer/consumer) |
| `otps` | OTP codes for phone verification |
| `farmer_profiles` | Farm name, bio, location, delivery settings |
| `consumer_profiles` | Consumer name, address, location |
| `products` | Product listings with pricing and stock |
| `product_photos` | Product images |
| `categories` | Bilingual product categories |
| `orders` | Order records with payment status |
| `order_items` | Individual items in each order |
| `reviews` | Post-purchase ratings and comments |

---

## 🌐 Complete API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/request-otp` | Send OTP to phone number |
| POST | `/api/auth/verify-otp` | Verify OTP, login or register |
| GET | `/api/auth/me` | Get logged-in user info |

### Farmer
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/farmer/profile` | Get your farm profile |
| PUT | `/api/farmer/profile` | Update your farm profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List your products |
| GET | `/api/products/:id` | Get one of your products |
| POST | `/api/products` | Create a new product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |
| GET | `/api/products/categories/all` | Get all categories |

### Consumer
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/consumer/profile` | Get your consumer profile |
| PUT | `/api/consumer/profile` | Update your profile |

### Marketplace
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/marketplace` | Browse all products (with filters) |
| GET | `/api/marketplace/:id` | Get product detail + farmer info |
| GET | `/api/marketplace/farmer/:id` | Get all products from a farmer |

**Marketplace filters:** `search`, `category_id`, `is_organic`, `min_price`, `max_price`, `latitude`, `longitude`, `max_distance_km`, `sort`, `order`

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place an order |
| GET | `/api/orders/consumer` | Your orders (as consumer) |
| GET | `/api/orders/farmer` | Incoming orders (as farmer) |
| GET | `/api/orders/:id` | Order detail |
| PATCH | `/api/orders/:id/status` | Update order status (farmer) |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment signature |
| POST | `/api/payments/webhook` | Razorpay webhook (auto) |
| GET | `/api/payments/:orderId/status` | Check payment status |

---

## 🔧 Environment Variables Reference

### `backend/.env`

| Variable | Required | Where to Get | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL | `postgresql://postgres:pass@localhost:5432/farmer_marketplace` |
| `JWT_SECRET` | ✅ | Any random string | `my-secret-key-123` |
| `TWILIO_ACCOUNT_SID` | ✅ | [twilio.com/console](https://console.twilio.com) | `ACxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | ✅ | [twilio.com/console](https://console.twilio.com) | `xxxxxxxxxxxxxxxx` |
| `TWILIO_PHONE_NUMBER` | ✅ | Twilio console | `+1234567890` |
| `RAZORPAY_KEY_ID` | ✅ | [razorpay.com/dashboard](https://dashboard.razorpay.com) | `rzp_test_xxxxxxxx` |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay dashboard | `xxxxxxxxxxxxxxxx` |
| `RAZORPAY_WEBHOOK_SECRET` | ⚠️ | Razorpay Webhooks settings | `xxxxxxxxxxxxxxxx` |
| `MAPBOX_ACCESS_TOKEN` | ❌ | [mapbox.com](https://mapbox.com) | `pk.eyJ1xxxxxxx` |
| `PORT` | ✅ | Your choice | `3001` |
| `NODE_ENV` | ✅ | `development` or `production` | `development` |
| `REGION_NAME` | ✅ | Your city/area | `Jaipur` |
| `REGION_LAT` | ✅ | Google Maps | `26.9124` |
| `REGION_LNG` | ✅ | Google Maps | `75.7873` |
| `MAX_DISTANCE_KM` | ✅ | Your preference | `50` |

### `frontend/.env`

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | ✅ | Backend server URL | `http://localhost:3001` |

---

## 💳 Razorpay Setup for UPI Payments

### Getting Test Keys

1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to **Dashboard → Settings → API Keys**
3. Click **"Generate Test Keys"**
4. Copy both keys:
   - **Key ID** → `RAZORPAY_KEY_ID` in `backend/.env`
   - **Key Secret** → `RAZORPAY_KEY_SECRET` in `backend/.env`

### Testing Payments

In test mode, use these Razorpay test cards/UPI:

| Method | Details |
|--------|---------|
| **UPI** | Use `success@razorpay` for success, `failure@razorpay` for failure |
| **Card** | `4111 1111 1111 1111` (any future expiry, any CVV) |
| **Netbanking** | Select any bank in test mode |

### Going Live

1. Complete Razorpay KYC verification
2. Switch to **Live API Keys** in Razorpay dashboard
3. Update `backend/.env` with live keys
4. Set up a **Webhook URL** in Razorpay:
   - URL: `https://your-domain.com/api/payments/webhook`
   - Events: `payment.captured`, `payment.failed`

---

## 🌍 Internationalization (Hindi/English)

The farmer-facing UI is fully bilingual:

- **Toggle language** using the 🌐 button in the dashboard header
- Language preference is **saved to your profile** (persists across sessions)
- Product names/descriptions can be entered in **either language**
- Consumer-facing UI is in English (can be extended)

All 150+ translation strings are in `frontend/src/i18n.js`.

---

## 🔐 Security Features

- **Helmet.js** — Security headers on all responses
- **Rate Limiting** — 100 requests/15 min general, 3 OTP requests/min
- **JWT Authentication** — Tokens expire after 7 days
- **Role-Based Access** — Farmers and consumers see only their data
- **Parameterized Queries** — SQL injection protection
- **Razorpay Signature Verification** — HMAC-SHA256 payment verification
- **CORS** — Only frontend domain can access API

---

## 📋 Build Phases Summary

| Phase | Status | Features |
|-------|--------|----------|
| **Phase 1: Foundation** | ✅ Done | Monorepo, DB schema, OTP auth, i18n setup |
| **Phase 2: Farmer Dashboard** | ✅ Done | Profile, product CRUD, bilingual UI, language toggle |
| **Phase 3: Marketplace** | ✅ Done | Product browsing, search, filters, cart |
| **Phase 4: Orders & Checkout** | ✅ Done | Checkout, order management, status tracking, notifications |
| **Phase 5: Payments** | ✅ Done | Razorpay UPI, payment verification, webhooks |
| **Phase 6: Reviews & Polish** | 🔜 Next | Ratings, reviews, mobile optimization |

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm run dev` fails | Run `npm run install:all` again |
| Database connection error | Check `DATABASE_URL` in `backend/.env` and ensure PostgreSQL is running |
| OTP not showing | Check `NODE_ENV=development` in `backend/.env` |
| Payment modal doesn't open | Check `RAZORPAY_KEY_ID` is correct and starts with `rzp_test_` |
| Blank page | Check `VITE_API_URL` in `frontend/.env` matches backend port |
| `Module not found` errors | Delete `node_modules` in all folders, run `npm run install:all` |

---

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! This is a learning/demo project.

---

**Current Status:** Phase 5 Complete ✅
**Next:** Phase 6 - Reviews & Polish
**Last Updated:** 2026-09-06
