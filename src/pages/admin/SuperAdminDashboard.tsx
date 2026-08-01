import { useEffect, useState } from 'react';
import { Store, Users, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });

  useEffect(() => {
    async function loadStats() {
      // In a real app, you'd want a secure RPC or efficient query for this
      const { data: restaurants } = await supabase.from('restaurants').select('id, is_active');
      const { data: customers } = await supabase.from('customers').select('id', { count: 'exact' });
      
      if (restaurants) {
        setStats({
          totalRestaurants: restaurants.length,
          activeRestaurants: restaurants.filter(r => r.is_active).length,
          totalRevenue: 0, // Would query payments table across all restaurants
          totalCustomers: customers?.length || 0,
        });
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl sm:text-3xl text-primary mb-1 flex items-center gap-2">
             Super Admin Portal
          </h1>
          <p className="text-sm text-primary/60">Manage the GourmetSaaS Platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-accent shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
          </div>
          <h3 className="text-sm text-primary/60 mb-1">Total Restaurants</h3>
          <p className="text-2xl font-bold text-primary">{stats.totalRestaurants}</p>
        </div>
        
        <div className="bg-surface p-5 rounded-2xl border border-accent shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <h3 className="text-sm text-primary/60 mb-1">Active Restaurants</h3>
          <p className="text-2xl font-bold text-primary">{stats.activeRestaurants}</p>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-accent shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <h3 className="text-sm text-primary/60 mb-1">Total Revenue</h3>
          <p className="text-2xl font-bold text-primary">${stats.totalRevenue.toFixed(2)}</p>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-accent shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <h3 className="text-sm text-primary/60 mb-1">Platform Customers</h3>
          <p className="text-2xl font-bold text-primary">{stats.totalCustomers}</p>
        </div>
      </div>
      
      <div className="mt-8 bg-surface p-6 rounded-2xl border border-accent shadow-sm">
         <h2 className="text-xl font-bold text-primary mb-4">Recent Platform Signups</h2>
         <p className="text-primary/60 text-sm mb-4">A list of all restaurants and their current subscription plans would go here.</p>
         <div className="animate-pulse bg-accent/20 h-32 rounded-xl w-full"></div>
      </div>
    </div>
  );
}
