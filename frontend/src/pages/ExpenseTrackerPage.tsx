import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch, fetchExpenses, fetchAnalytics, addExpenseLocal, removeExpenseLocal } from '../store';
import { expenseAPI } from '../services/api';

const CATEGORIES = ['tilling','ploughing','seeds','fertilizers','watering','labour','harvesting','pesticides','machinery','other'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CAT_ICONS: Record<string,string> = { tilling:'🚜',ploughing:'🌾',seeds:'🌱',fertilizers:'🧪',watering:'💧',labour:'👷',harvesting:'🌽',pesticides:'🌿',machinery:'⚙️',other:'📝' };
const CAT_COLORS = ['#16a34a','#0ea5e9','#f59e0b','#8b5cf6','#ef4444','#6b7280','#10b981','#f97316','#ec4899','#84cc16'];

export function ExpenseTrackerPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { items: expenses, analytics, loading } = useSelector((s: RootState) => s.expenses);
  const [form, setForm] = useState({ category: 'seeds', amount: '', description: '', date: new Date().toISOString().split('T')[0], cropType: '', season: '' });
  const [adding, setAdding] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchExpenses({}));
    dispatch(fetchAnalytics(undefined));
  }, [dispatch]);

  const totalExpenses = expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);
  const estimatedIncome = totalExpenses * 1.62;
  const profit = estimatedIncome - totalExpenses;

  // Monthly bar chart data — LIVE from expenses
  const monthlyData = (() => {
    const byMonth: Record<number, number> = {};
    expenses.forEach((e: any) => {
      const m = new Date(e.date).getMonth();
      byMonth[m] = (byMonth[m] || 0) + e.amount;
    });
    return Object.entries(byMonth).sort(([a],[b]) => Number(a)-Number(b)).map(([m, total]) => ({
      month: MONTHS[Number(m)], amount: total,
    }));
  })();

  // Also use analytics for category breakdown
  const byCategory = analytics?.byCategory?.map((c: any, i: number) => ({
    name: c._id, value: c.total, color: CAT_COLORS[i % CAT_COLORS.length],
  })) || [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) { toast.error(t('validation.positiveNumber')); return; }
    setAdding(true);
    try {
      const res = await expenseAPI.add({ ...form, amount: Number(form.amount) });
      dispatch(addExpenseLocal(res.data.data));
      setForm({ category: 'seeds', amount: '', description: '', date: new Date().toISOString().split('T')[0], cropType: '', season: '' });
      toast.success(t('common.success'));
      dispatch(fetchAnalytics(undefined));
      setShowForm(false);
    } catch { toast.error(t('common.error')); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('expenses.deleteConfirm'))) return;
    try {
      await expenseAPI.delete(id);
      dispatch(removeExpenseLocal(id));
      toast.success(t('common.success'));
      dispatch(fetchAnalytics(undefined));
    } catch { toast.error(t('common.error')); }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const res = await expenseAPI.exportPDF();
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = `agroai-expenses-${Date.now()}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF exported!');
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('expenses.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('expenses.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportPDF} disabled={exporting}
            className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm px-3 py-2 rounded-xl hover:shadow-sm transition-all dark:text-white">
            {exporting ? '⏳' : '📄'} {t('expenses.exportPDF')}
          </button>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            + {t('expenses.addExpense')}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: t('expenses.totalExpenses'), value: `₹${totalExpenses.toLocaleString()}`, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', icon: '🧾' },
          { label: t('expenses.estimatedIncome'), value: `₹${Math.round(estimatedIncome).toLocaleString()}`, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', icon: '💰' },
          { label: t('expenses.profit'), value: `₹${Math.round(profit).toLocaleString()}`, color: profit >= 0 ? 'text-green-600' : 'text-red-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: '📊' },
          { label: t('expenses.profitMargin'), value: `${totalExpenses > 0 ? Math.round((profit/estimatedIncome)*100) : 0}%`, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: '📈' },
        ].map(({ label, value, color, bg, icon }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center text-lg mb-3`}>{icon}</div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Add Expense Form (collapsible) */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t('expenses.addExpense')}</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('expenses.category')}</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {t(`expenses.categories.${c}`)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('expenses.amount')} (₹)</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} min="0"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('expenses.date')}</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('expenses.description')}</label>
              <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('expenses.cropType')}</label>
              <input type="text" value={form.cropType} onChange={e => setForm(f => ({ ...f, cropType: e.target.value }))} placeholder="e.g. Wheat"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={adding}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium disabled:opacity-60">
                {adding ? t('common.loading') : t('common.add')}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-600 dark:text-gray-400">
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly bar chart - LIVE updates immediately */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">{t('expenses.monthlyChart')}</h2>
          <p className="text-xs text-gray-400 mb-4">Updates live as you add expenses</p>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={55} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, t('expenses.totalExpenses')]} />
                <Bar dataKey="amount" fill="#16a34a" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <div className="text-4xl mb-2 opacity-30">📊</div>
              <p className="text-sm text-gray-400">{t('expenses.noExpenses')}</p>
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t('expenses.byCategory')}</h2>
          {byCategory.length > 0 ? (
            <div className="space-y-2">
              {byCategory.map((c: any) => (
                <div key={c.name} className="flex items-center gap-2">
                  <span className="text-base">{CAT_ICONS[c.name] || '📝'}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">{t(`expenses.categories.${c.name}`)}</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{c.value.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(c.value / totalExpenses * 100).toFixed(0)}%`, background: c.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="text-center py-8 text-gray-400 text-sm">{t('common.noData')}</div>}
        </div>
      </div>

      {/* Expense list */}
      <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">{t('expenses.expenseList')}</h2>
        </div>
        {loading ? <div className="p-8 text-center text-gray-400 animate-pulse">{t('common.loading')}</div>
        : expenses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3 opacity-30">🧾</div>
            <p className="text-sm text-gray-400">{t('expenses.noExpenses')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {expenses.map((e: any) => (
              <div key={e._id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                <div className="w-9 h-9 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                  {CAT_ICONS[e.category] || '📝'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {t(`expenses.categories.${e.category}`)}
                    {e.cropType && <span className="text-xs text-gray-400 ml-2">({e.cropType})</span>}
                  </div>
                  {e.description && <div className="text-xs text-gray-400 truncate">{e.description}</div>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-red-600">₹{e.amount.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">{new Date(e.date).toLocaleDateString()}</div>
                </div>
                <button onClick={() => handleDelete(e._id)} className="ml-2 text-gray-300 hover:text-red-500 transition-colors text-lg flex-shrink-0">🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
