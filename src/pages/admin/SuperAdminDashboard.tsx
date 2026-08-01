import { useEffect, useState } from 'react';
import { Store, Users, DollarSign, Activity, ExternalLink, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function SuperAdminDashboard() {
  const { setImpersonatedRestaurantId } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });

  const [restaurantsList, setRestaurantsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      // Fetch stats
      const { data: restaurants } = await supabase.from('restaurants').select('*');
      const { data: customers } = await supabase.from('customers').select('id', { count: 'exact' });
      
      if (restaurants) {
        setStats({
          totalRestaurants: restaurants.length,
          activeRestaurants: restaurants.filter(r => r.is_active).length,
          totalRevenue: 0, 
          totalCustomers: customers?.length || 0,
        });
        setRestaurantsList(restaurants);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  const handleImpersonate = (restaurantId: string) => {
    setImpersonatedRestaurantId(restaurantId);
    navigate('/owner/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl sm:text-3xl text-theme-primary mb-1 flex items-center gap-2">
             Super Admin Portal
          </h1>
          <p className="text-sm text-theme-secondary">Manage the GourmetSaaS Platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-theme-border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
          </div>
          <h3 className="text-sm text-theme-secondary mb-1">Total Restaurants</h3>
          <p className="text-2xl font-bold text-theme-primary">{stats.totalRestaurants}</p>
        </div>
        
        <div className="bg-surface p-5 rounded-2xl border border-theme-border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <h3 className="text-sm text-theme-secondary mb-1">Active Restaurants</h3>
          <p className="text-2xl font-bold text-theme-primary">{stats.activeRestaurants}</p>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-theme-border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <h3 className="text-sm text-theme-secondary mb-1">Total Revenue</h3>
          <p className="text-2xl font-bold text-theme-primary">${stats.totalRevenue.toFixed(2)}</p>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-theme-border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <h3 className="text-sm text-theme-secondary mb-1">Platform Customers</h3>
          <p className="text-2xl font-bold text-theme-primary">{stats.totalCustomers}</p>
        </div>
      </div>
      
      <div className="mt-8 bg-surface p-6 rounded-2xl border border-theme-border shadow-sm">
         <h2 className="text-xl font-bold text-theme-primary mb-4">All Tenants</h2>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-theme-border text-sm text-theme-secondary">
                  <th className="pb-3 font-medium px-4">Restaurant</th>
                  <th className="pb-3 font-medium px-4">Status</th>
                  <th className="pb-3 font-medium px-4">URL Slug</th>
                  <th className="pb-3 font-medium px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {restaurantsList.map(r => (
                  <tr key={r.id} className="hover:bg-primary/5 transition-colors">
                    <td className="py-4 px-4 font-medium text-theme-primary">
                      {r.name}
                      <p className="text-xs text-theme-secondary font-normal">{r.restaurant_code}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        r.website_status === 'published' ? 'bg-green-100 text-green-800' :
                        r.website_status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {r.website_status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-theme-primary/80">
                      <a href={`/${r.subdomain}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                        /{r.subdomain} <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => handleImpersonate(r.id)}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
                      >
                        <LogIn className="w-4 h-4" /> Impersonate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
