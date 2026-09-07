import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { marketplaceAPI } from '../../services/api';
import { useCart } from '../../contexts/CartContext';

export default function ProductDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const { data } = await marketplaceAPI.getProductById(id);
      setProduct(data.product);
    } catch (error) {
      console.error('Failed to load product:', error);
      alert(t('productNotFound'));
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(t('addedToCart'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">{t('loading')}</div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const photos = product.photos && product.photos.length > 0 ? product.photos : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/marketplace" className="text-green-600 hover:text-green-700">
              ← {t('backToMarketplace')}
            </Link>
            <Link to="/cart" className="text-green-600 hover:text-green-700">
              🛒 {t('cart')}
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
              <div className="h-96 bg-gray-200">
                {photos.length > 0 ? (
                  <img
                    src={photos[selectedPhoto].photo_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-9xl">
                    🌾
                  </div>
                )}
              </div>
            </div>

            {/* Photo Thumbnails */}
            {photos.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhoto(index)}
                    className={`h-20 bg-gray-200 rounded overflow-hidden border-2 ${
                      selectedPhoto === index ? 'border-green-600' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={photo.photo_url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              {/* Title and Category */}
              <div className="mb-4">
                {product.is_organic && (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full mb-2">
                    ✓ {t('organic')}
                  </span>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <p className="text-gray-600">{product.category_name_en}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-green-600">
                  ₹{product.price}
                </span>
                <span className="text-xl text-gray-600"> / {product.unit}</span>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{t('description')}</h3>
                  <p className="text-gray-700">{product.description}</p>
                </div>
              )}

              {/* Availability */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="font-semibold">{t('availability')}:</span>
                  <span className={product.quantity_available > 10 ? 'text-green-600' : 'text-orange-600'}>
                    {product.quantity_available} {t('available')}
                  </span>
                </div>
                {product.harvest_date && (
                  <div className="flex items-center gap-2 text-gray-700 mt-2">
                    <span className="font-semibold">{t('harvestDate')}:</span>
                    <span>{new Date(product.harvest_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block font-semibold text-gray-900 mb-2">
                  {t('quantity')}
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-6 py-2 border-x">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.quantity_available, quantity + 1))}
                      className="px-4 py-2 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-gray-600">
                    {t('max')}: {product.quantity_available}
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.quantity_available === 0}
                className="w-full px-6 py-4 bg-green-600 text-white text-lg rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {t('addToCart')}
              </button>
            </div>

            {/* Farmer Info */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">🧑‍🌾 {t('aboutFarmer')}</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">{t('farmName')}:</span>{' '}
                  {product.farm_name}
                </div>
                <div>
                  <span className="font-semibold">{t('farmerName')}:</span>{' '}
                  {product.farmer_name}
                </div>
                {product.farmer_city && (
                  <div>
                    <span className="font-semibold">{t('location')}:</span>{' '}
                    {product.farmer_city}, {product.farmer_state}
                  </div>
                )}
                {product.farmer_bio && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-gray-700">{product.farmer_bio}</p>
                  </div>
                )}
                {product.avg_rating > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold">{product.avg_rating.toFixed(1)}</span>
                      <span className="text-gray-600">({product.review_count} {t('reviews')})</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
