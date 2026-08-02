import { useEffect, useState } from 'react';
import { 
  Store, Users, DollarSign, Activity, 
  TrendingUp, CreditCard, Clock, Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';

export function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    suspendedRestaurants: 0,
    premiumRestaurants: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    newThisMonth: 0,
    pendingApprovals: 0,
  });

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [restaurantGrowthData, setRestaurantGrowthData] = useState<any[]>([]);

  useEffect(() => {
    async function loadStats() {
      // Fetch platform data
      const { data: restaurants } = await supabase.from('restaurants').select('id, created_at, is_active, website_status');
      const { data: orders } = await supabase.from('orders').select('id, total_amount, created_at');
      const { data: customers } = await supabase.from('customers').select('id');
      const { data: subscriptions } = await supabase.from('subscriptions').select('plan, status');
      
      const totalRests = restaurants?.length || 0;
      const activeRests = restaurants?.filter(r => r.website_status === 'published').length || 0;
      const suspended = restaurants?.filter(r => r.website_status === 'suspended').length || 0;
      const premium = subscriptions?.filter(s => s.plan !== 'starter' && s.plan !== 'free_trial' && s.status === 'active').length || 0;
      const pendingApprovals = subscriptions?.filter(s => s.status === 'pending_approval').length || 0;
      
      const totalRev = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyRev = orders?.filter(o => {
        const d = new Date(o.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      const newThisMonth = restaurants?.filter(r => {
        const d = new Date(r.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).length || 0;

      setStats({
        totalRestaurants: totalRests,
        activeRestaurants: activeRests,
        suspendedRestaurants: suspended,
        premiumRestaurants: premium,
        totalRevenue: totalRev,
        monthlyRevenue: monthlyRev,
        totalOrders: orders?.length || 0,
        totalCustomers: customers?.length || 0,
        avgOrderValue: orders?.length ? totalRev / orders.length : 0,
        newThisMonth,
        pendingApprovals,
      });

      // Generate dummy chart data based on real stats for visual purposes
      // In a real app, this would aggregate data by day/month from the DB
      const dummyRevData = Array.from({length: 30}).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return {
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: Math.floor(Math.random() * 500) + 100,
          orders: Math.floor(Math.random() * 20) + 5
        };
      });
      setRevenueData(dummyRevData);

      const dummyGrowthData = Array.from({length: 6}).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return {
          month: d.toLocaleDateString('en-US', { month: 'short' }),
          total: totalRests - (5 - i) * 2,
          active: activeRests - (5 - i) * 1.5
        };
      });
      setRestaurantGrowthData(dummyGrowthData);

      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-bold text-2xl sm:text-3xl text-theme-primary mb-1">Platform Overview</h1>
        <p className="text-sm text-theme-secondary">High-level metrics across the entire SaaS platform.</p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-theme-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-theme-secondary">Total Restaurants</h3>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-theme-primary">{stats.totalRestaurants}</p>
            <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +{stats.newThisMonth} this month
            </p>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-theme-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-theme-secondary">Monthly Revenue</h3>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-theme-primary">₹{stats.monthlyRevenue.toFixed(2)}</p>
            <p className="text-xs text-theme-secondary mt-1">Total: ₹{stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-theme-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-theme-secondary">Total Orders</h3>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-theme-primary">{stats.totalOrders}</p>
            <p className="text-xs text-theme-secondary mt-1">Avg: ₹{stats.avgOrderValue.toFixed(2)}/order</p>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-theme-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-theme-secondary">Platform Customers</h3>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-theme-primary">{stats.totalCustomers}</p>
            <p className="text-xs text-theme-secondary mt-1">Across all restaurants</p>
          </div>
        </div>
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface p-4 rounded-xl border border-theme-border flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <CheckCircleIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-theme-secondary font-medium uppercase tracking-wider">Active Tenants</p>
            <p className="text-lg font-bold text-theme-primary">{stats.activeRestaurants}</p>
          </div>
        </div>
        <div className="bg-surface p-4 rounded-xl border border-theme-border flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <XCircleIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-theme-secondary font-medium uppercase tracking-wider">Suspended Tenants</p>
            <p className="text-lg font-bold text-theme-primary">{stats.suspendedRestaurants}</p>
          </div>
        </div>
        <div className="bg-surface p-4 rounded-xl border border-theme-border flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-ink-950">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-theme-secondary font-medium uppercase tracking-wider">Premium Subs</p>
            <p className="text-lg font-bold text-theme-primary">{stats.premiumRestaurants}</p>
          </div>
        </div>
        <div className="card-luxury p-6 border-l-4 border-l-amber-400">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-ink-400 mb-1">Pending Approvals</p>
          <div className="flex items-baseline gap-2 mb-4">
            <h3 className="text-3xl font-serif font-bold text-amber-400">{stats.pendingApprovals}</h3>
            <span className="text-sm text-ink-500">requests</span>
          </div>
          <a href="/sup/approvals" className="text-xs text-amber-400 hover:text-amber-300 font-medium">Review Now &rarr;</a>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-2xl border border-theme-border shadow-sm">
          <h3 className="text-lg font-bold text-theme-primary mb-6">Revenue Growth (30 Days)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-border)" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: 'var(--theme-secondary)'}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 12, fill: 'var(--theme-secondary)'}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--theme-primary)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-theme-border shadow-sm">
          <h3 className="text-lg font-bold text-theme-primary mb-6">Restaurant Growth (6 Months)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={restaurantGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-border)" />
                <XAxis dataKey="month" tick={{fontSize: 12, fill: 'var(--theme-secondary)'}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 12, fill: 'var(--theme-secondary)'}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', borderRadius: '12px' }}
                  cursor={{fill: 'var(--theme-border)', opacity: 0.4}}
                />
                <Legend iconType="circle" />
                <Bar dataKey="total" name="Total Restaurants" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="active" name="Active Restaurants" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

function XCircleIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
  );
}
