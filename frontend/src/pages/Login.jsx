import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState('phone'); // phone, otp, register
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.requestOTP(phoneNumber);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.verifyOTP(phoneNumber, otp, role, name);

      if (response.data.isNewUser && !role) {
        setStep('register');
        setLoading(false);
        return;
      }

      login(response.data.token, response.data.user);

      // Redirect based on role
      if (response.data.user.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/marketplace');
      }
    } catch (err) {
      if (err.response?.data?.requiresRegistration) {
        setStep('register');
      } else {
        setError(err.response?.data?.error || 'Failed to verify OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!role || !name) {
      setError('Please select role and enter your name');
      return;
    }

    handleVerifyOTP(e);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          🌾 {t('welcome')}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {step === 'phone' && (
          <form onSubmit={handleRequestOTP} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('phoneNumber')}
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {loading ? t('loading') : t('sendOTP')}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4 mt-6">
            <p className="text-sm text-gray-600 text-center">
              {t('enterOTP')}
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('otpCode')}
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl tracking-widest"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {loading ? t('loading') : t('verifyOTP')}
            </button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
            >
              {t('back')}
            </button>
          </form>
        )}

        {step === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('yourName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('yourName')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('selectRole')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('farmer')}
                  className={`py-4 px-4 rounded-lg border-2 font-semibold transition ${
                    role === 'farmer'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  🧑‍🌾<br/>{t('farmer')}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('consumer')}
                  className={`py-4 px-4 rounded-lg border-2 font-semibold transition ${
                    role === 'consumer'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  🛒<br/>{t('consumer')}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !role || !name}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {loading ? t('loading') : t('register')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
