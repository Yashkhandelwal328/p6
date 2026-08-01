import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import type { StaffRole } from '@/types';
import { LandingPage } from '@/pages/LandingPage';
import { PublicRestaurantPage } from '@/pages/customer/PublicRestaurantPage';
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
import { SuperAdminDashboard } from '@/pages/admin/SuperAdminDashboard';
import { SuperAdminRestaurants } from '@/pages/admin/SuperAdminRestaurants';
import { SuperAdminRestaurantDetails } from '@/pages/admin/SuperAdminRestaurantDetails';
import { SuperAdminLeads } from '@/pages/admin/SuperAdminLeads';
import { SuperAdminLayout } from '@/components/admin/SuperAdminLayout';
import { SubscriptionManagement } from '@/pages/admin/SubscriptionManagement';
import { MediaManagement } from '@/pages/admin/MediaManagement';
import { SeoHead } from '@/components/SeoHead';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: StaffRole[] }) {
  const { session, staff, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  if (allowedRoles && staff && !allowedRoles.includes(staff.role)) {
    return <Navigate to="/owner/dashboard" replace />;
  }
  return <>{children}</>;
}

function TenantRouter() {
  const { restaurant, error, loading } = useTheme();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // 13. ERROR PAGES - Custom 404
  if (error === 'not_found' || !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center text-center p-4">
        <div>
          <h1 className="font-serif text-4xl text-gradient-gold mb-2">Restaurant Not Found</h1>
          <p className="text-ink-400 mb-6">The restaurant you are looking for does not exist or has been removed.</p>
          <a href="/" className="btn-gold !py-2">Go to Platform Home</a>
        </div>
      </div>
    );
  }

  // 9. PUBLISH / UNPUBLISH STATUS
  if (restaurant.website_status === 'draft') {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center text-center p-4">
        <div>
          <h1 className="font-serif text-4xl text-gradient-gold mb-2">Coming Soon</h1>
          <p className="text-ink-400">This restaurant is not yet open. Please check back later!</p>
        </div>
      </div>
    );
  }

  if (restaurant.website_status === 'maintenance') {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center text-center p-4">
        <div>
          <h1 className="font-serif text-4xl text-gradient-gold mb-2">Maintenance Mode</h1>
          <p className="text-ink-400">We'll be back soon.</p>
        </div>
      </div>
    );
  }

  if (restaurant.website_status === 'suspended') {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center text-center p-4">
        <div>
          <h1 className="font-serif text-4xl text-red-500 mb-2">Restaurant Unavailable</h1>
          <p className="text-ink-400">This restaurant is currently unavailable.</p>
        </div>
      </div>
    );
  }

  // Tenant Routes: these are rendered relative to /:slug or root (if custom domain)
  // Actually, since React Router matches from the URL, if we are inside a wildcard route `/:slug/*`,
  // we can use relative routes. But `react-router-dom` v6 `<Routes>` here would be relative to `/:slug`.
  return (
    <>
      <SeoHead />
      <Routes>
        <Route path="/" element={<PublicRestaurantPage />} />
        <Route path="/menu" element={<OrderPage />} />
        <Route path="/order/status/:orderId" element={<OrderStatusPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function MainPlatformRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<SignupPage />} />
      
      {/* Super Admin - Accessible only to super_admin role */}
      <Route path="/sup" element={
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/sup/dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="restaurants" element={<SuperAdminRestaurants />} />
        <Route path="restaurants/:id" element={<SuperAdminRestaurantDetails />} />
        <Route path="leads" element={<SuperAdminLeads />} />
      </Route>

      {/* Protected owner routes */}
      <Route path="/owner" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
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
        <Route path="media" element={<ProtectedRoute allowedRoles={['super_admin', 'owner', 'manager']}><MediaManagement /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute allowedRoles={['super_admin', 'owner']}><RestaurantSettings /></ProtectedRoute>} />
        <Route path="billing" element={<ProtectedRoute allowedRoles={['super_admin', 'owner']}><SubscriptionManagement /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute allowedRoles={['super_admin', 'owner', 'manager', 'cashier']}><ReportsPage /></ProtectedRoute>} />
      </Route>

      {/* Dynamic Tenant Routing: Matches /pizza-palace, /burger-house, etc. */}
      {/* It will match anything that wasn't matched above, effectively acting as a fallback for tenant slugs. */}
      <Route path="/:slug/*" element={<TenantRouter />} />
      
      {/* Fallback for completely unrecognized routes at the root that aren't slugs */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppContent() {
  const { isCustomDomain } = useTheme();

  // If custom domain, we mount the TenantRouter at the absolute root and bypass SaaS platform routes
  if (isCustomDomain) {
    return (
      <Routes>
        <Route path="/*" element={<TenantRouter />} />
      </Routes>
    );
  }

  // Standard SaaS Platform Router
  return <MainPlatformRouter />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
