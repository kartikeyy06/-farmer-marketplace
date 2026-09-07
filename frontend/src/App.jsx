import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import FarmerDashboard from './pages/farmer/Dashboard';
import FarmerProfile from './pages/farmer/Profile';
import ProductsList from './pages/farmer/ProductsList';
import ProductForm from './pages/farmer/ProductForm';
import FarmerOrders from './pages/farmer/Orders';
import Marketplace from './pages/consumer/Marketplace';
import ProductDetail from './pages/consumer/ProductDetail';
import Cart from './pages/consumer/Cart';
import Checkout from './pages/consumer/Checkout';
import ConsumerOrders from './pages/consumer/Orders';
import ConsumerOrderDetail from './pages/consumer/OrderDetail';
import './i18n';
import './index.css';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🌾 Farmer Marketplace</h1>
        <p className="text-gray-600 mb-6">Connecting farmers directly with consumers</p>
        <a
          href="/login"
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* Farmer Routes */}
            <Route
              path="/farmer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/profile"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <FarmerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/products"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <ProductsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/products/new"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/products/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/orders"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <FarmerOrders />
                </ProtectedRoute>
              }
            />

            {/* Consumer Routes */}
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute allowedRoles={['consumer']}>
                  <Marketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product/:id"
              element={
                <ProtectedRoute allowedRoles={['consumer']}>
                  <ProductDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute allowedRoles={['consumer']}>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={['consumer']}>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consumer/orders"
              element={
                <ProtectedRoute allowedRoles={['consumer']}>
                  <ConsumerOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consumer/orders/:id"
              element={
                <ProtectedRoute allowedRoles={['consumer']}>
                  <ConsumerOrderDetail />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
