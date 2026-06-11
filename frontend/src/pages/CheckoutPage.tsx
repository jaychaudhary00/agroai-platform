import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { RootState, AppDispatch, clearCart } from '../store';

declare global {
  interface Window { Razorpay: any; }
}

export function CheckoutPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items } = useSelector((s: RootState) => s.cart);
  const { user } = useSelector((s: RootState) => s.auth);
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    address: '', city: '', state: '', pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online');
  const [processing, setProcessing] = useState(false);

  const total = items.reduce((s: number, i: any) => s + i.product.price * i.quantity, 0);

  const handleField = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const loadRazorpay = () => new Promise<boolean>((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePlaceOrder = async () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill all shipping details'); return;
    }
    if (items.length === 0) { toast.error('Cart is empty'); return; }

    setProcessing(true);
    try {
      const orderItems = items.map((i: any) => ({
        productId: i.product._id, quantity: i.quantity,
      }));
      const shippingAddress = { name: form.name, phone: form.phone, address: form.address, city: form.city, state: form.state, pincode: form.pincode };

      if (paymentMethod === 'cod') {
        const res = await fetch(`${API}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ items: orderItems, shippingAddress, paymentMethod: 'cod' }),
        });
        const data = await res.json();
        if (data.success) {
          dispatch(clearCart());
          toast.success('Order placed successfully!');
          navigate('/orders');
        } else throw new Error(data.message);
      } else {
        // Create Razorpay order
        const res = await fetch(`${API}/payments/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ items: orderItems, shippingAddress }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        const loaded = await loadRazorpay();
        if (!loaded) { toast.error('Failed to load payment gateway'); return; }

        const { razorpayOrderId, amount, keyId, items: orderItemsWithDetails } = data.data;

        const options = {
          key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: Math.round(amount * 100),
          currency: 'INR',
          name: 'AgroAI Platform',
          description: 'Agricultural Products',
          order_id: razorpayOrderId,
          prefill: { name: form.name, contact: form.phone, email: user?.email },
          theme: { color: '#16a34a' },
          handler: async (response: any) => {
            try {
              const verifyRes = await fetch(`${API}/payments/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  items: orderItemsWithDetails,
                  shippingAddress,
                  totalAmount: amount,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                dispatch(clearCart());
                toast.success(t('payment.paymentSuccess'));
                navigate('/orders');
              } else throw new Error(verifyData.message);
            } catch { toast.error(t('payment.paymentFailed')); }
          },
          modal: { ondismiss: () => { setProcessing(false); toast.error('Payment cancelled'); } },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }
    } catch (err: any) {
      toast.error(err.message || 'Order failed');
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <div className="text-5xl mb-4">🛒</div>
      <p className="text-gray-500 dark:text-gray-400">{t('marketplace.cartEmpty')}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('payment.title')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('payment.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipping Form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">{t('payment.shippingDetails')}</h2>
          {[
            { key: 'name', label: t('payment.fullName'), type: 'text' },
            { key: 'phone', label: t('payment.phone'), type: 'tel' },
            { key: 'address', label: t('payment.address'), type: 'text' },
            { key: 'city', label: t('payment.city'), type: 'text' },
            { key: 'state', label: t('payment.state'), type: 'text' },
            { key: 'pincode', label: t('payment.pincode'), type: 'text' },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input
                type={type}
                value={(form as any)[key]}
                onChange={e => handleField(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          ))}

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('payment.selectMethod')}</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: 'online' as const, label: '💳 ' + t('payment.online'), color: 'green' },
                { val: 'cod' as const, label: '💵 ' + t('payment.cod'), color: 'gray' },
              ].map(({ val, label }) => (
                <button key={val} onClick={() => setPaymentMethod(val)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    paymentMethod === val
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t('payment.orderSummary')}</h2>
            <div className="space-y-3">
              {items.map((item: any) => (
                <div key={item.product._id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-lg">
                    {item.product.images?.[0] ? <img src={item.product.images[0]} className="w-full h-full object-cover rounded-lg" /> : '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.product.name}</div>
                    <div className="text-xs text-gray-500">x{item.quantity}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">₹{(item.product.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 mt-4 pt-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>{t('payment.subtotal')}</span><span>₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                <span>Delivery</span><span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                <span>{t('payment.total')}</span><span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button onClick={handlePlaceOrder} disabled={processing}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-lg">
            {processing ? (
              <><span className="animate-spin">⏳</span> {t('payment.processing')}</>
            ) : (
              <>{paymentMethod === 'online' ? '💳' : '💵'} {t('payment.payNow')} — ₹{total.toLocaleString()}</>
            )}
          </button>

          {paymentMethod === 'online' && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <span>🔒</span>
              <span>Secured by Razorpay · 256-bit SSL encryption</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
