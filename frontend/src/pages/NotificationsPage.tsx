import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { notificationAPI } from '../services/api';

interface Notification {
  _id: string;
  title: string;
  body: string;
  type: 'order' | 'disease' | 'reminder' | 'price' | 'system';
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  order: '📦',
  disease: '🔬',
  reminder: '⏰',
  price: '📈',
  system: 'ℹ️',
};

const TYPE_BG: Record<string, string> = {
  order: 'bg-blue-50 dark:bg-blue-900/20',
  disease: 'bg-red-50 dark:bg-red-900/20',
  reminder: 'bg-amber-50 dark:bg-amber-900/20',
  price: 'bg-green-50 dark:bg-green-900/20',
  system: 'bg-gray-50 dark:bg-gray-800',
};

export function NotificationsPage() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationAPI
      .getAll()
      .then((r) => setNotifications(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAll = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Action failed');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="text-xs text-green-600 hover:underline border border-green-200 dark:border-green-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 h-20 animate-pulse"
            />
          ))
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 py-16 text-center">
            <div className="text-5xl mb-3">🔔</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
              className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex gap-3 cursor-pointer hover:shadow-sm transition-shadow ${
                !n.isRead ? 'border-l-4 border-l-green-500' : ''
              }`}
            >
              <div
                className={`w-10 h-10 ${TYPE_BG[n.type]} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}
              >
                {TYPE_ICONS[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`text-sm font-medium ${
                      !n.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {n.title}
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                  {n.body}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(n.createdAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
