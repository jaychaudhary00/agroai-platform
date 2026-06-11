import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { RootState, AppDispatch, registerUser } from '../store';

const STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal'];
const LANGS = [{ code:'en',label:'English' },{ code:'hi',label:'हिंदी' },{ code:'gu',label:'ગુજરાતી' },{ code:'pa',label:'ਪੰਜਾਬੀ' },{ code:'mr',label:'मराठी' }];

const STEPS = ['role', 'info', 'location'] as const;
type Step = typeof STEPS[number];

export function RegisterPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading } = useSelector((s: RootState) => s.auth);
  const [step, setStep] = useState<Step>('role');
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', role:'farmer', state:'Gujarat', district:'', language: i18n.language || 'en' });
  const [showPass, setShowPass] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (form.password.length < 8) { toast.error(t('validation.minPassword')); return; }
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! 🎉');
      const role = result.payload?.user?.role;
      if (role === 'seller') navigate('/seller/register');
      else navigate('/dashboard');
    } else {
      toast.error(result.payload as string || t('common.error'));
    }
  };

  const roles = [
    { val:'farmer', icon:'👨‍🌾', label:t('auth.farmer'), desc:'Crop tracking, mandi prices, AI disease scanner & expense management', features:['Mandi Prices','Expense Tracker','Disease Scanner','AI Assistant'] },
    { val:'homegrower', icon:'🏡', label:t('auth.homegrower'), desc:'Perfect for gardening enthusiasts and terrace farmers', features:['Plant Care','Disease Scanner','Growth Reminders','Weather Alerts'] },
    { val:'seller', icon:'🏪', label:t('auth.seller'), desc:'Sell agricultural products to farmers and growers', features:['Product Listings','Order Management','Revenue Analytics','Buyer Reviews'] },
  ];

  const stepIdx = STEPS.indexOf(step);

  return (
    <div className="min-h-screen flex overflow-hidden">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .float { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 relative overflow-hidden p-10">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full"/>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"/>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm">🌾</div>
          <span className="text-white text-xl font-extrabold">AgroAI</span>
        </div>

        {/* Illustration */}
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center">
          <div className="float">
            <svg viewBox="0 0 280 250" className="w-64">
              {/* Ground */}
              <ellipse cx="140" cy="230" rx="130" ry="25" fill="rgba(255,255,255,0.1)"/>
              {/* Plants row */}
              {[40,80,120,160,200,240].map((x, i) => (
                <g key={i}>
                  <line x1={x} y1="225" x2={x+(i%2?-2:2)} y2="165" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
                  <ellipse cx={x+(i%2?-2:2)} cy="160" rx="4" ry="12" fill="rgba(255,255,255,0.55)"/>
                  <ellipse cx={x+(i%2?-5:5)} cy="170" rx="3" ry="7" fill="rgba(255,255,255,0.35)"/>
                  <ellipse cx={x+(i%2?1:-1)} cy="170" rx="3" ry="7" fill="rgba(255,255,255,0.35)"/>
                </g>
              ))}
              {/* Big round tree */}
              <rect x="127" y="120" width="10" height="110" fill="rgba(255,255,255,0.3)" rx="3"/>
              <circle cx="132" cy="100" r="48" fill="rgba(255,255,255,0.15)"/>
              <circle cx="110" cy="115" r="30" fill="rgba(255,255,255,0.1)"/>
              <circle cx="154" cy="118" r="28" fill="rgba(255,255,255,0.1)"/>
              {/* Phone */}
              <rect x="168" y="50" width="70" height="110" rx="10" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              <rect x="172" y="58" width="62" height="90" rx="6" fill="rgba(255,255,255,0.08)"/>
              {/* Screen content */}
              <rect x="175" y="62" width="56" height="14" rx="4" fill="rgba(255,255,255,0.2)"/>
              <text x="203" y="73" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">AgroAI</text>
              {[0,1,2,3].map(i => (
                <rect key={i} x="175" y={80+i*10} width={28+i*6} height="4" rx="2" fill="rgba(255,255,255,0.15)"/>
              ))}
              <rect x="175" y="120" width="56" height="20" rx="4" fill="rgba(34,197,94,0.3)"/>
              <text x="203" y="134" textAnchor="middle" fontSize="9" fill="white">✓ Registered!</text>
            </svg>
          </div>
          <div className="text-center mt-4">
            <p className="text-white text-lg font-bold">Join 10 Lakh+ Farmers</p>
            <p className="text-white/60 text-sm mt-1">Start your smart farming journey today</p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="relative z-10 space-y-3">
          {[
            { step: 'role', label: 'Choose your role' },
            { step: 'info', label: 'Personal details' },
            { step: 'location', label: 'Location & finish' },
          ].map(({ step: s, label }, i) => (
            <div key={s} className={`flex items-center gap-3 transition-all ${stepIdx >= i ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                stepIdx > i ? 'bg-white text-green-600' : stepIdx === i ? 'bg-white/30 text-white ring-2 ring-white/60' : 'bg-white/10 text-white/50'
              }`}>
                {stepIdx > i ? '✓' : i+1}
              </div>
              <span className={`text-sm ${stepIdx === i ? 'text-white font-semibold' : 'text-white/60'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-start justify-center p-6 overflow-y-auto bg-white dark:bg-gray-950">
        <div className="w-full max-w-lg py-6">

          {/* Mobile header */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white">🌾</div>
              <span className="font-extrabold text-gray-900 dark:text-white">AgroAI</span>
            </div>
            <div className="flex gap-1.5">
              {STEPS.map((s, i) => (
                <div key={s} className={`h-2 rounded-full transition-all ${stepIdx >= i ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'} ${stepIdx === i ? 'w-6' : 'w-2'}`}/>
              ))}
            </div>
          </div>

          {/* Step: Role selection */}
          {step === 'role' && (
            <div className="fade-up">
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('auth.registerTitle')}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1.5">Choose your role to get started</p>
              </div>
              <div className="space-y-3">
                {roles.map(({ val, icon, label, desc, features }) => (
                  <button key={val} type="button" onClick={() => { set('role', val); setStep('info'); }}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md group ${
                      form.role === val ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                    }`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-all ${
                        form.role === val ? 'bg-green-100 dark:bg-green-800' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-green-50 dark:group-hover:bg-green-900/20'
                      }`}>{icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-base ${form.role === val ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>{label}</span>
                          <span className="text-gray-300 group-hover:text-green-500 transition-colors text-lg">→</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {features.map(f => (
                            <span key={f} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">{f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                {t('auth.haveAccount')}{' '}
                <Link to="/login" className="text-green-600 hover:underline font-semibold">{t('auth.login')}</Link>
              </p>
            </div>
          )}

          {/* Step: Personal info */}
          {step === 'info' && (
            <div className="fade-up">
              <button onClick={() => setStep('role')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
                ← Back
              </button>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{roles.find(r => r.val === form.role)?.icon}</span>
                  <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Your Details</h1>
                    <p className="text-sm text-gray-500">{roles.find(r => r.val === form.role)?.label} account</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('auth.name')} *</label>
                  <input type="text" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Your full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-green-500 focus:shadow-lg focus:shadow-green-100 dark:focus:shadow-green-900/20 outline-none transition-all"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('auth.email')} *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="your@email.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-green-500 focus:shadow-lg focus:shadow-green-100 dark:focus:shadow-green-900/20 outline-none transition-all"/>
                </div>
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('auth.password')} * <span className="text-xs font-normal text-gray-400">(min 8 chars)</span></label>
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} required placeholder="Min 8 characters"
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-green-500 focus:shadow-lg focus:shadow-green-100 dark:focus:shadow-green-900/20 outline-none transition-all"/>
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-4 bottom-3 text-gray-400 hover:text-gray-600">{showPass ? '🙈' : '👁️'}</button>
                  {/* Password strength */}
                  {form.password && (
                    <div className="flex gap-1 mt-2">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
                          form.password.length >= i*2 ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-yellow-400' : 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`}/>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('auth.phone')}</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-digit mobile number"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-green-500 outline-none transition-all"/>
                </div>
              </div>

              <button
                onClick={() => { if (!form.name || !form.email || !form.password) { toast.error('Fill all required fields'); return; } setStep('location'); }}
                className="w-full mt-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-200 dark:shadow-none text-base">
                Continue →
              </button>
            </div>
          )}

          {/* Step: Location */}
          {step === 'location' && (
            <div className="fade-up">
              <button onClick={() => setStep('info')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
                ← Back
              </button>
              <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Location & Language</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">We'll show you local prices and content</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('auth.state')}</label>
                  <select value={form.state} onChange={e => set('state', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-green-500 outline-none transition-all">
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('auth.district')}</label>
                  <input type="text" value={form.district} onChange={e => set('district', e.target.value)} placeholder="Your district (optional)"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-green-500 outline-none transition-all"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('auth.language')}</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {LANGS.map(l => (
                      <button key={l.code} type="button"
                        onClick={() => { set('language', l.code); i18n.changeLanguage(l.code); localStorage.setItem('lang', l.code); }}
                        className={`py-2.5 rounded-2xl text-xs font-semibold border-2 transition-all ${
                          form.language === l.code ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-300'
                        }`}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {form.role === 'seller' && (
                <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-sm text-amber-700 dark:text-amber-400">
                  ℹ️ After registration, you'll fill in your business details. Admin approval is required before selling.
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading}
                className="w-full mt-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-green-200 dark:shadow-none disabled:opacity-60 text-base">
                {loading ? 'Creating account...' : '🌾 Create Account'}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                {t('auth.haveAccount')}{' '}
                <Link to="/login" className="text-green-600 hover:underline font-semibold">{t('auth.login')}</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
