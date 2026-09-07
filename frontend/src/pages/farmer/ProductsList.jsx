import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { productsAPI } from '../../services/api';

export default function ProductsList() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, inactive

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await productsAPI.getAll();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      await productsAPI.delete(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert(t('error'));
    }
  };

  const filteredProducts = products.filter(p => {
    if (filter === 'active') return p.is_active;
    if (filter === 'inactive') return !p.is_active;
    return true;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">{t('loading')}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{t('myProducts')}</h2>
            <p className="mt-1 text-sm text-gray-600">
              {filteredProducts.length} {t('products')}
            </p>
          </div>
          <Link
            to="/farmer/products/new"
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            ➕ {t('addProduct')}
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'active', 'inactive'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? t('all') : f === 'active' ? t('placed') : t('inactive')}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🌾</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('noProducts')}
            </h3>
            <p className="text-gray-600 mb-6">{t('addFirstProduct')}</p>
            <Link
              to="/farmer/products/new"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              {t('addProduct')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden"
              >
                {/* Product Image */}
                <div className="h-48 bg-gray-200 relative">
                  {product.photos && product.photos.length > 0 ? (
                    <img
                      src={product.photos[0].photo_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-6xl">
                      🌾
                    </div>
                  )}
                  {!product.is_active && (
                    <div className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                      {t('inactive')}
                    </div>
                  )}
                  {product.is_organic && (
                    <div className="absolute top-2 left-2 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      {t('organic')}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-2xl font-bold text-green-600">
                        ₹{product.price}
                      </span>
                      <span className="text-sm text-gray-600">
                        /{i18n.language === 'hi' ? t(product.unit) : product.unit}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {t('stock')}: <span className={product.quantity_available < 10 ? 'text-red-600 font-semibold' : 'font-semibold'}>{product.quantity_available}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/farmer/products/edit/${product.id}`}
                      className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition text-center"
                    >
                      {t('edit')}
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
