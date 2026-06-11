import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const BUSINESS_TYPES = ['Manufacturer','Wholesaler','Retailer','Distributor','Farmer Producer Organization','Other'];
const INDIAN_STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal'];

export function SellerRegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({
    companyName: '', businessType: 'Retailer', gstNumber: '', panNumber: '',
    businessAddress: '', state: 'Gujarat', pincode: '', contactPerson: '', contactPhone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.businessAddress || !form.pincode) {
      toast.error(t('validation.required')); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/sellers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, businessName: form.companyName }),
      });
      const data = await res.json();
      if (data.success) { toast.success('Application submitted!'); navigate('/seller/status'); }
      else throw new Error(data.message);
    } catch (err: any) { toast.error(err.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('seller.registerTitle')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('seller.registerSub')}</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
        <div className="grid grid-cols-1 gap-4">
          {[
            { key:'companyName', label:t('seller.companyName'), type:'text', required:true },
            { key:'gstNumber', label:t('seller.gstNumber'), type:'text', placeholder:'22AAAAA0000A1Z5' },
            { key:'panNumber', label:t('seller.panNumber'), type:'text', placeholder:'AAAAA0000A' },
            { key:'businessAddress', label:t('seller.businessAddress'), type:'text', required:true },
            { key:'pincode', label:t('seller.pincode'), type:'text', required:true },
            { key:'contactPerson', label:t('seller.contactPerson'), type:'text' },
            { key:'contactPhone', label:t('seller.contactPhone'), type:'tel' },
          ].map(({ key, label, type, required, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}{required && ' *'}</label>
              <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} required={required}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('seller.businessType')}</label>
            <select value={form.businessType} onChange={e => set('businessType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              {BUSINESS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('seller.state')}</label>
            <select value={form.state} onChange={e => set('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400">
          ⏳ After submission, our team reviews your application within 2–3 business days. You'll receive an email notification.
        </div>
        <button type="submit" disabled={submitting}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl disabled:opacity-60 transition-colors">
          {submitting ? t('seller.submitting') : t('seller.submit')}
        </button>
      </form>
    </div>
  );
}
