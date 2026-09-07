import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout';
import { productsAPI } from '../../services/api';

export default function FarmerDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    lowStock: 0,
    recentOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await productsAPI.getAll();
      const products = data.products || [];

      setStats({
        totalProducts: products.length,
        activeProducts: products.filter(p => p.is_active).length,
        lowStock: products.filter(p => p.quantity_available < 10).length,
        recentOrders: 0 // TODO: Add order count
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: t('myProducts'), value: stats.totalProducts, icon: '🌾', color: 'green' },
    { label: t('status') + ': ' + t('placed'), value: stats.activeProducts, icon: '✅', color: 'blue' },
    { label: 'Low Stock', value: stats.lowStock, icon: '⚠️', color: 'orange' },
    { label: t('orders'), value: stats.recentOrders, icon: '📦', color: 'purple' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-xl">{t('loading')}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{t('dashboard')}</h2>
          <p className="mt-1 text-sm text-gray-600">
            {t('welcome')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow p-6 border-l-4"
              style={{ borderLeftColor: `var(--${stat.color}-500, #10b981)` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActions')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="/farmer/products/new"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
            >
              <span className="text-2xl">➕</span>
              <span className="font-medium">{t('addProduct')}</span>
            </a>
            <a
              href="/farmer/orders"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <span className="text-2xl">📦</span>
              <span className="font-medium">{t('viewOrders')}</span>
            </a>
            <a
              href="/farmer/profile"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
            >
              <span className="text-2xl">⚙️</span>
              <span className="font-medium">{t('settings')}</span>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
