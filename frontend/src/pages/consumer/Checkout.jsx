import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../contexts/CartContext';
import { consumerAPI, ordersAPI } from '../../services/api';

export default function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, clearCart, getCartTotal, getPlatformFee, getGrandTotal } = useCart();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fulfillment_type: 'delivery',
    notes: ''
  });

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await consumerAPI.getProfile();
      setProfile(data.profile);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    setLoading(true);

    try {
      const orderItems = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      const { data } = await ordersAPI.create({
        items: orderItems,
        fulfillment_type: formData.fulfillment_type,
        notes: formData.notes
      });

      clearCart();
      alert(t('orderPlacedSuccess'));
      navigate('/consumer/orders');
    } catch (error) {
      console.error('Failed to place order:', error);
      alert(error.response?.data?.error || t('orderPlaceFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-green-600">💳 {t('checkout')}</h1>
            <Link to="/cart" className="text-green-600 hover:text-green-700">
              ← {t('back')}
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">{t('deliveryInformation')}</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('yourName')}
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                {profile.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('address')}
                    </label>
                    <textarea
                      value={`${profile.address}\n${profile.city}, ${profile.state} ${profile.postal_code}`}
                      disabled
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                )}

                {!profile.address && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ {t('noAddressWarning')}
                    </p>
                    <Link
                      to="/consumer/profile"
                      className="text-sm text-yellow-900 underline hover:text-yellow-700"
                    >
                      {t('addAddressNow')}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Fulfillment Type */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">{t('fulfillmentType')}</h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, fulfillment_type: 'delivery' }))}
                  className={`p-4 border-2 rounded-lg font-semibold transition ${
                    formData.fulfillment_type === 'delivery'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  🚚 {t('delivery')}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, fulfillment_type: 'pickup' }))}
                  className={`p-4 border-2 rounded-lg font-semibold transition ${
                    formData.fulfillment_type === 'pickup'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  🏪 {t('pickup')}
                </button>
              </div>

              <p className="mt-3 text-sm text-gray-600">
                {formData.fulfillment_type === 'delivery'
                  ? t('deliveryDescription')
                  : t('pickupDescription')}
              </p>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">{t('orderNotes')}</h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder={t('orderNotesPlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">{t('orderSummary')}</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-600">
                        {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <p className="font-semibold">₹{(item.quantity * item.price).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>{t('subtotal')}</span>
                  <span>₹{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>{t('platformFee')} (10%)</span>
                  <span>₹{getPlatformFee().toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>{t('total')}</span>
                    <span className="text-green-600">₹{getGrandTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !profile.address}
                className="w-full mt-6 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {loading ? t('loading') : t('placeOrder')}
              </button>

              <p className="mt-4 text-xs text-center text-gray-600">
                {t('paymentNote')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
