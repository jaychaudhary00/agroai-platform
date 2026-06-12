import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { RootState, AppDispatch, loginUser } from '../store';

function FloatingLeaf({ x, y, size, rotate, opacity, delay }: any) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: x, top: y, opacity, animationDelay: delay, animation: 'floatLeaf 6s ease-in-out infinite' }}>
      <svg width={size} height={size} viewBox="0 0 30 30" style={{ transform: `rotate(${rotate}deg)` }}>
        <path d="M15 2 Q25 8 25 18 Q20 28 10 26 Q2 22 5 12 Q8 4 15 2Z" fill="#22c55e" opacity="0.6"/>
        <line x1="15" y1="26" x2="15" y2="6" stroke="#16a34a" strokeWidth="1"/>
      </svg>
    </div>
  );
}

export function LoginPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading } = useSelector((s: RootState) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back! 🌾');
      navigate('/dashboard');
    } else {
      toast.error(result.payload as string || t('common.error'));
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      <style>{`
        @keyframes floatLeaf {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(5deg); }
          66% { transform: translateY(-6px) rotate(-5deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.5s 0.1s ease forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.5s 0.2s ease forwards; opacity: 0; }
      `}</style>

      {/* Left panel - decorative */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 relative overflow-hidden p-12">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

        {/* Floating leaves */}
        <FloatingLeaf x="10%" y="20%" size={40} rotate={15} opacity={0.4} delay="0s" />
        <FloatingLeaf x="75%" y="35%" size={28} rotate={-30} opacity={0.3} delay="1s" />
        <FloatingLeaf x="20%" y="70%" size={35} rotate={45} opacity={0.35} delay="2s" />
        <FloatingLeaf x="60%" y="15%" size={22} rotate={-15} opacity={0.25} delay="0.5s" />
        <FloatingLeaf x="85%" y="65%" size={32} rotate={20} opacity={0.3} delay="1.5s" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm">🌾</div>
            <span className="text-white text-2xl font-extrabold">AgroAI</span>
          </div>
        </div>

        {/* Main illustration area */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <svg viewBox="0 0 400 300" className="w-full max-w-sm mx-auto">
            {/* Farm scene */}
            <defs>
              <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.2)"/>
                <stop offset="100%" stopColor="rgba(255,255,255,0.05)"/>
              </linearGradient>
            </defs>
            <ellipse cx="200" cy="280" rx="200" ry="40" fill="rgba(255,255,255,0.1)"/>
            {/* Field */}
            {[0,1,2,3,4,5,6].map(i => {
              const x = 30 + i * 52;
              return (
                <g key={i}>
                  <line x1={x} y1="270" x2={x + (i%2?-3:3)} y2="180" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
                  <ellipse cx={x + (i%2?-3:3)} cy="175" rx="4" ry="14" fill="rgba(255,255,255,0.6)"/>
                  <ellipse cx={x + (i%2?-6:6)} cy="185" rx="3" ry="8" fill="rgba(255,255,255,0.4)"/>
                  <ellipse cx={x + (i%2?0:0)} cy="185" rx="3" ry="8" fill="rgba(255,255,255,0.4)"/>
                </g>
              );
            })}
            {/* Phone */}
            <rect x="155" y="80" width="90" height="150" rx="12" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
            <rect x="161" y="92" width="78" height="106" rx="6" fill="rgba(255,255,255,0.1)"/>
            <rect x="164" y="96" width="72" height="20" rx="4" fill="rgba(255,255,255,0.2)"/>
            <text x="200" y="111" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">AgroAI ✓</text>
            <rect x="164" y="122" width="50" height="6" rx="3" fill="rgba(255,255,255,0.2)"/>
            <rect x="164" y="132" width="35" height="6" rx="3" fill="rgba(255,255,255,0.15)"/>
            <rect x="164" y="142" width="55" height="6" rx="3" fill="rgba(255,255,255,0.15)"/>
            <rect x="164" y="152" width="42" height="6" rx="3" fill="rgba(255,255,255,0.1)"/>
            <circle cx="200" cy="178" r="12" fill="rgba(34,197,94,0.6)"/>
            <text x="200" y="183" textAnchor="middle" fontSize="14" fill="white">🌱</text>
            <circle cx="185" cy="220" r="4" fill="rgba(255,255,255,0.4)"/>
          </svg>
          <h2 className="text-white text-center text-2xl font-bold mt-4">Smart Farming Starts Here</h2>
          <p className="text-white/70 text-center text-sm mt-2 max-w-xs mx-auto">AI-powered tools for disease detection, mandi prices, and crop management</p>
        </div>

        {/* Developer Social Links */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-3">Built by</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shrink-0">👨‍💻</div>
            <div>
              <p className="text-white font-semibold text-sm">Jay Chaudhari</p>
              <p className="text-white/60 text-xs">MERN Stack Developer</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <a href="https://www.instagram.com/jay_chaudhari74" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-white/80 hover:text-white transition-colors text-sm group">
              <span className="w-7 h-7 bg-white/15 group-hover:bg-white/25 rounded-lg flex items-center justify-center text-base transition-colors">📸</span>
              <span>@jay_chaudhari74</span>
            </a>
            <a href="https://www.linkedin.com/in/chaudhari-jay-b51163299" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-white/80 hover:text-white transition-colors text-sm group">
              <span className="w-7 h-7 bg-white/15 group-hover:bg-white/25 rounded-lg flex items-center justify-center text-base transition-colors">💼</span>
              <span>linkedin.com/in/chaudhari-jay</span>
            </a>
            <a href="mailto:cjay49586@gmail.com"
              className="flex items-center gap-2.5 text-white/80 hover:text-white transition-colors text-sm group">
              <span className="w-7 h-7 bg-white/15 group-hover:bg-white/25 rounded-lg flex items-center justify-center text-base transition-colors">✉️</span>
              <span>cjay49586@gmail.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-gray-950">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">🌾</div>
            <span className="font-extrabold text-gray-900 dark:text-white text-xl">AgroAI</span>
          </div>

          <div className="fade-up mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('auth.loginTitle')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">{t('auth.loginSub')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 fade-up-2">
            {/* Email */}
            <div className="relative">
              <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                focused === 'email' || email
                  ? '-top-2.5 text-xs bg-white dark:bg-gray-950 px-1 text-green-600 font-medium z-10'
                  : 'top-3.5 text-sm text-gray-400'
              }`}>
                {t('auth.email')}
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                required autoComplete="email"
                className={`w-full px-4 py-3.5 border-2 rounded-2xl text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all outline-none ${
                  focused === 'email' ? 'border-green-500 shadow-lg shadow-green-100 dark:shadow-green-900/20' : 'border-gray-200 dark:border-gray-700'
                }`}/>
            </div>

            {/* Password */}
            <div className="relative">
              <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                focused === 'pass' || password
                  ? '-top-2.5 text-xs bg-white dark:bg-gray-950 px-1 text-green-600 font-medium z-10'
                  : 'top-3.5 text-sm text-gray-400'
              }`}>
                {t('auth.password')}
              </label>
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('pass')} onBlur={() => setFocused('')}
                required autoComplete="current-password"
                className={`w-full px-4 py-3.5 pr-12 border-2 rounded-2xl text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all outline-none ${
                  focused === 'pass' ? 'border-green-500 shadow-lg shadow-green-100 dark:shadow-green-900/20' : 'border-gray-200 dark:border-gray-700'
                }`}/>
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors">
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700 font-medium hover:underline">{t('auth.forgotPassword')}</Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-green-200 dark:shadow-none disabled:opacity-60 text-base relative overflow-hidden group">
              <span className="relative z-10">{loading ? '...' : t('auth.login')}</span>
              <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:-translate-x-full transition-transform duration-700" />
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 fade-up-3">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold hover:underline">{t('auth.register')}</Link>
          </p>

          {/* Decorative dots */}
          <div className="flex justify-center gap-2 mt-8">
            {[0,1,2].map(i => (
              <div key={i} className={`rounded-full transition-all ${i === 0 ? 'w-6 h-2 bg-green-500' : 'w-2 h-2 bg-gray-200 dark:bg-gray-700'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}