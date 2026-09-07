import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ordersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_STEPS = ['placed', 'confirmed', 'ready', 'completed'];

export default function OrderDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const { data } = await ordersAPI.getOrderById(id);
      setOrder(data.order);
    } catch (err) {
      console.error('Failed to load order:', err);
      setError(err.response?.data?.error || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    const colors = {
      placed: 'bg-blue-100 text-blue-800 border-blue-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      ready: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTimelineColor = (status) => {
    const colors = {
      placed: 'bg-blue-500',
      confirmed: 'bg-green-500',
      ready: 'bg-purple-500',
      completed: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>{t('loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/consumer/orders')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            {t('back')}
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const currentStepIndex = order.status === 'cancelled'
    ? -1
    : STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/consumer/orders"
                className="text-gray-600 hover:text-green-600"
              >
                ← {t('back')}
              </Link>
              <h1 className="text-2xl font-bold text-green-600">
                {t('orderNumber')}{order.order_number}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/marketplace" className="text-gray-700 hover:text-green-600">
                🌾 {t('marketplace')}
              </Link>
              <Link to="/cart" className="text-gray-700 hover:text-green-600">
                🛒 {t('cart')}
              </Link>
              <button onClick={handleLogout} className="text-gray-700 hover:text-red-600">
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Badge */}
        <div className="flex items-center gap-3 mb-6">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
            {t(order.status)}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleString()}
          </span>
          {order.payment_status && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              order.payment_status === 'captured'
                ? 'bg-green-100 text-green-700'
                : order.payment_status === 'failed'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              💳 {t(order.payment_status)}
            </span>
          )}
        </div>

        {/* Status Timeline */}
        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">{t('orderTimeline')}</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                  <div key={step} className="relative flex items-center mb-6 last:mb-0">
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? `${getTimelineColor(step)} text-white`
                          : 'bg-gray-200 text-gray-500'
                      } ${isCurrent ? 'ring-4 ring-opacity-30 ring-offset-2' : ''}`}
                      style={isCurrent ? { '--tw-ring-color': step === 'placed' ? '#3b82f6' : step === 'confirmed' ? '#22c55e' : step === 'ready' ? '#a855f7' : '#6b7280', backgroundColor: isCurrent ? undefined : undefined } : {}}
                    >
                      {isCompleted && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-4">
                      <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {t(step)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancelled Notice */}
        {order.status === 'cancelled' && order.cancelled_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">✗ {t('cancelled')}</p>
            <p className="text-red-600 text-sm mt-1">{order.cancelled_reason}</p>
          </div>
        )}

        {/* Farmer Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{t('farmerName')}</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
              🧑‍🌾
            </div>
            <div>
              <p className="font-medium text-gray-900">{order.farm_name || 'Farmer'}</p>
              <p className="text-sm text-gray-600">{t(order.fulfillment_type)}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{t('cartItems')}</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{item.product_name}</p>
                  <p className="text-sm text-gray-600">
                    ₹{item.unit_price} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">₹{item.total_price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{t('orderSummary')}</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('subtotal')}</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('platformFee')}</span>
              <span>₹{order.platform_fee}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>{t('total')}</span>
              <span className="text-green-600">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">{t('notes')}</h3>
            <p className="text-gray-700">{order.notes}</p>
          </div>
        )}

        {/* Delivery/Pickup Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {order.fulfillment_type === 'delivery' ? '🚚 ' + t('delivery') : '🏪 ' + t('pickup')}
          </h3>
          <p className="text-gray-700">
            {order.fulfillment_type === 'delivery'
              ? t('deliveryDescription')
              : t('pickupDescription')
            }
          </p>
          <p className="text-sm text-gray-500 mt-2">{t('paymentNote')}</p>
        </div>

        {/* Back to Orders */}
        <div className="text-center">
          <Link
            to="/consumer/orders"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            {t('myOrders')}
          </Link>
        </div>
      </div>
    </div>
  );
}
