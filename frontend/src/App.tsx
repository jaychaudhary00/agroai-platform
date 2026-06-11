import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

import { store, RootState, AppDispatch, fetchMe } from './store';
import { AppLayout } from './components/layout/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { DiseaseScannerPage } from './pages/DiseaseScannerPage';
import { FertilizerCalculatorPage } from './pages/FertilizerCalculatorPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { OrdersPage } from './pages/OrdersPage';
import { ExpenseTrackerPage } from './pages/ExpenseTrackerPage';
import { MandiPricesPage } from './pages/MandiPricesPage';
import { HomeGrowerPage } from './pages/HomeGrowerPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AIChatPage } from './pages/AIChatPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SellerRegisterPage } from './pages/SellerRegisterPage';
import { SellerStatusPage } from './pages/SellerStatusPage';
import { CheckoutPage } from './pages/CheckoutPage';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, token } = useSelector((s: RootState) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { token } = useSelector((s: RootState) => s.auth);
  return token ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function AppInner() {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((s: RootState) => s.auth);
  const { theme } = useSelector((s: RootState) => s.ui);

  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);
  useEffect(() => { if (token) dispatch(fetchMe()); }, [token, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/disease-scanner" element={<DiseaseScannerPage />} />
          <Route path="/fertilizer-calculator" element={<FertilizerCalculatorPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/:id" element={<ProductDetailPage />} />
          <Route path="/orders" element={<ProtectedRoute roles={['farmer','homegrower']}><OrdersPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute roles={['farmer','homegrower']}><CheckoutPage /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute roles={['farmer']}><ExpenseTrackerPage /></ProtectedRoute>} />
          <Route path="/mandi-prices" element={<ProtectedRoute roles={['farmer','admin']}><MandiPricesPage /></ProtectedRoute>} />
          <Route path="/home-grower" element={<ProtectedRoute roles={['homegrower','farmer']}><HomeGrowerPage /></ProtectedRoute>} />
          <Route path="/ai-chat" element={<AIChatPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/seller/register" element={<ProtectedRoute roles={['seller']}><SellerRegisterPage /></ProtectedRoute>} />
          <Route path="/seller/status" element={<ProtectedRoute roles={['seller']}><SellerStatusPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <AppInner />
        <Toaster position="top-right" toastOptions={{
          duration: 4000,
          style: { borderRadius: '10px', fontSize: '14px' },
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
        }} />
      </HelmetProvider>
    </Provider>
  );
}
