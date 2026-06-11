import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { RootState, AppDispatch, fetchExpenses, fetchAnalytics, fetchCropPrices } from '../../store';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function FarmerDashboard() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((s: RootState) => s.auth);
  const { items: expenses, analytics } = useSelector((s: RootState) => s.expenses);
  const { items: cropPrices } = useSelector((s: RootState) => s.cropPrices);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('dashboard.greeting') : hour < 17 ? t('dashboard.greetingAfternoon') : t('dashboard.greetingEvening');

  useEffect(() => {
    dispatch(fetchExpenses({}));
    dispatch(fetchAnalytics(undefined));
    dispatch(fetchCropPrices({ limit: 6 }));
  }, [dispatch]);

  const totalExpenses = expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);
  const estimatedIncome = totalExpenses > 0 ? totalExpenses * 1.62 : 0;
  const profitMargin = totalExpenses > 0 ? Math.round(((estimatedIncome - totalExpenses) / estimatedIncome) * 100) : 0;
  const monthlyData = analytics?.byMonth?.map((m: any) => ({
    month: MONTHS[m._id - 1],
    expenses: m.total,
    income: Math.round(m.total * 1.6),
  })) || [];

  const statCards = [
    { label: t('expenses.totalExpenses'), value: totalExpenses > 0 ? `₹${(totalExpenses/1000).toFixed(1)}k` : '₹0', icon: '🧾', color: 'bg-red-50 dark:bg-red-900/20', sub: `${expenses.length} entries` },
    { label: t('dashboard.revenue'), value: estimatedIncome > 0 ? `₹${(estimatedIncome/1000).toFixed(1)}k` : '₹0', icon: '💰', color: 'bg-green-50 dark:bg-green-900/20', sub: `${profitMargin}% margin` },
    { label: 'Expense Categories', value: analytics?.byCategory?.length?.toString() || '0', icon: '📊', color: 'bg-blue-50 dark:bg-blue-900/20', sub: 'This season' },
    { label: t('mandi.title'), value: cropPrices.length > 0 ? `${cropPrices.length}+` : '—', icon: '📈', color: 'bg-amber-50 dark:bg-amber-900/20', sub: 'Live APMC' },
  ];

  const quickActions = [
    { label: t('dashboard.scanDisease'), path: '/disease-scanner', icon: '🔬', color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' },
    { label: t('dashboard.checkMandi'), path: '/mandi-prices', icon: '📈', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' },
    { label: t('dashboard.trackExpense'), path: '/expenses', icon: '🧾', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' },
    { label: t('nav.marketplace'), path: '/marketplace', icon: '🛒', color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {user?.location?.state ? `${user.location.district || ''}, ${user.location.state}` : t('dashboard.overview')}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon, color, sub }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center text-lg mb-3`}>{icon}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('dashboard.quickActions')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ label, path, icon, color }) => (
            <Link key={path} to={path} className={`${color} rounded-2xl p-4 flex flex-col gap-2 hover:scale-105 transition-transform`}>
              <span className="text-2xl">{icon}</span>
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">{t('dashboard.monthlyPL')}</h2>
          <p className="text-xs text-gray-400 mb-4">Your income vs expenses</p>
          {monthlyData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyData} barCategoryGap="30%">
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={50} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                  <Bar dataKey="income" fill="#16a34a" radius={[4,4,0,0]} name={t('dashboard.income')} />
                  <Bar dataKey="expenses" fill="#f97316" radius={[4,4,0,0]} name={t('dashboard.expensesLabel')} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                {[{c:'#16a34a',l:t('dashboard.income')},{c:'#f97316',l:t('dashboard.expensesLabel')}].map(({c,l}) => (
                  <span key={l} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-3 h-3 rounded-sm" style={{background:c}} />{l}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <div className="text-4xl mb-2 opacity-30">📊</div>
              <p className="text-sm text-gray-400">{t('dashboard.noData')}</p>
              <Link to="/expenses" className="mt-2 text-green-600 text-sm hover:underline">+ Add expense</Link>
            </div>
          )}
        </div>

        {/* Mandi prices */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">{t('dashboard.cropPrices')}</h2>
            <Link to="/mandi-prices" className="text-xs text-green-600 hover:underline">{t('common.viewAll')}</Link>
          </div>
          {cropPrices.slice(0, 5).map((cp: any, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{cp.commodity}</div>
                <div className="text-xs text-gray-400">{cp.market}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-green-600">₹{cp.modalPrice}</div>
                <div className="text-xs text-gray-400">/qtl</div>
              </div>
            </div>
          ))}
          {cropPrices.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">{t('mandi.loading')}</div>}
        </div>
      </div>
    </div>
  );
}
