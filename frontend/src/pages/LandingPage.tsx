import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'en', label: 'English', flag: '🇬🇧', native: 'English' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳', native: 'हिंदी' },
  { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳', native: 'ગુજરાતી' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳', native: 'ਪੰਜਾਬੀ' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳', native: 'मराठी' },
];

// SVG Farm Scene illustration
function HeroIllustration() {
  return (
    <svg viewBox="0 0 600 420" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Sky gradient */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#f0fdf4" />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
        <linearGradient id="wheat1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="leafg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="sunGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* Sky */}
      <rect width="600" height="420" fill="url(#sky)" rx="20"/>
      {/* Sun */}
      <circle cx="520" cy="70" r="45" fill="url(#sunGrad)" opacity="0.7"/>
      <circle cx="520" cy="70" r="32" fill="#fbbf24" opacity="0.9"/>
      {/* Sun rays */}
      {[0,45,90,135,180,225,270,315].map((angle, i) => (
        <line key={i} x1={520 + Math.cos(angle*Math.PI/180)*38} y1={70 + Math.sin(angle*Math.PI/180)*38}
          x2={520 + Math.cos(angle*Math.PI/180)*55} y2={70 + Math.sin(angle*Math.PI/180)*55}
          stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
      ))}
      {/* Clouds */}
      <g opacity="0.85">
        <ellipse cx="120" cy="80" rx="55" ry="28" fill="white"/>
        <ellipse cx="90" cy="90" rx="35" ry="22" fill="white"/>
        <ellipse cx="155" cy="90" rx="35" ry="20" fill="white"/>
      </g>
      <g opacity="0.7">
        <ellipse cx="380" cy="55" rx="40" ry="20" fill="white"/>
        <ellipse cx="360" cy="63" rx="25" ry="16" fill="white"/>
        <ellipse cx="408" cy="62" rx="25" ry="15" fill="white"/>
      </g>
      {/* Ground */}
      <ellipse cx="300" cy="400" rx="320" ry="80" fill="url(#ground)"/>
      <rect x="0" y="340" width="600" height="80" fill="url(#ground)"/>
      {/* Rolling hills */}
      <ellipse cx="150" cy="340" rx="180" ry="50" fill="#86efac" opacity="0.6"/>
      <ellipse cx="450" cy="345" rx="170" ry="45" fill="#86efac" opacity="0.5"/>
      {/* Field rows */}
      {[0,1,2,3,4].map(i => (
        <ellipse key={i} cx={60 + i*110} cy={355 + i*4} rx="45" ry="12" fill="#4ade80" opacity="0.4"/>
      ))}

      {/* Wheat stalks left cluster */}
      {[0,1,2,3,4,5].map(i => {
        const x = 55 + i * 22;
        return (
          <g key={i}>
            <line x1={x} y1="350" x2={x + (i%2===0?-4:4)} y2="240" stroke="#92400e" strokeWidth="2.5"/>
            {/* Wheat head */}
            <ellipse cx={x + (i%2===0?-4:4)} cy="235" rx="5" ry="16" fill="url(#wheat1)" opacity="0.9"/>
            <ellipse cx={x + (i%2===0?-6:6)} cy="248" rx="4" ry="9" fill="#f59e0b" opacity="0.7"/>
            <ellipse cx={x + (i%2===0?-2:2)} cy="248" rx="4" ry="9" fill="#f59e0b" opacity="0.7"/>
          </g>
        );
      })}

      {/* Wheat stalks right cluster */}
      {[0,1,2,3,4,5].map(i => {
        const x = 440 + i * 22;
        return (
          <g key={i}>
            <line x1={x} y1="350" x2={x + (i%2===0?-3:3)} y2="245" stroke="#92400e" strokeWidth="2.5"/>
            <ellipse cx={x + (i%2===0?-3:3)} cy="240" rx="5" ry="15" fill="url(#wheat1)" opacity="0.9"/>
            <ellipse cx={x + (i%2===0?-5:5)} cy="252" rx="4" ry="8" fill="#f59e0b" opacity="0.7"/>
            <ellipse cx={x + (i%2===0?-1:1)} cy="252" rx="4" ry="8" fill="#f59e0b" opacity="0.7"/>
          </g>
        );
      })}

      {/* Big tree */}
      <rect x="268" y="260" width="14" height="90" fill="#92400e" rx="4"/>
      <circle cx="275" cy="225" r="60" fill="#16a34a" opacity="0.85"/>
      <circle cx="248" cy="240" r="38" fill="#22c55e" opacity="0.7"/>
      <circle cx="302" cy="242" r="36" fill="#15803d" opacity="0.7"/>
      <circle cx="275" cy="200" r="30" fill="#4ade80" opacity="0.5"/>

      {/* Farmhouse */}
      <rect x="190" y="275" width="75" height="65" fill="#fef3c7" rx="3"/>
      <polygon points="190,275 227.5,240 265,275" fill="#dc2626" opacity="0.85"/>
      {/* Door */}
      <rect x="215" y="305" width="20" height="35" fill="#b45309" rx="2"/>
      <circle cx="231" cy="322" r="2" fill="#fbbf24"/>
      {/* Windows */}
      <rect x="197" y="283" width="18" height="16" fill="#bae6fd" rx="2"/>
      <rect x="248" y="283" width="18" height="16" fill="#bae6fd" rx="2"/>
      <line x1="206" y1="283" x2="206" y2="299" stroke="#7dd3fc" strokeWidth="1"/>
      <line x1="197" y1="291" x2="215" y2="291" stroke="#7dd3fc" strokeWidth="1"/>

      {/* AI scan beam effect */}
      <line x1="355" y1="160" x2="275" y2="230" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.7"/>
      <circle cx="355" cy="155" r="20" fill="#0891b2" opacity="0.15"/>
      <circle cx="355" cy="155" r="12" fill="#06b6d4" opacity="0.25"/>
      <circle cx="355" cy="155" r="6" fill="#22d3ee" opacity="0.8"/>
      {/* Scan lines */}
      <rect x="340" y="148" width="30" height="14" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.5" rx="2"/>
      <line x1="340" y1="155" x2="370" y2="155" stroke="#22d3ee" strokeWidth="0.8" opacity="0.4"/>

      {/* Phone/device showing AI */}
      <rect x="330" y="120" width="50" height="80" rx="8" fill="#1e293b" opacity="0.9"/>
      <rect x="334" y="126" width="42" height="60" rx="4" fill="#0f172a"/>
      <rect x="336" y="128" width="38" height="56" rx="3" fill="#1e3a5f"/>
      {/* Screen content */}
      <rect x="338" y="131" width="35" height="8" rx="2" fill="#22c55e" opacity="0.7"/>
      <rect x="338" y="142" width="25" height="3" rx="1" fill="#94a3b8" opacity="0.5"/>
      <rect x="338" y="148" width="30" height="3" rx="1" fill="#94a3b8" opacity="0.4"/>
      <rect x="338" y="154" width="20" height="3" rx="1" fill="#94a3b8" opacity="0.3"/>
      <circle cx="355" cy="167" r="8" fill="#065f46" opacity="0.6"/>
      <text x="355" y="171" textAnchor="middle" fontSize="8" fill="#22c55e" fontWeight="bold">AI</text>

      {/* Farmer figure */}
      <circle cx="90" cy="298" r="12" fill="#fbbf24"/>
      <rect x="82" y="310" width="16" height="30" fill="#166534" rx="2"/>
      <rect x="76" y="312" width="10" height="22" fill="#166534" rx="2"/>
      <rect x="90" y="312" width="10" height="22" fill="#166534" rx="2"/>
      <rect x="82" y="340" width="7" height="15" fill="#92400e" rx="1"/>
      <rect x="91" y="340" width="7" height="15" fill="#92400e" rx="1"/>
      {/* Hat */}
      <ellipse cx="90" cy="288" rx="16" ry="5" fill="#92400e"/>
      <rect x="85" y="279" width="10" height="10" fill="#92400e" rx="2"/>

      {/* Price tag float */}
      <rect x="390" y="190" width="80" height="36" rx="10" fill="white" opacity="0.92" filter="drop-shadow(0 2px 8px rgba(0,0,0,0.12))"/>
      <text x="430" y="204" textAnchor="middle" fontSize="8" fill="#6b7280">Wheat (Gehun)</text>
      <text x="430" y="219" textAnchor="middle" fontSize="12" fill="#16a34a" fontWeight="bold">₹2,140/q</text>

      {/* Small plants / seedlings scattered */}
      {[[160,340],[480,338],[510,345],[530,332]].map(([x,y], i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={x} y2={y-18} stroke="#4ade80" strokeWidth="2"/>
          <ellipse cx={x-5} cy={y-12} rx="8" ry="5" fill="url(#leafg)" transform={`rotate(-30,${x-5},${y-12})`} opacity="0.8"/>
          <ellipse cx={x+5} cy={y-10} rx="8" ry="5" fill="url(#leafg)" transform={`rotate(30,${x+5},${y-10})`} opacity="0.8"/>
        </g>
      ))}
    </svg>
  );
}

// Feature illustration for disease scanner
function DiseaseIcon() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
      <circle cx="40" cy="40" r="38" fill="#fef2f2"/>
      <circle cx="40" cy="40" r="28" fill="#fee2e2" opacity="0.6"/>
      {/* Leaf */}
      <path d="M40 55 Q25 42 30 28 Q40 18 50 28 Q55 42 40 55Z" fill="#22c55e" opacity="0.9"/>
      <line x1="40" y1="55" x2="40" y2="28" stroke="#15803d" strokeWidth="1.5"/>
      {/* Scan crosshair */}
      <rect x="20" y="20" width="40" height="40" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5,3" rx="4"/>
      <line x1="20" y1="40" x2="60" y2="40" stroke="#ef4444" strokeWidth="1" opacity="0.5"/>
      <line x1="40" y1="20" x2="40" y2="60" stroke="#ef4444" strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}

function MandiIcon() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
      <circle cx="40" cy="40" r="38" fill="#fffbeb"/>
      <circle cx="40" cy="40" r="28" fill="#fef3c7" opacity="0.6"/>
      {/* Chart bars */}
      <rect x="18" y="50" width="10" height="16" fill="#f59e0b" rx="2"/>
      <rect x="32" y="38" width="10" height="28" fill="#fbbf24" rx="2"/>
      <rect x="46" y="30" width="10" height="36" fill="#f59e0b" rx="2"/>
      <rect x="60" y="22" width="10" height="44" fill="#d97706" rx="2"/>
      {/* Trend arrow */}
      <polyline points="18,52 32,40 46,32 65,22" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
      <polygon points="65,18 70,26 60,26" fill="#92400e"/>
      {/* Rupee */}
      <circle cx="28" cy="24" r="12" fill="#f59e0b"/>
      <text x="28" y="29" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">₹</text>
    </svg>
  );
}

function FertilizerIcon() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
      <circle cx="40" cy="40" r="38" fill="#eff6ff"/>
      <circle cx="40" cy="40" r="28" fill="#dbeafe" opacity="0.6"/>
      {/* Flask */}
      <path d="M30 20 L30 40 L18 62 Q16 66 22 66 L58 66 Q64 66 62 62 L50 40 L50 20Z" fill="#3b82f6" opacity="0.15" stroke="#3b82f6" strokeWidth="2"/>
      {/* Liquid */}
      <path d="M24 54 L56 54 L62 62 Q64 66 58 66 L22 66 Q16 66 18 62Z" fill="#60a5fa" opacity="0.5"/>
      {/* Bubbles */}
      <circle cx="35" cy="58" r="3" fill="#93c5fd" opacity="0.8"/>
      <circle cx="44" cy="55" r="2" fill="#93c5fd" opacity="0.6"/>
      <circle cx="50" cy="59" r="2.5" fill="#93c5fd" opacity="0.7"/>
      {/* Neck */}
      <rect x="33" y="14" width="14" height="8" fill="#3b82f6" opacity="0.3" rx="2"/>
      {/* Plants growing */}
      <line x1="40" y1="60" x2="40" y2="35" stroke="#22c55e" strokeWidth="2"/>
      <ellipse cx="33" cy="42" rx="8" ry="5" fill="#22c55e" transform="rotate(-20,33,42)"/>
      <ellipse cx="47" cy="40" rx="8" ry="5" fill="#16a34a" transform="rotate(20,47,40)"/>
    </svg>
  );
}

function ChatAIIcon() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
      <circle cx="40" cy="40" r="38" fill="#f0fdf4"/>
      <circle cx="40" cy="40" r="28" fill="#dcfce7" opacity="0.6"/>
      {/* Chat bubble */}
      <rect x="14" y="22" width="45" height="32" rx="8" fill="#16a34a" opacity="0.85"/>
      <polygon points="24,54 18,64 34,54" fill="#16a34a" opacity="0.85"/>
      {/* Dots */}
      <circle cx="28" cy="38" r="4" fill="white"/>
      <circle cx="40" cy="38" r="4" fill="white"/>
      <circle cx="52" cy="38" r="4" fill="white"/>
    </svg>
  );
}

function ExpenseIcon() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
      <circle cx="40" cy="40" r="38" fill="#fdf4ff"/>
      <circle cx="40" cy="40" r="28" fill="#f3e8ff" opacity="0.6"/>
      {/* Document */}
      <rect x="20" y="16" width="40" height="50" rx="4" fill="#a855f7" opacity="0.2" stroke="#a855f7" strokeWidth="1.5"/>
      <line x1="28" y1="28" x2="52" y2="28" stroke="#a855f7" strokeWidth="2" strokeLinecap="round"/>
      <line x1="28" y1="36" x2="52" y2="36" stroke="#a855f7" strokeWidth="2" strokeLinecap="round"/>
      <line x1="28" y1="44" x2="44" y2="44" stroke="#a855f7" strokeWidth="2" strokeLinecap="round"/>
      {/* Coin */}
      <circle cx="52" cy="55" r="12" fill="#a855f7"/>
      <text x="52" y="60" textAnchor="middle" fontSize="13" fill="white" fontWeight="bold">₹</text>
    </svg>
  );
}

function MarketIcon() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
      <circle cx="40" cy="40" r="38" fill="#fff7ed"/>
      <circle cx="40" cy="40" r="28" fill="#ffedd5" opacity="0.6"/>
      {/* Shop */}
      <rect x="16" y="36" width="48" height="30" rx="3" fill="#f97316" opacity="0.2" stroke="#f97316" strokeWidth="1.5"/>
      <polygon points="12,36 40,18 68,36" fill="#f97316" opacity="0.7"/>
      {/* Door */}
      <rect x="33" y="48" width="14" height="18" fill="#ea580c" rx="2" opacity="0.8"/>
      {/* Window */}
      <rect x="19" y="42" width="12" height="10" fill="#fed7aa" rx="2"/>
      <rect x="49" y="42" width="12" height="10" fill="#fed7aa" rx="2"/>
      {/* Sign */}
      <rect x="26" y="22" width="28" height="8" rx="3" fill="#f97316" opacity="0.5"/>
      <text x="40" y="29" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">SHOP</text>
    </svg>
  );
}

export function LandingPage() {
  const { t, i18n } = useTranslation();
  const [showLangBanner, setShowLangBanner] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('lang_banner_dismissed');
    if (!dismissed) setShowLangBanner(true);
  }, []);

  const changeLang = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('lang', code);
  };

  const dismissBanner = () => {
    localStorage.setItem('lang_banner_dismissed', '1');
    setShowLangBanner(false);
  };

  const features = [
    { icon: <DiseaseIcon/>, title: t('landing.featDisease'), desc: t('landing.featDiseaseSub'), color: 'border-red-100 dark:border-red-900', tag: '🔬 AI Powered' },
    { icon: <MandiIcon/>, title: t('landing.featMandi'), desc: t('landing.featMandiSub'), color: 'border-amber-100 dark:border-amber-900', tag: '📡 Live Data' },
    { icon: <FertilizerIcon/>, title: t('landing.featFertilizer'), desc: t('landing.featFertilizerSub'), color: 'border-blue-100 dark:border-blue-900', tag: '🧠 Smart Calc' },
    { icon: <ChatAIIcon/>, title: 'AI Farm Assistant', desc: 'Ask farming questions in your language anytime', color: 'border-green-100 dark:border-green-900', tag: '💬 Multilingual' },
    { icon: <ExpenseIcon/>, title: 'Expense Tracker', desc: 'Track farm costs with visual charts and reports', color: 'border-purple-100 dark:border-purple-900', tag: '📊 Analytics' },
    { icon: <MarketIcon/>, title: 'Agri Marketplace', desc: 'Buy seeds, fertilizers, tools from local sellers', color: 'border-orange-100 dark:border-orange-900', tag: '🛒 Shop Local' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">

      {/* Language banner */}
      {showLangBanner && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌍</span>
              <span className="text-sm font-medium">{t('landing.langHelper')}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {LANGS.map(l => (
                <button key={l.code} onClick={() => { changeLang(l.code); dismissBanner(); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium border border-white/30 transition-all ${
                    i18n.language === l.code ? 'bg-white text-green-700' : 'bg-white/10 hover:bg-white/20'
                  }`}>
                  {l.flag} {l.native}
                </button>
              ))}
              <button onClick={dismissBanner} className="ml-2 text-white/70 hover:text-white text-lg">✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="border-b border-gray-100 dark:border-gray-800 backdrop-blur-sm sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-green-200">🌾</div>
            <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">AgroAI</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl px-2 py-1.5">
              {LANGS.map(l => (
                <button key={l.code} onClick={() => changeLang(l.code)} title={l.label}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    i18n.language === l.code ? 'bg-green-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}>
                  {l.flag} {l.native}
                </button>
              ))}
            </div>
            <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium px-3 py-2">{t('landing.signIn')}</Link>
            <Link to="/register" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-green-200 dark:shadow-none">
              {t('landing.getStarted')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-green-100 dark:border-green-800">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              AI-Powered Farming Platform for India
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-5">
              {t('landing.hero')}
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              {t('landing.subtitle')}
            </p>
            {/* Language chips */}
            <div className="flex items-center gap-2 mb-8 flex-wrap">
              <span className="text-sm text-gray-400">{t('landing.selectLanguage')}:</span>
              {LANGS.map(l => (
                <button key={l.code} onClick={() => changeLang(l.code)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    i18n.language === l.code
                      ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/10'
                  }`}>
                  {l.flag} {l.native}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Link to="/register" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-green-200 dark:shadow-none text-base w-full sm:w-auto text-center">
                {t('landing.getStarted')} →
              </Link>
              <Link to="/login" className="border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-8 py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-base w-full sm:w-auto text-center">
                {t('landing.signIn')}
              </Link>
            </div>
            {/* Stats */}
            <div className="flex gap-6 sm:gap-8 mt-10 flex-wrap">
              {[['10L+','Farmers'], ['500+','Markets'], ['5','Languages']].map(([num, label]) => (
                <div key={label}>
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{num}</div>
                  <div className="text-xs text-gray-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Right: illustration */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl -rotate-2 scale-105" />
            <div className="relative bg-gradient-to-br from-sky-50 to-green-50 dark:from-sky-900/20 dark:to-green-900/20 rounded-3xl overflow-hidden border border-green-100 dark:border-green-800 p-2 shadow-2xl shadow-green-100">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile hero illustration */}
      <section className="lg:hidden px-4 mb-4">
        <div className="bg-gradient-to-br from-sky-50 to-green-50 dark:from-sky-900/20 dark:to-green-900/20 rounded-2xl overflow-hidden border border-green-100 dark:border-green-800 p-2">
          <HeroIllustration />
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">{t('landing.features')}</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Everything you need to farm smarter, earn better, and grow faster</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon, title, desc, color, tag }) => (
              <div key={title} className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 ${color} hover:shadow-lg transition-all hover:-translate-y-1 group`}>
                <div className="flex items-start justify-between mb-3">
                  {icon}
                  <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full">{tag}</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 text-base">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section with illustrations */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Built for everyone in agriculture</h2>
          <p className="text-gray-500 dark:text-gray-400">One platform, four roles — each with a personalized experience</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { emoji: '👨‍🌾', role: 'Farmer', desc: 'Track expenses, mandi prices, crop health & AI advice', bg: 'from-green-500 to-emerald-500', light: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' },
            { emoji: '🏡', role: 'Home Grower', desc: 'Plant reminders, disease scanner, care guides', bg: 'from-blue-500 to-indigo-500', light: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800' },
            { emoji: '🏪', role: 'Seller', desc: 'List products, manage orders, track earnings', bg: 'from-purple-500 to-violet-500', light: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800' },
            { emoji: '⚙️', role: 'Admin', desc: 'Manage sellers, users and platform analytics', bg: 'from-amber-500 to-orange-500', light: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800' },
          ].map(({ emoji, role, desc, bg, light }) => (
            <div key={role} className={`rounded-2xl border-2 p-5 ${light} hover:shadow-lg transition-all hover:-translate-y-1`}>
              <div className={`w-12 h-12 bg-gradient-to-br ${bg} rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-md`}>{emoji}</div>
              <div className="font-bold text-gray-900 dark:text-white text-base mb-1.5">{role}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-4 mb-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-10 text-center text-white relative overflow-hidden shadow-2xl shadow-green-200 dark:shadow-none">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="relative">
            <div className="text-4xl mb-4">🌾</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Ready to grow smarter?</h2>
            <p className="text-green-100 mb-6 max-w-md mx-auto text-sm">Join thousands of farmers using AgroAI to boost their yield and earnings</p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-8 py-3.5 rounded-2xl hover:bg-green-50 transition-all shadow-lg text-sm">
              Start for Free → 
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile floating language */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <div className="bg-green-600 rounded-2xl shadow-xl p-2.5">
          <div className="flex gap-1 flex-wrap max-w-xs">
            {LANGS.map(l => (
              <button key={l.code} onClick={() => changeLang(l.code)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  i18n.language === l.code ? 'bg-white text-green-700' : 'text-white/80 hover:text-white'
                }`}>
                {l.flag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} AgroAI — Empowering Indian Farmers with AI 🌾
        </div>
      </footer>
    </div>
  );
}
