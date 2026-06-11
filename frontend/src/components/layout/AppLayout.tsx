import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch, logout } from '../../store';

const LANG_OPTIONS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
];

function NavItem({ to, icon, label, badge }: { to: string; icon: string; label: string; badge?: number }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}>
      <span className="text-base">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge ? <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{badge}</span> : null}
    </Link>
  );
}


function BottomNav({ items }: { items: { to: string; icon: string; label: string; badge?: number }[] }) {
  const { pathname } = useLocation();
  const displayItems = items.slice(0, 5);
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-1 pt-1 pb-2">
      <div className="flex items-center justify-around">
        {displayItems.map(item => {
          const active = pathname === item.to;
          return (
            <Link key={item.to} to={item.to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all relative min-w-0 flex-1 ${
                active ? 'text-green-600' : 'text-gray-400'
              }`}>
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-medium leading-none truncate w-full text-center">{item.label}</span>
              {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-green-600 rounded-full" />}
              {item.badge ? <span className="absolute top-0.5 right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center">{item.badge}</span> : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppLayout() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((s: RootState) => s.auth);
  const { notifications } = useSelector((s: RootState) => s.notifications || { notifications: [] });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const unread = notifications?.filter((n: any) => !n.isRead).length || 0;

  const changeLang = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('lang', code);
    setLangOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Role-based navigation
  const role = user?.role;

  const farmerNav = [
    { to: '/dashboard', icon: '🏠', label: t('nav.dashboard') },
    { to: '/disease-scanner', icon: '🔬', label: t('nav.diseaseScanner') },
    { to: '/mandi-prices', icon: '📈', label: t('nav.mandiPrices') },
    { to: '/expenses', icon: '🧾', label: t('nav.expenses') },
    { to: '/marketplace', icon: '🛒', label: t('nav.marketplace') },
    { to: '/orders', icon: '📦', label: t('nav.orders') },
    { to: '/fertilizer-calculator', icon: '🧪', label: t('nav.fertilizer') },
    { to: '/ai-chat', icon: '🤖', label: t('nav.aiChat') },
  ];

  const homegrowerNav = [
    { to: '/dashboard', icon: '🏠', label: t('nav.dashboard') },
    { to: '/home-grower', icon: '🌱', label: t('nav.plantCare') },
    { to: '/disease-scanner', icon: '🔬', label: t('nav.diseaseScanner') },
    { to: '/marketplace', icon: '🛒', label: t('nav.marketplace') },
    { to: '/orders', icon: '📦', label: t('nav.orders') },
    { to: '/ai-chat', icon: '🤖', label: t('nav.aiChat') },
    { to: '/fertilizer-calculator', icon: '🧪', label: t('nav.fertilizer') },
  ];

  const sellerNav = [
    { to: '/dashboard', icon: '🏠', label: t('nav.sellerDashboard') },
    { to: '/seller/status', icon: '📋', label: t('nav.sellerStatus') },
    { to: '/ai-chat', icon: '🤖', label: t('nav.aiChat') },
  ];

  const adminNav = [
    { to: '/dashboard', icon: '🏠', label: t('nav.dashboard') },
    { to: '/admin', icon: '⚙️', label: t('nav.admin') },
    { to: '/mandi-prices', icon: '📈', label: t('nav.mandiPrices') },
    { to: '/ai-chat', icon: '🤖', label: t('nav.aiChat') },
  ];

  const navItems = role === 'seller' ? sellerNav : role === 'admin' ? adminNav : role === 'homegrower' ? homegrowerNav : farmerNav;
  const currentLang = LANG_OPTIONS.find(l => l.code === i18n.language) || LANG_OPTIONS[0];

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'fixed inset-0 z-50 flex' : 'hidden lg:flex'} flex-col`}>
      {mobile && <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />}
      <div className={`${mobile ? 'relative w-64' : 'w-60'} bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col h-full`}>
        {/* Logo */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">🌾</div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">AgroAI</span>
          </Link>
          {/* Role badge */}
          <div className="mt-3 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-lg inline-flex items-center gap-1.5">
            <span className="text-xs font-medium text-green-700 dark:text-green-400 capitalize">{role}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* User profile + lang */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
          {/* Language */}
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
              <span>{currentLang.flag}</span>
              <span className="flex-1 text-left">{currentLang.label}</span>
              <span className="text-xs opacity-50">▼</span>
            </button>
            {langOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-10">
                {LANG_OPTIONS.map(lang => (
                  <button key={lang.code} onClick={() => changeLang(lang.code)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      i18n.language === lang.code ? 'text-green-600 font-medium' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                    <span>{lang.flag}</span><span>{lang.label}</span>
                    {i18n.language === lang.code && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</div>
              <div className="text-xs text-gray-400 truncate">{user?.email}</div>
            </div>
          </div>

          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <span>🚪</span><span>{t('auth.logout')}</span>
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex-shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">🌾</div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">AgroAI</span>
          </Link>
          <div className="mt-3 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-lg inline-flex">
            <span className="text-xs font-medium text-green-700 dark:text-green-400 capitalize">{role}</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => <NavItem key={item.to} {...item} />)}
        </nav>
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
              <span>{currentLang.flag}</span>
              <span className="flex-1 text-left">{currentLang.label}</span>
              <span className="text-xs opacity-50">▼</span>
            </button>
            {langOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-10">
                {LANG_OPTIONS.map(lang => (
                  <button key={lang.code} onClick={() => changeLang(lang.code)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      i18n.language === lang.code ? 'text-green-600 font-medium' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                    <span>{lang.flag}</span><span>{lang.label}</span>
                    {i18n.language === lang.code && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</div>
              <div className="text-xs text-gray-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <span>🚪</span><span>{t('auth.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && <Sidebar mobile />}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 gap-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            ☰
          </button>
          <div className="flex-1" />
          <Link to="/notifications" className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            🔔
            {unread > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">{unread}</span>}
          </Link>
          {/* Mobile lang button */}
          <div className="relative lg:hidden">
            <button onClick={() => setLangOpen(!langOpen)} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-base">
              {currentLang.flag}
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50 w-40">
                {LANG_OPTIONS.map(lang => (
                  <button key={lang.code} onClick={() => changeLang(lang.code)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      i18n.language === lang.code ? 'text-green-600 font-medium' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                    <span>{lang.flag}</span><span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav items={navItems} />
    </div>
  );
}
