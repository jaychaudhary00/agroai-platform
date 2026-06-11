import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { RootState } from '../store';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CATS = ['seeds','fertilizers','pesticides','tools','plants','soil'];
const UNITS = ['kg','litre','piece','bag','packet','box'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  packed: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function SellerDashboardPage() {
  const { t } = useTranslation();
  const { user } = useSelector((s: RootState) => s.auth);
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview'|'products'|'orders'>('overview');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', category: 'seeds', price: '', stock: '', unit: 'kg' });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [anaRes, prodRes, ordRes] = await Promise.all([
        fetch(`${API}/sellers/analytics`, { headers }),
        fetch(`${API}/sellers/my-products`, { headers }),
        fetch(`${API}/sellers/orders`, { headers }),
      ]);
      const [ana, prod, ord] = await Promise.all([anaRes.json(), prodRes.json(), ordRes.json()]);
      if (ana.success) setAnalytics(ana.data);
      if (prod.success) setProducts(prod.data);
      if (ord.success) setOrders(ord.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (product?: any) => {
    setEditProduct(product || null);
    setForm(product
      ? { name: product.name, description: product.description || '', category: product.category, price: String(product.price), stock: String(product.stock), unit: product.unit }
      : { name: '', description: '', category: 'seeds', price: '', stock: '', unit: 'kg' }
    );
    setImages([]);
    setImagePreviews(product?.images || []);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 4) { toast.error('Max 4 images'); return; }
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImages(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) { toast.error('Fill required fields'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img));

      const url = editProduct
        ? `${API}/sellers/products/${editProduct._id}`
        : `${API}/sellers/products`;
      const method = editProduct ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers, body: fd });
      const data = await res.json();
      if (data.success) {
        toast.success(editProduct ? 'Product updated!' : 'Product added!');
        setShowModal(false);
        load();
      } else throw new Error(data.message);
    } catch (err: any) { toast.error(err.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`${API}/sellers/products/${id}`, { method: 'DELETE', headers });
    toast.success('Product deleted');
    load();
  };

  const handleOrderStatus = async (orderId: string, status: string) => {
    await fetch(`${API}/orders/${orderId}/status`, { method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    toast.success('Status updated');
    load();
  };

  const totalRevenue = analytics?.totalRevenue || 0;
  const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
  const lowStock = products.filter((p: any) => p.stock < 10);
  const revenueData = analytics?.revenueData?.map((m: any) => ({
    month: MONTHS[(m._id.month || 1) - 1],
    revenue: m.revenue,
  })).reverse() || [];

  const tabs = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'products', icon: '📦', label: 'Products' },
    { id: 'orders', icon: '🛒', label: 'Orders' },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Seller Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome, {user?.name}</p>
        </div>
        <button onClick={() => openModal()}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-green-200 dark:shadow-none transition-all">
          <span className="text-lg">+</span> Add Product
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: '💰', bg: 'from-green-500 to-emerald-600' },
          { label: 'Total Orders', value: String(orders.length), icon: '🛒', bg: 'from-blue-500 to-indigo-600' },
          { label: 'Products', value: String(products.length), icon: '📦', bg: 'from-purple-500 to-violet-600' },
          { label: 'Pending', value: String(pendingOrders), icon: '⏳', bg: 'from-amber-500 to-orange-500' },
        ].map(({ label, value, icon, bg }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 overflow-hidden relative">
            <div className={`absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br ${bg} rounded-2xl opacity-10`} />
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue</h3>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueData}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#16a34a" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-gray-400 gap-2">
                <span className="text-4xl">📊</span>
                <span className="text-sm">No revenue data yet</span>
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">⚠️ Low Stock Alert</h3>
            {lowStock.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">
                <div className="text-3xl mb-2">✅</div>
                All products well-stocked
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStock.slice(0, 6).map((p: any) => (
                  <div key={p._id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">{p.name}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.stock === 0 ? 'bg-red-200 text-red-800' : 'bg-amber-100 text-amber-700'}`}>
                      {p.stock === 0 ? 'Out' : `${p.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({length: 6}).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 h-64 animate-pulse" />
            ))
          ) : products.length === 0 ? (
            <div className="col-span-3 py-16 text-center">
              <div className="text-5xl mb-3">📦</div>
              <p className="text-gray-500 mb-4">No products yet</p>
              <button onClick={() => openModal()} className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium">Add Your First Product</button>
            </div>
          ) : (
            products.map((p: any) => (
              <div key={p._id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow">
                {/* Product image */}
                <div className="h-40 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 relative overflow-hidden">
                  {p.images && p.images.length > 0 ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl opacity-40">
                      {p.category === 'seeds' ? '🌱' : p.category === 'fertilizers' ? '🧪' : p.category === 'tools' ? '🔧' : p.category === 'plants' ? '🪴' : '📦'}
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button onClick={() => openModal(p)} className="w-8 h-8 bg-white/90 hover:bg-white rounded-lg flex items-center justify-center text-sm shadow-sm transition-all">✏️</button>
                    <button onClick={() => handleDelete(p._id)} className="w-8 h-8 bg-white/90 hover:bg-red-50 rounded-lg flex items-center justify-center text-sm shadow-sm transition-all">🗑️</button>
                  </div>
                  {p.images && p.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full">+{p.images.length - 1}</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{p.name}</h4>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full capitalize ml-2 shrink-0">{p.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">₹{p.price}<span className="text-xs text-gray-400 font-normal">/{p.unit}</span></span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock < 10 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {p.stock} in stock
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-500">No orders yet</p>
            </div>
          ) : (
            orders.map((o: any) => (
              <div key={o._id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-xl">🛒</div>
                    <div>
                      <div className="font-mono text-xs text-gray-400">#{o._id.slice(-8).toUpperCase()}</div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{o.userId?.name || 'Customer'}</div>
                      <div className="text-xs text-gray-400">{o.items?.length} items · {new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">₹{o.totalAmount?.toLocaleString()}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>{o.status}</span>
                    <select value={o.status} onChange={e => handleOrderStatus(o._id, e.target.value)}
                      className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      {['pending','confirmed','packed','shipped','delivered','cancelled'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 z-10">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">{editProduct ? '✏️ Edit Product' : '+ Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 text-xl">✕</button>
            </div>

            <div className="p-5 space-y-4">
              {/* Photo upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📸 Product Photos (up to 4)</label>
                <div className="grid grid-cols-4 gap-2 mb-2 min-w-0">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(idx)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-lg">✕</button>
                    </div>
                  ))}
                  {imagePreviews.length < 4 && (
                    <button onClick={() => fileRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all gap-1">
                      <span className="text-2xl text-gray-300">+</span>
                      <span className="text-xs text-gray-400">Add</span>
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                <p className="text-xs text-gray-400">Upload actual photos of your product so farmers can see what they're buying</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Organic Wheat Seeds"
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Describe your product..."
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" />
              </div>

              {/* Category + Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500">
                    {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                  <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" min="0"
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Stock Qty *</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" min="0"
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition-colors shadow-md shadow-green-200 dark:shadow-none">
                {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
