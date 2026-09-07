import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import './i18n';
import './index.css';

// Placeholder components
function FarmerDashboard() {
  return <div className="p-8">Farmer Dashboard (Coming in Phase 2)</div>;
}

function ConsumerMarketplace() {
  return <div className="p-8">Consumer Marketplace (Coming in Phase 3)</div>;
}

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/marketplace"
            element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <ConsumerMarketplace />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
