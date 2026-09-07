#!/bin/bash

echo "🌾 Farmer Marketplace - Phase 1 Setup"
echo "======================================"
echo ""

# Check if PostgreSQL is running
echo "1. Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    echo "   ✓ PostgreSQL CLI found"
else
    echo "   ✗ PostgreSQL not found. Please install PostgreSQL first."
    exit 1
fi

# Check if database exists
echo ""
echo "2. Checking database..."
if psql -lqt | cut -d \| -f 1 | grep -qw farmer_marketplace; then
    echo "   ✓ Database 'farmer_marketplace' exists"
else
    echo "   ⚠ Database 'farmer_marketplace' not found"
    echo "   Creating database..."
    createdb farmer_marketplace
    if [ $? -eq 0 ]; then
        echo "   ✓ Database created successfully"
    else
        echo "   ✗ Failed to create database"
        echo "   Please run: createdb farmer_marketplace"
        exit 1
    fi
fi

# Run migrations
echo ""
echo "3. Running database migrations..."
cd backend
npm run migrate
if [ $? -eq 0 ]; then
    echo "   ✓ Migrations completed"
else
    echo "   ✗ Migration failed"
    exit 1
fi

cd ..

echo ""
echo "======================================"
echo "✅ Phase 1 setup complete!"
echo ""
echo "To start the development servers:"
echo "  npm run dev"
echo ""
echo "Or start individually:"
echo "  Backend:  cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:3001"
echo ""
echo "💡 In development mode, OTP codes are logged to the backend console"
echo "   (no SMS sent, saving Twilio credits)"
