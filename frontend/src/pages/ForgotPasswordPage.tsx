import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const API = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error(t('validation.required')); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) { setSent(true); }
      else throw new Error(data.message);
    } catch (err: any) {
      toast.error(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold">🌾</div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">AgroAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.forgotPassword')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your email to receive a reset link</p>
        </div>

        {sent ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              We've sent a password reset link to <strong>{email}</strong>. It expires in 1 hour.
            </p>
            <p className="text-xs text-gray-400 mb-4">Didn't receive it? Check spam or</p>
            <button onClick={() => setSent(false)} className="text-green-600 text-sm font-medium hover:underline">
              Try again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('auth.email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                placeholder="your@email.com"
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl disabled:opacity-60 transition-colors">
              {loading ? t('common.loading') : 'Send Reset Link'}
            </button>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              <Link to="/login" className="text-green-600 hover:underline font-medium">← Back to login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
