import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const [stats, setStats] = useState<any>(null);
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [allSellers, setAllSellers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview'|'sellers'|'users'|'logs'|'products'>('overview');
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [investigationNote, setInvestigationNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [sellerFilter, setSellerFilter] = useState<'pending'|'approved'|'rejected'|'all'>('pending');
  const [userSearch, setUserSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, pRes, aRes, uRes, lRes, rRes] = await Promise.all([
        fetch(`${API}/admin/stats`, { headers }),
        fetch(`${API}/admin/sellers/pending`, { headers }),
        fetch(`${API}/admin/sellers`, { headers }),
        fetch(`${API}/admin/users`, { headers }),
        fetch(`${API}/admin/activity-logs`, { headers }),
        fetch(`${API}/admin/analytics/revenue`, { headers }),
      ]);
      const [s, p, a, u, l, r] = await Promise.all([sRes.json(), pRes.json(), aRes.json(), uRes.json(), lRes.json(), rRes.json()]);
      if (s.success) setStats(s.data);
      if (p.success) setPendingSellers(p.data);
      if (a.success) setAllSellers(a.data);
      if (u.success) setUsers(u.data);
      if (l.success) setLogs(l.data);
      if (r.success) setRevenue(r.data.reverse().map((m: any) => ({
        month: MONTHS[(m._id?.month||1)-1],
        revenue: m.total || 0,
        orders: m.count || 0,
      })));
    } catch { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSaveNote = async () => {
    if (!selectedSeller) return;
    try {
      const res = await fetch(`${API}/admin/sellers/${selectedSeller._id}/notes`, {
        method: 'PATCH', headers, body: JSON.stringify({ notes: investigationNote }),
      });
      if ((await res.json()).success) toast.success('Notes saved ✓');
    } catch { toast.error('Failed to save notes'); }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this seller? An email will be sent to them.')) return;
    try {
      const res = await fetch(`${API}/admin/sellers/${id}/approve`, { method: 'PATCH', headers });
      const data = await res.json();
      if (data.success) { toast.success('✅ Seller approved! Email sent.'); setSelectedSeller(null); load(); }
      else throw new Error(data.message);
    } catch (err: any) { toast.error(err.message || 'Failed'); }
  };

  const handleReject = async () => {
    if (!selectedSeller || !rejectReason.trim()) { toast.error('Rejection reason is required'); return; }
    try {
      const res = await fetch(`${API}/admin/sellers/${selectedSeller._id}/reject`, {
        method: 'PATCH', headers, body: JSON.stringify({ reason: rejectReason }),
      });
      if ((await res.json()).success) {
        toast.success('Seller rejected. Email sent with reason.');
        setShowRejectModal(false); setSelectedSeller(null); setRejectReason(''); load();
      }
    } catch { toast.error('Failed'); }
  };

  const handleToggleUser = async (id: string, name: string) => {
    if (!confirm(`Toggle active status for ${name}?`)) return;
    try {
      const res = await fetch(`${API}/admin/users/${id}/toggle`, { method: 'PATCH', headers });
      if ((await res.json()).success) { toast.success('User status updated'); load(); }
    } catch { toast.error('Failed'); }
  };

  const displayedSellers = sellerFilter === 'pending' ? pendingSellers
    : allSellers.filter((s: any) => sellerFilter === 'all' || s.approvalStatus === sellerFilter);

  const filteredUsers = users.filter((u: any) =>
    !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const statCards = [
    { label: t('dashboard.totalUsers'), value: stats?.users || 0, icon: '👥', color: 'bg-blue-50 dark:bg-blue-900/20', sub: 'Registered users' },
    { label: t('dashboard.pendingSellers'), value: stats?.pendingSellers || 0, icon: '⏳', color: 'bg-amber-50 dark:bg-amber-900/20', alert: (stats?.pendingSellers||0) > 0, sub: 'Need review' },
    { label: t('dashboard.platformRevenue'), value: `₹${(stats?.revenue||0).toLocaleString()}`, icon: '💰', color: 'bg-green-50 dark:bg-green-900/20', sub: 'Total delivered' },
    { label: 'Active Sellers', value: stats?.sellers || 0, icon: '🏪', color: 'bg-purple-50 dark:bg-purple-900/20', sub: 'Approved' },
    { label: t('dashboard.activeProducts'), value: stats?.products || 0, icon: '📦', color: 'bg-indigo-50 dark:bg-indigo-900/20', sub: 'Listed' },
    { label: 'Total Orders', value: stats?.orders || 0, icon: '🛒', color: 'bg-pink-50 dark:bg-pink-900/20', sub: 'All time' },
  ];

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'sellers', label: `🏪 Sellers${pendingSellers.length > 0 ? ` (${pendingSellers.length})` : ''}` },
    { id: 'users', label: '👥 Users' },
    { id: 'logs', label: '📋 Activity Logs' },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Full platform management</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
          🔄 Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon, color, alert, sub }) => (
          <div key={label} className={`bg-white dark:bg-gray-900 rounded-2xl border ${alert ? 'border-amber-300 dark:border-amber-600' : 'border-gray-100 dark:border-gray-800'} p-4 relative`}>
            {alert && <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full animate-pulse flex items-center justify-center text-white text-xs font-bold">{value}</span>}
            <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center text-lg mb-2`}>{icon}</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue chart */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">{t('admin.revenueAnalytics')}</h2>
            <p className="text-xs text-gray-400 mb-4">Monthly platform revenue</p>
            {revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenue}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#16a34a" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div>}
          </div>

          {/* Orders trend */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Order Trends</h2>
            <p className="text-xs text-gray-400 mb-4">Monthly order count</p>
            {revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={revenue}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No order data yet</div>}
          </div>

          {/* Pending sellers quick panel */}
          {pendingSellers.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">⚠️</span>
                <h2 className="font-semibold text-amber-800 dark:text-amber-300">{pendingSellers.length} Seller{pendingSellers.length > 1 ? 's' : ''} Awaiting Review</h2>
              </div>
              <div className="space-y-2">
                {pendingSellers.slice(0, 4).map((s: any) => (
                  <div key={s._id} className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-xl p-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{s.businessName}</div>
                      <div className="text-xs text-gray-400">{s.userId?.email}</div>
                    </div>
                    <button onClick={() => { setActiveTab('sellers'); setSelectedSeller(s); setInvestigationNote(s.investigationNotes || ''); }}
                      className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-lg hover:bg-amber-200">
                      Review →
                    </button>
                  </div>
                ))}
              </div>
              {pendingSellers.length > 4 && (
                <button onClick={() => setActiveTab('sellers')} className="mt-2 text-xs text-amber-700 dark:text-amber-400 hover:underline">
                  View all {pendingSellers.length} →
                </button>
              )}
            </div>
          )}

          {/* Recent activity */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.recentActivity')}</h2>
            {logs.slice(0, 7).map((log: any, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <div className="w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                  {log.action.includes('approved') ? '✅' : log.action.includes('rejected') ? '❌' : log.action.includes('deactivated') ? '🚫' : '📝'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white capitalize">{log.action.replace(/_/g, ' ')}</p>
                  {log.details && <p className="text-xs text-gray-400 truncate">{log.details}</p>}
                  <p className="text-xs text-gray-400">{log.adminId?.name} · {new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {logs.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No activity yet</div>}
          </div>
        </div>
      )}

      {/* ── Sellers Tab ── */}
      {activeTab === 'sellers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: seller list with filter */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">{t('admin.allSellers')}</h2>
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                {(['pending','approved','rejected','all'] as const).map(f => (
                  <button key={f} onClick={() => setSellerFilter(f)}
                    className={`flex-1 text-xs py-1.5 rounded-lg font-medium capitalize transition-all ${
                      sellerFilter === f ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'
                    }`}>
                    {f === 'pending' ? `⏳ ${pendingSellers.length}` : f === 'approved' ? '✅' : f === 'rejected' ? '❌' : '🔍'}
                    <span className="ml-1 hidden sm:inline">{f}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-y-auto flex-1 max-h-[55vh]">
              {displayedSellers.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  {sellerFilter === 'pending' ? '✅ No pending applications' : 'No sellers found'}
                </div>
              ) : displayedSellers.map((s: any) => (
                <div key={s._id}
                  onClick={() => { setSelectedSeller(s); setInvestigationNote(s.investigationNotes || ''); }}
                  className={`p-4 border-b border-gray-50 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedSeller?._id === s._id ? 'bg-green-50 dark:bg-green-900/10 border-l-4 border-l-green-500' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 dark:text-white truncate">{s.businessName}</div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">{s.userId?.name} · {s.userId?.email}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{new Date(s.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`flex-shrink-0 ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                      s.approvalStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{s.approvalStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: investigation panel */}
          <div className="lg:col-span-2">
            {selectedSeller ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedSeller.businessName}</h2>
                    <p className="text-sm text-gray-500">{t('admin.sellerInvestigation')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedSeller.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                      selectedSeller.approvalStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{selectedSeller.approvalStatus}</span>
                    <button onClick={() => setSelectedSeller(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                  </div>
                </div>

                {/* Business details grid */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t('admin.businessDetails')}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: t('admin.gstNumber'), value: selectedSeller.gstNumber || '—' },
                      { label: t('admin.panNumber'), value: selectedSeller.panNumber || '—' },
                      { label: 'Business Type', value: selectedSeller.businessType || '—' },
                      { label: 'State', value: selectedSeller.state || '—' },
                      { label: 'Pincode', value: selectedSeller.pincode || '—' },
                      { label: 'Contact', value: selectedSeller.contactPhone || selectedSeller.userId?.phone || '—' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-gray-400 font-medium">{label}</p>
                        <p className="text-sm text-gray-900 dark:text-white font-semibold mt-0.5">{value}</p>
                      </div>
                    ))}
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400 font-medium">{t('admin.businessAddress')}</p>
                      <p className="text-sm text-gray-900 dark:text-white mt-0.5">{selectedSeller.businessAddress || selectedSeller.address || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Applicant info */}
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Applicant</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900 dark:text-white ml-1">{selectedSeller.userId?.name}</span></div>
                    <div><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-900 dark:text-white ml-1">{selectedSeller.userId?.email}</span></div>
                    <div><span className="text-gray-500">Phone:</span> <span className="font-medium text-gray-900 dark:text-white ml-1">{selectedSeller.userId?.phone || '—'}</span></div>
                    <div><span className="text-gray-500">Applied:</span> <span className="font-medium text-gray-900 dark:text-white ml-1">{new Date(selectedSeller.createdAt).toLocaleDateString()}</span></div>
                  </div>
                </div>

                {/* Previous rejection reason if any */}
                {selectedSeller.rejectionReason && (
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Previous Rejection Reason</h3>
                    <p className="text-sm text-red-700 dark:text-red-400">{selectedSeller.rejectionReason}</p>
                  </div>
                )}

                {/* Investigation notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    🗒️ {t('admin.investigationNotes')}
                  </label>
                  <textarea value={investigationNote} onChange={e => setInvestigationNote(e.target.value)}
                    placeholder="e.g. GST verified on portal ✓ · Business address confirmed · Documents look authentic · Called applicant..."
                    rows={4}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                  <button onClick={handleSaveNote}
                    className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                    💾 {t('admin.saveNotes')}
                  </button>
                </div>

                {/* Action buttons — only show for pending */}
                {selectedSeller.approvalStatus === 'pending' && (
                  <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button onClick={() => setShowRejectModal(true)}
                      className="flex-1 py-3 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      ❌ {t('admin.reject')}
                    </button>
                    <button onClick={() => handleApprove(selectedSeller._id)}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors">
                      ✅ {t('admin.approve')}
                    </button>
                  </div>
                )}

                {selectedSeller.approvalStatus === 'approved' && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                    ✅ Approved on {selectedSeller.verifiedAt ? new Date(selectedSeller.verifiedAt).toLocaleDateString() : 'N/A'}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 text-center">
                <div className="text-5xl mb-4 opacity-20">🔍</div>
                <p className="text-gray-400 text-sm">Select a seller to investigate</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Users Tab ── */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <h2 className="font-semibold text-gray-900 dark:text-white">{t('admin.users')}</h2>
            <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by name or email..."
              className="flex-1 max-w-xs px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            <span className="text-xs text-gray-400">{filteredUsers.length} users</span>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>{['Name','Email','Role','Status','Joined','Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredUsers.map((u: any) => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-xs font-bold text-green-700 dark:text-green-400 flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        u.role === 'farmer' ? 'bg-green-100 text-green-700' :
                        u.role === 'seller' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'homegrower' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleUser(u._id, u.name)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                          u.isActive ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400' : 'border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400'
                        }`}>
                        {u.isActive ? '🚫 Disable' : '✅ Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="p-12 text-center text-gray-400 text-sm">No users found</div>
            )}
          </div>
        </div>
      )}

      {/* ── Activity Logs Tab ── */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">{t('admin.activityLogs')}</h2>
            <span className="text-xs text-gray-400">{logs.length} entries</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[60vh] overflow-y-auto">
            {logs.map((log: any, i) => (
              <div key={i} className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                  log.action.includes('approved') ? 'bg-green-100' :
                  log.action.includes('rejected') ? 'bg-red-100' :
                  log.action.includes('deactivated') ? 'bg-orange-100' : 'bg-gray-100'
                }`}>
                  {log.action.includes('approved') ? '✅' : log.action.includes('rejected') ? '❌' : log.action.includes('deactivated') ? '🚫' : '📝'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{log.action.replace(/_/g, ' ')}</p>
                  {log.details && <p className="text-xs text-gray-500 mt-0.5 truncate">{log.details}</p>}
                  <p className="text-xs text-gray-400 mt-1">By <strong>{log.adminId?.name || 'Admin'}</strong> · {new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {logs.length === 0 && <div className="p-12 text-center text-gray-400 text-sm">No activity logs yet</div>}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-1">{t('admin.reject')} Seller</h2>
            <p className="text-sm text-gray-500 mb-4">{selectedSeller?.businessName}</p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.rejectionReason')} <span className="text-red-500">*</span>
            </label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Provide a clear, helpful reason so the seller knows what to fix..."
              rows={4}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-red-400 focus:border-transparent" />
            <p className="text-xs text-gray-400 mt-1">This reason will be included in the email sent to the seller.</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50">
                {t('common.cancel')}
              </button>
              <button onClick={handleReject} disabled={!rejectReason.trim()}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
                Reject &amp; Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
