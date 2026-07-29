import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import type { StaffRole } from '@/types';
import { LandingPage } from '@/pages/LandingPage';
import { OrderPage } from '@/pages/customer/OrderPage';
import { OrderStatusPage } from '@/pages/customer/OrderStatusPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { OwnerDashboard } from '@/pages/dashboard/OwnerDashboard';
import { KitchenDashboard } from '@/pages/dashboard/KitchenDashboard';
import { WaiterDashboard } from '@/pages/dashboard/WaiterDashboard';
import { MenuManagement } from '@/pages/admin/MenuManagement';
import { CategoryManagement } from '@/pages/admin/CategoryManagement';
import { TableManagement } from '@/pages/admin/TableManagement';
import { QRCodeGenerator } from '@/pages/admin/QRCodeGenerator';
import { CustomerManagement } from '@/pages/admin/CustomerManagement';
import { StaffManagement } from '@/pages/admin/StaffManagement';
import { RestaurantSettings } from '@/pages/admin/RestaurantSettings';
import { ReportsPage } from '@/pages/admin/ReportsPage';
import { OrdersPage } from '@/pages/dashboard/OrdersPage';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: StaffRole[] }) {
  const { session, staff, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-nirvana-400/30 border-t-nirvana-400 rounded-full animate-spin" />
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  if (allowedRoles && staff && !allowedRoles.includes(staff.role)) {
    return <Navigate to="/owner/dashboard" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/order" element={<OrderPage />} />
      <Route path="/order/status/:orderId" element={<OrderStatusPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<SignupPage />} />

      {/* Protected owner routes */}
      <Route
        path="/owner"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/owner/dashboard" replace />} />
        <Route path="dashboard" element={<ProtectedRoute allowedRoles={['super_admin', 'owner', 'manager', 'cashier']}><OwnerDashboard /></ProtectedRoute>} />
        <Route path="kitchen" element={<ProtectedRoute allowedRoles={['super_admin', 'owner', 'manager', 'chef']}><KitchenDashboard /></ProtectedRoute>} />
        <Route path="waiter" element={<ProtectedRoute allowedRoles={['super_admin', 'owner', 'manager', 'waiter']}><WaiterDashboard /></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute allowedRoles={['super_admin', 'owner', 'manager', 'chef', 'waiter', 'cashier']}><OrdersPage /></ProtectedRoute>} />
        <Route path="menu" element={<ProtectedRoute allowedRoles={['super_admin', 'owner', 'manager']}><MenuManagement /></ProtectedRoute>} />
        <Route path="categories" element={<ProtectedRoute allowedRoles={['super_admin', 'owner', 'manager']}><CategoryManagement /></ProtectedRoute>} />
        <Route path="tables" element={<ProtectedRoute allowedRoles={['super_admin', 'owner', 'manager']}><TableManagement /></ProtectedRoute>} />
        <Route path="qr-codes" element={<ProtectedRoute allowedRoles={['super_admin', 'owner', 'manager']}><QRCodeGenerator /></ProtectedRoute>} />
        <Route path="customers" element={<ProtectedRoute allowedRoles={['super_admin', 'owner', 'manager', 'cashier']}><CustomerManagement /></ProtectedRoute>} />
        <Route path="staff" element={<ProtectedRoute allowedRoles={['super_admin', 'owner']}><StaffManagement /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute allowedRoles={['super_admin', 'owner']}><RestaurantSettings /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute allowedRoles={['super_admin', 'owner', 'manager', 'cashier']}><ReportsPage /></ProtectedRoute>} />
      </Route>

      {/* Legacy redirect */}
      <Route path="/dashboard" element={<Navigate to="/owner/dashboard" replace />} />
      <Route path="/dashboard/*" element={<Navigate to="/owner/dashboard" replace />} />
      <Route path="/signup" element={<Navigate to="/register" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
