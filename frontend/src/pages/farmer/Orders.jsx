import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout';

export default function FarmerOrders() {
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{t('orders')}</h2>
          <p className="mt-1 text-sm text-gray-600">
            {t('manageIncomingOrders')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('comingSoon')}
          </h3>
          <p className="text-gray-600">
            {t('orderManagementPhase4')}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
