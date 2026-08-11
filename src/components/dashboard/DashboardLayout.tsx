import { useState, useEffect } from 'react';
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
  Power,
  Image as ImageIcon,
  MessageSquare,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { StaffRole } from '@/types';
import { useTheme } from '@/context/ThemeContext';

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
  { label: 'Media Library', path: 'media', icon: ImageIcon, roles: ['super_admin', 'owner', 'manager'] },
  { label: 'Customers', path: 'customers', icon: Users, roles: ['super_admin', 'owner', 'manager', 'cashier'] },
  { label: 'Staff', path: 'staff', icon: UserCog, roles: ['super_admin', 'owner'] },
  { label: 'Settings', path: 'settings', icon: Settings, roles: ['super_admin', 'owner'] },
  { label: 'Reports', path: 'reports', icon: FileBarChart, roles: ['super_admin', 'owner', 'manager', 'cashier'] },
];

export function DashboardLayout() {
  const { staff, signOut, restaurantId, impersonatedRestaurantId, setImpersonatedRestaurantId } = useAuth();
  const { restaurant } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);
  const [restaurantSubdomain, setRestaurantSubdomain] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;
    const fetchStatus = async () => {
      const { data } = await supabase.from('restaurants').select('is_active, subdomain, custom_domain').eq('id', restaurantId).maybeSingle();
      if (data) {
        setIsRestaurantOpen(data.is_active);
        setRestaurantSubdomain(data.custom_domain || data.subdomain || null);
      }
    };
    fetchStatus();
  }, [restaurantId]);

  async function toggleRestaurantStatus() {
    if (!restaurantId) return;
    const newState = !isRestaurantOpen;
    setIsRestaurantOpen(newState);
    await supabase.from('restaurants').update({ is_active: newState }).eq('id', restaurantId);
  }

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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#2F4156] border-r border-[#2F4156] transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              {restaurant?.logo_url && (
                 <img src={restaurant.logo_url} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-white/10" />
              )}
              <div>
                <h1 className="font-serif text-lg text-white leading-tight">{restaurant?.name || 'Restaurant Dashboard'}</h1>
                <p className="text-xs text-[#E2E8F0]">{restaurant?.tagline || 'SaaS Platform'}</p>
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
                      ? 'bg-[#567C8D] text-white shadow-md'
                      : 'text-[#E2E8F0] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {['super_admin', 'owner', 'manager'].includes(userRole) && (
            <div className="px-3 pb-4">
              <button
                onClick={toggleRestaurantStatus}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isRestaurantOpen
                    ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Power className="w-5 h-5" />
                  <span>{isRestaurantOpen ? 'Store is Open' : 'Store is Closed'}</span>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative ${isRestaurantOpen ? 'bg-green-500' : 'bg-red-500'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isRestaurantOpen ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </button>
            </div>
          )}

          <div className="px-3 py-4 border-t border-theme-border">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">
                  {staff?.name?.charAt(0).toUpperCase() ?? 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">{staff?.name ?? 'Admin'}</p>
                <p className="text-xs text-theme-secondary capitalize">{userRole.replace('_', ' ')}</p>
              </div>
            </div>
            <a
              href={restaurantSubdomain ? `/${restaurantSubdomain}/review` : '/review'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#E2E8F0] hover:bg-white/10 hover:text-white transition-colors mb-2"
            >
              <MessageSquare className="w-5 h-5" />
              Leave a Review
            </a>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 relative flex flex-col h-screen overflow-hidden">
        {impersonatedRestaurantId && (
          <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-between text-sm shadow-md z-50 flex-shrink-0">
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              You are currently impersonating {restaurant?.name || 'this restaurant'}.
            </div>
            <button 
              onClick={() => {
                setImpersonatedRestaurantId(null);
                navigate('/sup');
              }}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md transition-colors font-bold"
            >
              Return to Super Admin
            </button>
          </div>
        )}

        <header className="lg:hidden bg-surface border-b border-theme-border px-4 py-3 flex items-center justify-between z-30 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center bg-background rounded-lg text-theme-secondary hover:text-primary">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            {restaurant?.logo_url && (
               <img src={restaurant.logo_url} alt="Logo" className="w-6 h-6 rounded-md object-contain bg-black/5" />
            )}
            <h1 className="font-serif text-lg text-primary">{restaurant?.name || 'Restaurant Dashboard'}</h1>
          </div>
          <div className="w-10" />
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
