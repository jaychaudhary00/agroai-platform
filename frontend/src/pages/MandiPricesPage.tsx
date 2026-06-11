import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const STATES = [
  'All States','Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana',
  'Uttar Pradesh','Uttarakhand','West Bengal',
];

const PER_PAGE = 50;

export function MandiPricesPage() {
  const { t } = useTranslation();
  const API = import.meta.env.VITE_API_URL;

  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [source, setSource] = useState<'live'|'fallback'|null>(null);
  const [lastFetched, setLastFetched] = useState<string|null>(null);
  const [search, setSearch] = useState('');
  const [state, setState] = useState('All States');
  const [page, setPage] = useState(1);
  const [availableCrops, setAvailableCrops] = useState<string[]>([]);

  const fetchPrices = async (force = false) => {
    force ? setRefreshing(true) : setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '500' });
      if (state !== 'All States') params.set('state', state);
      if (search.trim()) params.set('commodity', search.trim());
      if (force) params.set('forceRefresh', 'true');

      const res = await fetch(`${API}/crop-prices?${params}`);
      const data = await res.json();

      if (data.success) {
        setPrices(data.data || []);
        setSource(data.source);
        setLastFetched(data.lastFetched);
      }
    } catch {
      console.error('Failed to fetch mandi prices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const res = await fetch(`${API}/crop-prices/meta/crops`);
      const data = await res.json();
      if (data.success) setAvailableCrops(data.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchPrices();
    fetchMeta();
  }, [state]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchPrices(); }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { setPage(1); }, [state, search]);

  const filtered = prices.filter(p =>
    !search || p.commodity?.toLowerCase().includes(search.toLowerCase()) ||
    p.market?.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice(0, page * PER_PAGE);
  const hasMore = paginated.length < filtered.length;

  const lastUpdated = lastFetched
    ? new Date(lastFetched).toLocaleString()
    : prices.length > 0
      ? new Date(prices[0]?.date).toLocaleDateString()
      : null;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('mandi.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('mandi.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Source badge */}
          {source === 'live' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">LIVE — data.gov.in</span>
            </div>
          ) : source === 'fallback' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Offline — Sample data</span>
            </div>
          ) : null}

          {/* Force refresh button */}
          <button
            onClick={() => fetchPrices(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60 transition-colors"
          >
            <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
            {refreshing ? 'Fetching live...' : t('common.refresh')}
          </button>
        </div>
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <p className="text-xs text-gray-400">
          🕐 {t('mandi.lastUpdated')}: {lastUpdated}
           
        </p>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('mandi.searchCrop')}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          )}
        </div>
        <select
          value={state}
          onChange={e => setState(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
        >
          {STATES.map(s => <option key={s} value={s}>{s === 'All States' ? t('mandi.allStates') : s}</option>)}
        </select>
      </div>

      {/* Quick crop chips */}
      {availableCrops.length > 0 && !search && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-gray-400 self-center">Quick:</span>
          {availableCrops.slice(0, 12).map(crop => (
            <button key={crop} onClick={() => setSearch(crop)}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-600 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400 rounded-full text-xs transition-colors">
              {crop}
            </button>
          ))}
        </div>
      )}

      {/* Results info */}
      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <span>📊 {filtered.length} records</span>
        {search && <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">"{search}" ×<button onClick={() => setSearch('')} className="ml-1 hover:text-green-900">clear</button></span>}
        {state !== 'All States' && <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs">📍 {state}</span>}
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 text-center">
          <div className="text-4xl animate-bounce mb-4">📊</div>
          <p className="text-gray-400 text-sm">{t('mandi.loading')}</p>
          <p className="text-gray-300 text-xs mt-1">Fetching from data.gov.in AGMARKNET API...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 text-center">
          <div className="text-5xl mb-4 opacity-30">🌾</div>
          <p className="text-gray-400">{t('mandi.noData')}</p>
          {search && <button onClick={() => setSearch('')} className="mt-3 text-green-600 text-sm hover:underline">Clear search</button>}
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                <tr>
                  {[
                    t('mandi.commodity'), t('mandi.market'), t('mandi.state'),
                    t('mandi.minPrice'), t('mandi.modalPrice'), t('mandi.maxPrice'), t('mandi.date'),
                  ].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {paginated.map((p: any, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{p.commodity}</div>
                      {p.variety && <div className="text-xs text-gray-400">{p.variety}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{p.market}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs">{p.state}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">₹{p.minPrice?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-green-600">₹{p.modalPrice?.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 ml-1">/{p.unit || 'qtl'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">₹{p.maxPrice?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(p.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="text-center">
              <button
                onClick={() => setPage(pg => pg + 1)}
                className="px-8 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Load more ({filtered.length - paginated.length} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
