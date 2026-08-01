import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  LogOut, 
  Settings,
  Menu,
  X,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function SuperAdminLayout() {
  const { signOut, session } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/sup/dashboard', icon: LayoutDashboard },
    { name: 'Restaurants', path: '/sup/restaurants', icon: Store },
    { name: 'Premium Leads', path: '/sup/leads', icon: PhoneCall },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-surface border-b border-theme-border p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 text-theme-primary font-bold text-lg">
          <Settings className="w-5 h-5 text-primary" />
          Super Admin
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-theme-secondary hover:text-theme-primary">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-surface border-r border-theme-border
        transition-transform duration-300 ease-in-out flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-theme-primary leading-tight">Super Admin</h1>
            <p className="text-xs text-theme-secondary">GourmetSaaS Platform</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 md:py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                  : 'text-theme-secondary hover:bg-primary/10 hover:text-theme-primary'}
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-theme-border">
          <div className="mb-4 px-4">
            <p className="text-sm font-medium text-theme-primary truncate">{session?.user?.email}</p>
            <p className="text-xs text-theme-secondary">Platform Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden relative">
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
