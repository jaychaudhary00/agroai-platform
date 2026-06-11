import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store';

export function HomeGrowerDashboard() {
  const { t } = useTranslation();
  const { user } = useSelector((s: RootState) => s.auth);
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('dashboard.greeting') : hour < 17 ? t('dashboard.greetingAfternoon') : t('dashboard.greetingEvening');

  useEffect(() => {
    fetch(`${API}/reminders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setReminders(d.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pending = reminders.filter((r: any) => !r.isCompleted);
  const overdue = pending.filter((r: any) => new Date(r.dueDate) < new Date());
  const upcoming = pending.filter((r: any) => new Date(r.dueDate) >= new Date()).slice(0, 5);

  const typeIcon: Record<string, string> = { watering: '💧', fertilizing: '🌿', harvesting: '🌽', pesticide: '🌱', other: '📝' };

  const statCards = [
    { label: t('dashboard.plantReminders'), value: pending.length.toString(), icon: '🌱', color: 'bg-green-50 dark:bg-green-900/20' },
    { label: t('dashboard.wateringDue'), value: pending.filter((r: any) => r.type === 'watering').length.toString(), icon: '💧', color: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: t('dashboard.fertilizerDue'), value: pending.filter((r: any) => r.type === 'fertilizing').length.toString(), icon: '🌿', color: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Overdue', value: overdue.length.toString(), icon: '⚠️', color: 'bg-red-50 dark:bg-red-900/20' },
  ];

  const quickActions = [
    { label: t('dashboard.scanDisease'), path: '/disease-scanner', icon: '🔬', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' },
    { label: t('nav.plantCare'), path: '/home-grower', icon: '🌱', color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' },
    { label: t('nav.aiChat'), path: '/ai-chat', icon: '🤖', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' },
    { label: t('nav.marketplace'), path: '/marketplace', icon: '🛒', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{greeting}, {user?.name?.split(' ')[0]} 🌱</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('homegrower.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center text-lg mb-3`}>{icon}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map(({ label, path, icon, color }) => (
          <Link key={path} to={path} className={`${color} rounded-2xl p-4 flex flex-col gap-2 hover:scale-105 transition-transform`}>
            <span className="text-2xl">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">{t('dashboard.nextReminder')}</h2>
            <Link to="/home-grower" className="text-xs text-green-600 hover:underline">{t('common.viewAll')}</Link>
          </div>
          {loading ? <div className="text-center py-8 text-gray-400 text-sm animate-pulse">{t('common.loading')}</div>
          : upcoming.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm text-gray-400">All reminders up to date!</p>
              <Link to="/home-grower" className="mt-2 text-green-600 text-sm hover:underline block">+ Add reminder</Link>
            </div>
          ) : upcoming.map((r: any) => (
            <div key={r._id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
              <div className="w-9 h-9 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-lg">{typeIcon[r.type] || '📝'}</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{r.title}</div>
                <div className="text-xs text-gray-400">{new Date(r.dueDate).toLocaleDateString()}</div>
              </div>
              {new Date(r.dueDate) < new Date() && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Overdue</span>}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.weatherCare') || 'Plant Care Tips'}</h2>
          <div className="space-y-3">
            {[
              { icon: '☀️', tip: 'Most plants need 6-8 hours of sunlight daily', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
              { icon: '💧', tip: 'Water in the morning to reduce evaporation', color: 'bg-blue-50 dark:bg-blue-900/20' },
              { icon: '🌿', tip: 'Use organic compost to improve soil health', color: 'bg-green-50 dark:bg-green-900/20' },
              { icon: '🔬', tip: 'Scan leaves regularly for early disease detection', color: 'bg-purple-50 dark:bg-purple-900/20' },
            ].map(({ icon, tip, color }) => (
              <div key={tip} className={`${color} rounded-xl p-3 flex items-start gap-3`}>
                <span className="text-xl">{icon}</span>
                <p className="text-sm text-gray-700 dark:text-gray-300">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
