import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'en', label: 'English', flag: '🇬🇧', native: 'EN' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳', native: 'HI' },
  { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳', native: 'GU' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳', native: 'PA' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳', native: 'MR' },
];

// ── Animated Bird Canvas Background ──────────────────────────────────────────
function BirdCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Bird class - simple V-shape flapping birds
    class Bird {
      x: number; y: number; speed: number;
      wingAngle: number; wingDir: number;
      size: number; opacity: number;
      waveOffset: number; waveAmp: number; waveSpeed: number;

      constructor() {
        this.x = Math.random() * -200 - 50;
        this.y = Math.random() * (canvas.height * 0.65) + 30;
        this.speed = 0.4 + Math.random() * 0.6;
        this.wingAngle = Math.random() * Math.PI;
        this.wingDir = 1;
        this.size = 6 + Math.random() * 10;
        this.opacity = 0.15 + Math.random() * 0.35;
        this.waveOffset = Math.random() * Math.PI * 2;
        this.waveAmp = 10 + Math.random() * 20;
        this.waveSpeed = 0.01 + Math.random() * 0.015;
      }

      reset() {
        this.x = -60;
        this.y = Math.random() * (canvas.height * 0.65) + 30;
        this.speed = 0.4 + Math.random() * 0.6;
        this.size = 6 + Math.random() * 10;
        this.opacity = 0.15 + Math.random() * 0.35;
        this.waveOffset = Math.random() * Math.PI * 2;
        this.waveAmp = 10 + Math.random() * 20;
      }

      update(frame: number) {
        this.x += this.speed;
        const waveY = Math.sin(frame * this.waveSpeed + this.waveOffset) * this.waveAmp;
        this.wingAngle += 0.08 * this.wingDir;
        if (this.wingAngle > 0.7) this.wingDir = -1;
        if (this.wingAngle < -0.1) this.wingDir = 1;
        return waveY;
      }

      draw(ctx: CanvasRenderingContext2D, frame: number) {
        const waveY = this.update(frame);
        const bx = this.x;
        const by = this.y + waveY;
        const s = this.size;
        const wing = Math.sin(this.wingAngle) * s * 1.2;

        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = s * 0.18;
        ctx.lineCap = 'round';

        // Left wing
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx - s * 0.8, by - wing, bx - s * 1.6, by - wing * 0.3);
        ctx.stroke();

        // Right wing
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + s * 0.8, by - wing, bx + s * 1.6, by - wing * 0.3);
        ctx.stroke();

        ctx.restore();

        if (this.x > canvas.width + 80) this.reset();
      }
    }

    const birds: Bird[] = Array.from({ length: 22 }, () => {
      const b = new Bird();
      b.x = Math.random() * canvas.width; // start spread out
      return b;
    });

    let frame = 0;
    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      birds.forEach(b => b.draw(ctx, frame));
      frame++;
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// ── Feature Icons ─────────────────────────────────────────────────────────────
function DiseaseIcon() {
  return (
    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-3">
      <svg viewBox="0 0 40 40" className="w-7 h-7">
        <circle cx="20" cy="20" r="14" fill="#fecaca" stroke="#ef4444" strokeWidth="1.5"/>
        <ellipse cx="20" cy="20" rx="5" ry="14" fill="#fca5a5" stroke="#ef4444" strokeWidth="1"/>
        <line x1="6" y1="20" x2="34" y2="20" stroke="#ef4444" strokeWidth="1"/>
        <circle cx="20" cy="20" r="3" fill="#ef4444"/>
        <path d="M20 6 Q24 14 20 20 Q16 26 20 34" fill="none" stroke="#dc2626" strokeWidth="1.2"/>
      </svg>
    </div>
  );
}
function MandiIcon() {
  return (
    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mb-3">
      <svg viewBox="0 0 40 40" className="w-7 h-7">
        <rect x="6" y="28" width="5" height="8" rx="1" fill="#f59e0b"/>
        <rect x="13" y="22" width="5" height="14" rx="1" fill="#fbbf24"/>
        <rect x="20" y="16" width="5" height="20" rx="1" fill="#f59e0b"/>
        <rect x="27" y="10" width="5" height="26" rx="1" fill="#d97706"/>
        <path d="M8 28 L15 22 L22 16 L29 10" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="8" cy="28" r="2" fill="#92400e"/>
        <circle cx="15" cy="22" r="2" fill="#92400e"/>
        <circle cx="22" cy="16" r="2" fill="#92400e"/>
        <circle cx="29" cy="10" r="2" fill="#92400e"/>
      </svg>
    </div>
  );
}
function FertilizerIcon() {
  return (
    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-3">
      <svg viewBox="0 0 40 40" className="w-7 h-7">
        <rect x="14" y="8" width="12" height="18" rx="3" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1.5"/>
        <path d="M14 16 Q20 12 26 16" fill="#93c5fd" stroke="#3b82f6" strokeWidth="1"/>
        <line x1="20" y1="26" x2="20" y2="34" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 30 Q20 28 24 30" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="13" cy="10" r="2.5" fill="#60a5fa"/>
        <circle cx="27" cy="10" r="2.5" fill="#60a5fa"/>
      </svg>
    </div>
  );
}
function ChatAIIcon() {
  return (
    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mb-3">
      <svg viewBox="0 0 40 40" className="w-7 h-7">
        <rect x="5" y="8" width="24" height="18" rx="5" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5"/>
        <path d="M10 30 L8 36 L16 30" fill="#16a34a"/>
        <circle cx="30" cy="26" r="7" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/>
        <text x="30" y="30" textAnchor="middle" fontSize="8" fill="#14532d" fontWeight="bold">AI</text>
        <line x1="10" y1="15" x2="22" y2="15" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="10" y1="20" x2="18" y2="20" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  );
}
function ExpenseIcon() {
  return (
    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-3">
      <svg viewBox="0 0 40 40" className="w-7 h-7">
        <rect x="7" y="7" width="26" height="28" rx="4" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.5"/>
        <line x1="12" y1="15" x2="28" y2="15" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="12" y1="21" x2="22" y2="21" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="12" y1="27" x2="25" y2="27" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="28" cy="28" r="6" fill="#7c3aed"/>
        <text x="28" y="31" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">₹</text>
      </svg>
    </div>
  );
}
function MarketIcon() {
  return (
    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mb-3">
      <svg viewBox="0 0 40 40" className="w-7 h-7">
        <path d="M8 14 L10 8 L30 8 L32 14 Q32 19 26 19 Q22 19 20 16 Q18 19 14 19 Q8 19 8 14Z" fill="#fed7aa" stroke="#f97316" strokeWidth="1.5"/>
        <rect x="10" y="19" width="20" height="14" rx="2" fill="#ffedd5" stroke="#f97316" strokeWidth="1.2"/>
        <rect x="16" y="24" width="8" height="9" rx="1" fill="#fb923c"/>
        <line x1="10" y1="23" x2="30" y2="23" stroke="#f97316" strokeWidth="1"/>
      </svg>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function LandingPage() {
  const { t, i18n } = useTranslation();
  const [showLangBanner, setShowLangBanner] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('lang_banner_dismissed');
    if (!dismissed) setShowLangBanner(true);
  }, []);

  const changeLang = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('preferred_lang', code);
  };

  const dismissBanner = () => {
    setShowLangBanner(false);
    localStorage.setItem('lang_banner_dismissed', '1');
  };

  const features = [
    { icon: <DiseaseIcon />, title: t('landing.featDisease'), desc: t('landing.featDiseaseSub'), color: 'border-red-100 dark:border-red-900', tag: '🔬 AI' },
    { icon: <MandiIcon />, title: t('landing.featMandi'), desc: t('landing.featMandiSub'), color: 'border-amber-100 dark:border-amber-900', tag: '📡 Live' },
    { icon: <FertilizerIcon />, title: t('landing.featFertilizer'), desc: t('landing.featFertilizerSub'), color: 'border-blue-100 dark:border-blue-900', tag: '🧠 Smart' },
    { icon: <ChatAIIcon />, title: 'AI Farm Assistant', desc: 'Ask farming questions in your language anytime', color: 'border-green-100 dark:border-green-900', tag: '💬 Chat' },
    { icon: <ExpenseIcon />, title: 'Expense Tracker', desc: 'Track farm costs with visual charts and reports', color: 'border-purple-100 dark:border-purple-900', tag: '📊 Track' },
    { icon: <MarketIcon />, title: 'Agri Marketplace', desc: 'Buy seeds, fertilizers, tools from verified sellers', color: 'border-orange-100 dark:border-orange-900', tag: '🛒 Shop' },
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
                  {l.flag} {l.label}
                </button>
              ))}
              <button onClick={dismissBanner} className="ml-2 text-white/70 hover:text-white text-lg">✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="border-b border-gray-100 dark:border-gray-800 backdrop-blur-sm sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-green-200">🌾</div>
            <span className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">AgroAI</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Language — desktop only */}
            <div className="hidden md:flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-2 py-1">
              {LANGS.map(l => (
                <button key={l.code} onClick={() => changeLang(l.code)} title={l.label}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    i18n.language === l.code ? 'bg-green-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}>
                  {l.flag} {l.native}
                </button>
              ))}
            </div>
            <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium px-3 py-2">{t('landing.signIn')}</Link>
            <Link to="/register" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-green-200 dark:shadow-none">
              {t('landing.getStarted')}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO with Bird Animation ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50/80 via-emerald-50/40 to-white dark:from-green-950/30 dark:via-gray-950 dark:to-gray-950">
        {/* Bird Canvas */}
        <BirdCanvas />

        {/* Subtle ground line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-200 to-transparent dark:via-green-800 opacity-50" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-12 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-green-200 dark:border-green-800">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            AI-Powered Farming Platform for India
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4 px-2">
            {t('landing.hero')}
          </h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-xl mx-auto px-4">
            {t('landing.subtitle')}
          </p>

          {/* Language chips */}
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap px-4">
            <span className="text-sm text-gray-400">{t('landing.selectLanguage')}:</span>
            {LANGS.map(l => (
              <button key={l.code} onClick={() => changeLang(l.code)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  i18n.language === l.code
                    ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/10'
                }`}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
            <Link to="/register" className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-green-200 dark:shadow-none text-base text-center">
              {t('landing.getStarted')} →
            </Link>
            <Link to="/login" className="w-full sm:w-auto border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-8 py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-base text-center">
              {t('landing.signIn')}
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-10 flex-wrap">
            {[['10L+', 'Farmers'], ['500+', 'Markets'], ['5', 'Languages']].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{num}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────────────────────────────── */}
      <section className="bg-gray-50 dark:bg-gray-900 py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('landing.features')}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">Everything you need to farm smarter, earn better, and grow faster</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon, title, desc, color, tag }) => (
              <div key={title} className={`bg-white dark:bg-gray-800 rounded-2xl p-4 border-2 ${color} hover:shadow-lg transition-all hover:-translate-y-1`}>
                {icon}
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug">{title}</h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed hidden sm:block">{desc}</p>
                <span className="inline-block text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full mt-2">{tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles Section (no Admin) ───────────────────────────────────────── */}
      <section className="py-14 max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Built for everyone in agriculture</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">One platform, three roles — each with a personalized experience</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { emoji: '👨‍🌾', role: 'Farmer', desc: 'Track expenses, mandi prices, crop health & AI advice', bg: 'from-green-500 to-emerald-500', light: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' },
            { emoji: '🏡', role: 'Home Grower', desc: 'Plant reminders, disease scanner, care guides', bg: 'from-blue-500 to-indigo-500', light: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800' },
            { emoji: '🏪', role: 'Seller', desc: 'List products, manage orders, track earnings', bg: 'from-purple-500 to-violet-500', light: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800' },
          ].map(({ emoji, role, desc, bg, light }) => (
            <div key={role} className={`rounded-2xl border-2 p-6 ${light} hover:shadow-lg transition-all hover:-translate-y-1`}>
              <div className={`w-14 h-14 bg-gradient-to-br ${bg} rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-md`}>{emoji}</div>
              <div className="font-bold text-gray-900 dark:text-white text-base mb-1.5">{role}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────────── */}
      <section className="mx-4 mb-14">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-10 text-center text-white relative overflow-hidden shadow-2xl shadow-green-200 dark:shadow-none">
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
      <div className="fixed bottom-6 right-4 z-40 md:hidden">
        <div className="bg-green-600/90 backdrop-blur-sm rounded-2xl shadow-xl p-2">
          <div className="flex gap-1 flex-wrap max-w-[160px]">
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