import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ChefHat,
  BellRing,
  ClipboardList,
  UtensilsCrossed,
  FolderTree,
  Table2,
  QrCode,
  Users,
  UserCog,
  Settings,
  FileBarChart,
  LogOut,
  Menu,
  X,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { StaffRole } from '@/types';

interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  roles: StaffRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '', icon: LayoutDashboard, roles: ['super_admin', 'owner', 'manager', 'cashier'] },
  { label: 'Kitchen', path: 'kitchen', icon: ChefHat, roles: ['super_admin', 'owner', 'manager', 'chef'] },
  { label: 'Waiter', path: 'waiter', icon: BellRing, roles: ['super_admin', 'owner', 'manager', 'waiter'] },
  { label: 'Orders', path: 'orders', icon: ClipboardList, roles: ['super_admin', 'owner', 'manager', 'chef', 'waiter', 'cashier'] },
  { label: 'Menu', path: 'menu', icon: UtensilsCrossed, roles: ['super_admin', 'owner', 'manager'] },
  { label: 'Categories', path: 'categories', icon: FolderTree, roles: ['super_admin', 'owner', 'manager'] },
  { label: 'Tables', path: 'tables', icon: Table2, roles: ['super_admin', 'owner', 'manager'] },
  { label: 'QR Codes', path: 'qr-codes', icon: QrCode, roles: ['super_admin', 'owner', 'manager'] },
  { label: 'Customers', path: 'customers', icon: Users, roles: ['super_admin', 'owner', 'manager', 'cashier'] },
  { label: 'Staff', path: 'staff', icon: UserCog, roles: ['super_admin', 'owner'] },
  { label: 'Settings', path: 'settings', icon: Settings, roles: ['super_admin', 'owner'] },
  { label: 'Reports', path: 'reports', icon: FileBarChart, roles: ['super_admin', 'owner', 'manager', 'cashier'] },
];

export function DashboardLayout() {
  const { staff, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userRole = staff?.role ?? 'owner';
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  const currentPath = location.pathname.replace('/owner', '').replace(/^\//, '');

  function isActive(path: string) {
    if (path === '') return currentPath === '';
    return currentPath === path;
  }

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 glass-dark border-r border-nirvana-400/10 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-5 border-b border-nirvana-400/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                <img src="/logo.jpeg" alt="The Infinito Cafe & Restaurants Logo" className="w-full h-full object-contain p-1" />
              </div>
              <div>
                <h1 className="font-serif text-lg text-gradient-gold leading-tight">The Infinito Cafe & Restaurants</h1>
                <p className="text-xs text-ink-400">Family Restaurant</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto scrollbar-luxury px-3 py-4 space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(`/owner${item.path ? `/${item.path}` : ''}`);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-gradient-gold text-ink-950 shadow-gold'
                      : 'text-ink-300 hover:bg-white/5 hover:text-nirvana-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="px-3 py-4 border-t border-nirvana-400/10">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-9 h-9 rounded-full bg-nirvana-400/15 flex items-center justify-center">
                <span className="text-nirvana-300 font-semibold text-sm">
                  {staff?.name?.charAt(0).toUpperCase() ?? 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-100 truncate">{staff?.name ?? 'Admin'}</p>
                <p className="text-xs text-ink-400 capitalize">{userRole.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-ink-950/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <header className="lg:hidden glass-dark border-b border-nirvana-400/10 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center glass rounded-lg">
            {sidebarOpen ? <X className="w-5 h-5 text-ink-300" /> : <Menu className="w-5 h-5 text-ink-300" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white overflow-hidden flex items-center justify-center">
              <img src="/logo.jpeg" alt="The Infinito Cafe & Restaurants Logo" className="w-full h-full object-contain p-0.5" />
            </div>
            <h1 className="font-serif text-lg text-gradient-gold">The Infinito Cafe & Restaurants</h1>
          </div>
          <div className="w-10" />
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
