import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { marketplaceAPI, productsAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function Marketplace() {
  const { t } = useTranslation();
  const { addToCart, getCartCount } = useCart();
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    is_organic: '',
    min_price: '',
    max_price: '',
    sort: 'created_at',
    order: 'DESC'
  });

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const { data } = await productsAPI.getCategories();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) params[key] = filters[key];
      });

      const { data } = await marketplaceAPI.getProducts(params);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    alert(t('addedToCart'));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-green-600">🌾 {t('marketplace')}</h1>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/consumer/profile"
                className="text-gray-700 hover:text-green-600 transition"
              >
                👤 {t('profile')}
              </Link>
              <Link
                to="/cart"
                className="relative text-gray-700 hover:text-green-600 transition"
              >
                🛒 {t('cart')}
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 transition"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="space-y-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder={t('search')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Category */}
              <select
                value={filters.category_id}
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">{t('allCategories')}</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name_en}</option>
                ))}
              </select>

              {/* Organic */}
              <select
                value={filters.is_organic}
                onChange={(e) => handleFilterChange('is_organic', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">{t('allProducts')}</option>
                <option value="true">{t('organicOnly')}</option>
              </select>

              {/* Sort */}
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="created_at">{t('newest')}</option>
                <option value="price">{t('price')}</option>
                <option value="name">{t('name')}</option>
              </select>

              {/* Order */}
              <select
                value={filters.order}
                onChange={(e) => handleFilterChange('order', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="ASC">{t('ascending')}</option>
                <option value="DESC">{t('descending')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl">{t('loading')}</div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🌾</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('noProductsFound')}
            </h3>
            <p className="text-gray-600">{t('tryDifferentFilters')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
              >
                {/* Product Image */}
                <Link to={`/product/${product.id}`}>
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
                    {product.is_organic && (
                      <div className="absolute top-2 left-2 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                        {t('organic')}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-green-600">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-sm text-gray-600 mb-2">
                    🧑‍🌾 {product.farm_name}
                  </p>

                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-2xl font-bold text-green-600">
                        ₹{product.price}
                      </span>
                      <span className="text-sm text-gray-600">/{product.unit}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {product.quantity_available} {t('available')}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.quantity_available === 0}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
                  >
                    {t('addToCart')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
