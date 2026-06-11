import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { FarmerDashboard } from './dashboards/FarmerDashboard';
import { SellerDashboardPage } from './SellerDashboardPage';
import { HomeGrowerDashboard } from './dashboards/HomeGrowerDashboard';
import { AdminDashboardPage } from './AdminDashboardPage';

export function DashboardPage() {
  const { user } = useSelector((s: RootState) => s.auth);
  const role = user?.role;

  if (role === 'seller') return <SellerDashboardPage />;
  if (role === 'admin') return <AdminDashboardPage />;
  if (role === 'homegrower') return <HomeGrowerDashboard />;
  return <FarmerDashboard />;
}
