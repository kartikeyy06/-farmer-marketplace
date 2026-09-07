import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ordersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function ConsumerOrders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, placed, confirmed, ready, completed, cancelled

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await ordersAPI.getConsumerOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
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
      placed: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      ready: 'bg-purple-100 text-purple-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-green-600">📦 {t('myOrders')}</h1>

            <div className="flex items-center gap-4">
              <Link to="/marketplace" className="text-gray-700 hover:text-green-600">
                🌾 {t('marketplace')}
              </Link>
              <Link to="/cart" className="text-gray-700 hover:text-green-600">
                🛒 {t('cart')}
              </Link>
              <Link to="/consumer/profile" className="text-gray-700 hover:text-green-600">
                👤 {t('profile')}
              </Link>
              <button onClick={handleLogout} className="text-gray-700 hover:text-red-600">
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {['all', 'placed', 'confirmed', 'ready', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                filter === status
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? t('all') : t(status)}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? t('noOrders') : t('noOrdersStatus')}
            </h3>
            <p className="text-gray-600 mb-6">{t('startShopping')}</p>
            <Link
              to="/marketplace"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              {t('browseProducts')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/consumer/orders/${order.id}`)}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-6 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {t('orderNumber')}: {order.order_number}
                    </h3>
                    <p className="text-sm text-gray-600">
                      🧑‍🌾 {order.farm_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()} • {order.fulfillment_type === 'delivery' ? '🚚' : '🏪'} {t(order.fulfillment_type)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {t(order.status)}
                  </span>
                </div>

                {/* Order Items */}
                <div className="border-t pt-4 mb-4">
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.product_name} × {item.quantity}
                        </span>
                        <span className="font-semibold">₹{item.total_price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    {t('subtotal')}: ₹{order.subtotal} + {t('platformFee')}: ₹{order.platform_fee}
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    ₹{order.total}
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{t('notes')}:</span> {order.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
