import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const email = params.get('email') || '';
  const API = import.meta.env.VITE_API_URL;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error(t('validation.minPassword')); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (!token || !email) { toast.error('Invalid reset link. Please request a new one.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Password reset! Please log in.');
        navigate('/login');
      } else throw new Error(data.message);
    } catch (err: any) {
      toast.error(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 8 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500'][strength];

  if (!token || !email) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Invalid or expired reset link.</p>
        <Link to="/forgot-password" className="text-green-600 font-medium hover:underline">Request a new one</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold">🌾</div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">AgroAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set New Password</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">For account: <strong>{email}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">New Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required autoFocus
                placeholder="Min 8 characters"
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-gray-200 dark:bg-gray-700'}`} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">{strengthLabel}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Confirm Password</label>
            <input type={showPass ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} required
              placeholder="Re-enter password"
              className={`w-full px-3 py-2.5 border rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent ${
                confirm && password !== confirm ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-600 focus:ring-green-500'
              }`} />
            {confirm && password !== confirm && <p className="text-xs text-red-500 mt-1">Passwords don't match</p>}
          </div>

          <button type="submit" disabled={loading || (!!confirm && password !== confirm)}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl disabled:opacity-60 transition-colors">
            {loading ? t('common.loading') : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
