import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch, fetchOrders } from '../store';

const STATUS_COLORS: Record<string,string> = {
  pending:'bg-amber-100 text-amber-700',confirmed:'bg-blue-100 text-blue-700',
  packed:'bg-purple-100 text-purple-700',shipped:'bg-indigo-100 text-indigo-700',
  delivered:'bg-green-100 text-green-700',cancelled:'bg-red-100 text-red-700',
};
const STATUS_STEPS = ['pending','confirmed','packed','shipped','delivered'];

export function OrdersPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { items: orders, loading } = useSelector((s: RootState) => s.orders);

  useEffect(() => { dispatch(fetchOrders(1)); }, [dispatch]);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('orders.title')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('orders.subtitle')}</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 animate-pulse">{t('common.loading')}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="text-5xl mb-3 opacity-30">📦</div>
          <p className="text-gray-400">{t('orders.noOrders')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const stepIdx = STATUS_STEPS.indexOf(order.status);
            return (
              <div key={order._id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs text-gray-400 font-mono">#{order._id.slice(-8).toUpperCase()}</div>
                    <div className="text-base font-bold text-gray-900 dark:text-white mt-0.5">₹{order.totalAmount?.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {t(`orders.${order.status}`)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {order.paymentStatus === 'paid' ? '💳 ' + t('orders.paid') : '💵 ' + t('orders.unpaid')}
                    </span>
                  </div>
                </div>

                {/* Progress bar (not shown for cancelled) */}
                {order.status !== 'cancelled' && (
                  <div className="mb-4 overflow-x-auto">
                    <div className="flex items-center gap-1">
                      {STATUS_STEPS.map((step, i) => (
                        <div key={step} className="flex items-center flex-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                            i <= stepIdx ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                          }`}>
                            {i < stepIdx ? '✓' : i + 1}
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-1 ${i < stepIdx ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      {STATUS_STEPS.map(s => (
                        <div key={s} className="text-center flex-1">
                          <span className="text-xs text-gray-400 capitalize">{t(`orders.${s}`)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-2 border-t border-gray-50 dark:border-gray-800 pt-3">
                  {order.items?.slice(0,3).map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-sm">📦</div>
                      <div className="flex-1 text-sm text-gray-700 dark:text-gray-300">{item.productId?.name || 'Product'}</div>
                      <div className="text-xs text-gray-400">x{item.quantity}</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">₹{item.total?.toLocaleString()}</div>
                    </div>
                  ))}
                  {order.items?.length > 3 && <p className="text-xs text-gray-400">+{order.items.length - 3} more items</p>}
                </div>

                {/* Shipping */}
                {order.shippingAddress && (
                  <div className="mt-3 text-xs text-gray-400 border-t border-gray-50 dark:border-gray-800 pt-3">
                    📍 {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
