import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export function SellerStatusPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/sellers/me`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setSeller(data.data);
      } catch { toast.error('Failed to load status'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400 animate-pulse">{t('common.loading')}</div>
    </div>
  );

  if (!seller) return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="text-5xl mb-4">🏪</div>
      <p className="text-gray-500 mb-6">No seller application found</p>
      <Link to="/seller/register" className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700">Register as Seller</Link>
    </div>
  );

  const { approvalStatus, businessName, rejectionReason, createdAt } = seller;

  if (approvalStatus === 'approved') {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center shadow-sm">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-4xl mx-auto mb-5">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('seller.approvedTitle')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2">{businessName}</p>
          <p className="text-sm text-gray-400 mb-6">{t('seller.approvedMsg')}</p>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">You can now:</p>
            <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
              <li>✓ Upload and manage products</li>
              <li>✓ Receive customer orders</li>
              <li>✓ View revenue analytics</li>
              <li>✓ Manage stock levels</li>
            </ul>
          </div>
          <button onClick={() => navigate('/dashboard')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl">
            {t('seller.goToDashboard')} →
          </button>
        </div>
      </div>
    );
  }

  if (approvalStatus === 'rejected') {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center shadow-sm">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-4xl mx-auto mb-5">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('seller.rejectedTitle')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t('seller.rejectedMsg')}</p>
          {rejectionReason && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">{t('seller.rejectionReason')}</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{rejectionReason}</p>
            </div>
          )}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Next Steps:</p>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Review the reason above</li>
              <li>• Update your business details</li>
              <li>• Contact support if needed</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <a href={`mailto:${t('seller.supportEmail')}`}
              className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 py-3 rounded-xl text-sm hover:bg-gray-50 text-center">
              📧 {t('seller.contactSupport')}
            </a>
            <Link to="/seller/register" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-medium text-center">
              {t('seller.reapply')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Pending
  const appliedDays = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000*60*60*24));

  return (
    <div className="max-w-lg mx-auto mt-12">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center shadow-sm">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-4xl mx-auto mb-5 relative">
          ⏳
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('seller.pendingTitle')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-1">{businessName}</p>
        <p className="text-sm text-gray-400 mb-6">{t('seller.pendingMsg')}</p>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-4 mb-6 text-left space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{t('seller.estimatedTime')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl">📅</span>
            <div>
              <p className="text-sm text-amber-700 dark:text-amber-400">Applied {appliedDays === 0 ? 'today' : `${appliedDays} day${appliedDays > 1 ? 's' : ''} ago`}</p>
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-6">
          {['Submitted','Under Review','Decision'].map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-green-500 text-white' : i === 1 ? 'bg-amber-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}>
                  {i === 0 ? '✓' : i + 1}
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">{step}</p>
              </div>
              {i < 2 && <div className={`h-0.5 w-6 ${i === 0 ? 'bg-green-300' : 'bg-gray-200 dark:bg-gray-700'}`} />}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <a href={`mailto:${t('seller.supportEmail')}`}
            className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 py-3 rounded-xl text-sm hover:bg-gray-50 text-center">
            📧 {t('seller.contactSupport')}
          </a>
          <Link to="/dashboard" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-medium text-center">
            {t('seller.goToDashboard')}
          </Link>
        </div>
      </div>
    </div>
  );
}
