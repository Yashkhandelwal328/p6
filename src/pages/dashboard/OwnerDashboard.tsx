import { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp, ShoppingBag, Clock, CheckCircle2, XCircle, DollarSign,
  Receipt, Users, ArrowUpRight, ArrowDownRight, ChefHat, Utensils,
  Copy, Download, ExternalLink, QrCode, Globe
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '@/context/ThemeContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, getTodayRange, getDateRange, timeAgo } from '@/lib/format';
import type { Order, OrderStatus } from '@/types';

interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  liveOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  avgBillValue: number;
}

interface HourData {
  hour: string;
  orders: number;
  revenue: number;
}

interface TableData {
  table_number: number;
  orders: number;
}

interface ItemData {
  name: string;
  quantity: number;
}

const CHART_COLOR = '#567C8D';
const PIE_COLORS = ['#2F4156', '#567C8D', '#C8D9E6', '#F5EFEB', '#e2e8f0', '#cbd5e1'];

export function OwnerDashboard() {
  const { restaurantId } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0, todayOrders: 0, liveOrders: 0, completedOrders: 0,
    pendingOrders: 0, cancelledOrders: 0, totalRevenue: 0, avgBillValue: 0,
  });
  const [hourlyData, setHourlyData] = useState<HourData[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ day: string; revenue: number; orders: number }[]>([]);
  const [topItems, setTopItems] = useState<ItemData[]>([]);
  const [topTables, setTopTables] = useState<TableData[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<{ name: string; value: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { restaurant } = useTheme();

  const customerUrl = useMemo(() => {
    if (!restaurant?.subdomain) return '';
    const origin = window.location.origin;
    return `${origin}/${restaurant.subdomain}`;
  }, [restaurant]);

  const menuUrl = customerUrl ? `${customerUrl}/menu` : '';

  const copyLink = (url: string) => {
    if (url) {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('customer-qr-code');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${restaurant?.name || 'restaurant'}-qr.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  useEffect(() => {
    loadDashboardData();

    const channel = supabase
      .channel('owner-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` }, () => {
        loadDashboardData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [restaurantId]);

  async function loadDashboardData() {
    const today = getTodayRange();
    const week = getDateRange(7);

    const [todayOrdersRes, allOrdersRes, weekOrdersRes, itemsRes, tablesRes] = await Promise.all([
      supabase.from('orders').select('*').eq('restaurant_id', restaurantId).gte('created_at', today.start).lt('created_at', today.end).order('created_at', { ascending: false }),
      supabase.from('orders').select('*').eq('restaurant_id', restaurantId),
      supabase.from('orders').select('*').eq('restaurant_id', restaurantId).gte('created_at', week.start).lt('created_at', week.end),
      supabase.from('order_items').select('menu_item_name, quantity').eq('restaurant_id', restaurantId).gte('created_at', today.start).lt('created_at', today.end),
      supabase.from('orders').select('table_number').eq('restaurant_id', restaurantId).gte('created_at', today.start).lt('created_at', today.end),
    ]);

    const todayOrders = todayOrdersRes.data ?? [];
    const allOrders = allOrdersRes.data ?? [];
    const weekOrders = weekOrdersRes.data ?? [];

    const todaySales = todayOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total_amount, 0);
    const todayCompleted = todayOrders.filter(o => o.status === 'completed');
    const todayCancelled = todayOrders.filter(o => o.status === 'cancelled');
    const todayLive = todayOrders.filter(o => ['new', 'accepted', 'preparing', 'ready', 'served'].includes(o.status));
    const todayPending = todayOrders.filter(o => ['new', 'accepted'].includes(o.status));
    const totalRevenue = allOrders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total_amount, 0);
    const avgBill = todayCompleted.length > 0 ? todaySales / todayCompleted.length : 0;

    setStats({
      todaySales,
      todayOrders: todayOrders.length,
      liveOrders: todayLive.length,
      completedOrders: todayCompleted.length,
      pendingOrders: todayPending.length,
      cancelledOrders: todayCancelled.length,
      totalRevenue,
      avgBillValue: avgBill,
    });

    // Hourly distribution
    const hourMap = new Map<number, { orders: number; revenue: number }>();
    for (let h = 9; h <= 23; h++) hourMap.set(h, { orders: 0, revenue: 0 });
    todayOrders.forEach((o) => {
      const h = new Date(o.created_at).getHours();
      if (h >= 9 && h <= 23) {
        const entry = hourMap.get(h)!;
        entry.orders += 1;
        if (o.status !== 'cancelled') entry.revenue += o.total_amount;
      }
    });
    setHourlyData(Array.from(hourMap.entries()).map(([h, v]) => ({
      hour: `${h}:00`,
      orders: v.orders,
      revenue: Math.round(v.revenue),
    })));

    // Weekly data
    const dayMap = new Map<string, { revenue: number; orders: number }>();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      dayMap.set(key, { revenue: 0, orders: 0 });
    }
    weekOrders.forEach((o) => {
      const key = new Date(o.created_at).toDateString();
      const entry = dayMap.get(key);
      if (entry) {
        if (o.status !== 'cancelled') entry.revenue += o.total_amount;
        entry.orders += 1;
      }
    });
    setWeeklyData(Array.from(dayMap.entries()).map(([key, v]) => {
      const d = new Date(key);
      return { day: dayNames[d.getDay()], revenue: Math.round(v.revenue), orders: v.orders };
    }));

    // Top items
    const itemMap = new Map<string, number>();
    (itemsRes.data ?? []).forEach((i) => {
      itemMap.set(i.menu_item_name, (itemMap.get(i.menu_item_name) ?? 0) + i.quantity);
    });
    setTopItems(Array.from(itemMap.entries()).map(([name, quantity]) => ({ name, quantity })).sort((a, b) => b.quantity - a.quantity).slice(0, 6));

    // Top tables
    const tableMap = new Map<number, number>();
    (tablesRes.data ?? []).forEach((t) => {
      tableMap.set(t.table_number, (tableMap.get(t.table_number) ?? 0) + 1);
    });
    setTopTables(Array.from(tableMap.entries()).map(([table_number, orders]) => ({ table_number, orders })).sort((a, b) => b.orders - a.orders).slice(0, 6));

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    todayOrders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1; });
    setStatusBreakdown(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

    setRecentOrders(todayOrders.slice(0, 5));
    setLoading(false);
  }

  const statCards = useMemo(() => [
    { label: "Today's Sales", value: formatCurrency(stats.todaySales), icon: DollarSign, trend: 'up', color: 'text-primary' },
    { label: "Today's Orders", value: stats.todayOrders, icon: ShoppingBag, trend: 'up', color: 'text-blue-500' },
    { label: 'Live Orders', value: stats.liveOrders, icon: Clock, trend: 'up', color: 'text-amber-500' },
    { label: 'Completed', value: stats.completedOrders, icon: CheckCircle2, trend: 'up', color: 'text-green-500' },
    { label: 'Pending', value: stats.pendingOrders, icon: Receipt, trend: 'down', color: 'text-cyan-500' },
    { label: 'Cancelled', value: stats.cancelledOrders, icon: XCircle, trend: 'down', color: 'text-red-500' },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, trend: 'up', color: 'text-primary' },
    { label: 'Avg Bill', value: formatCurrency(stats.avgBillValue), icon: Utensils, trend: 'up', color: 'text-purple-500' },
  ], [stats]);

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
        <h1 className="font-serif text-2xl sm:text-3xl text-ink-950 mb-1">Owner Dashboard</h1>
        <p className="text-sm text-theme-secondary">Real-time overview of your restaurant performance</p>
      </div>

      {/* Customer Access Section */}
      {restaurant && customerUrl && (
        <div className="card-luxury p-5 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-shrink-0 bg-white p-3 rounded-xl shadow-lg border border-white/20">
              <QRCodeSVG
                id="customer-qr-code"
                value={menuUrl} // QR explicitly points to menu as requested
                size={120}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"}
                includeMargin={false}
              />
            </div>
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h3 className="font-serif text-lg text-primary mb-1 flex items-center justify-center md:justify-start gap-2">
                  <QrCode className="w-5 h-5" /> Customer Access
                </h3>
                <p className="text-sm text-theme-secondary">Customers can scan the QR code to access your digital menu, or use the links below.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Website Link */}
                <div className="flex items-center gap-2 p-2.5 bg-background border border-theme-border rounded-lg overflow-hidden">
                  <Globe className="w-4 h-4 text-theme-secondary flex-shrink-0 ml-2" />
                  <input 
                    type="text" 
                    readOnly 
                    value={customerUrl} 
                    className="bg-transparent border-none focus:ring-0 text-sm text-primary flex-1 w-full overflow-hidden text-ellipsis px-1"
                  />
                  <button onClick={() => copyLink(customerUrl)} className="p-1.5 text-theme-secondary hover:text-primary transition-colors" title="Copy Website Link">
                    <Copy className="w-4 h-4" />
                  </button>
                  <a href={customerUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-primary hover:text-primary/80 transition-colors" title="Open Website">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Menu Link */}
                <div className="flex items-center gap-2 p-2.5 bg-background border border-theme-border rounded-lg overflow-hidden">
                  <Utensils className="w-4 h-4 text-theme-secondary flex-shrink-0 ml-2" />
                  <input 
                    type="text" 
                    readOnly 
                    value={menuUrl} 
                    className="bg-transparent border-none focus:ring-0 text-sm text-primary flex-1 w-full overflow-hidden text-ellipsis px-1"
                  />
                  <button onClick={() => copyLink(menuUrl)} className="p-1.5 text-theme-secondary hover:text-primary transition-colors" title="Copy Menu Link">
                    <Copy className="w-4 h-4" />
                  </button>
                  <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-primary hover:text-primary/80 transition-colors" title="Open Menu">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <button onClick={downloadQR} className="btn-outline !py-2 text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download QR
                </button>
                <button onClick={() => window.print()} className="btn-outline !py-2 text-sm flex items-center gap-2">
                  <Copy className="w-4 h-4" /> Print QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Setup Checklist (Only if draft or incomplete) */}
      {restaurant && restaurant.website_status === 'draft' && (
        <div className="card-luxury p-6 mb-6 border border-primary/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-lg text-primary mb-1">Restaurant Setup Checklist</h3>
              <p className="text-sm text-theme-secondary">Complete these steps to publish your website.</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-serif text-primary">82%</span>
              <p className="text-xs text-theme-secondary">Complete</p>
            </div>
          </div>
          <div className="w-full bg-secondary/20 rounded-full h-2 mb-6 overflow-hidden">
            <div className="bg-primary h-2 rounded-full" style={{ width: '82%' }}></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> <span className="text-theme-secondary line-through opacity-70">Upload Logo</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> <span className="text-theme-secondary line-through opacity-70">Choose Theme</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> <span className="text-theme-secondary line-through opacity-70">Add Restaurant Details</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> <span className="text-theme-secondary line-through opacity-70">Add 3 Categories</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> <span className="text-theme-secondary line-through opacity-70">Add 3 Menu Items</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> <span className="text-theme-secondary line-through opacity-70">Configure Business Hours</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> <span className="text-theme-secondary line-through opacity-70">Generate QR Code</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium">
              <div className="w-5 h-5 rounded-full border-2 border-primary/50 flex-shrink-0" /> <span className="text-primary">Preview Website</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium">
              <div className="w-5 h-5 rounded-full border-2 border-primary/50 flex-shrink-0" /> <span className="text-primary">Publish Website</span>
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card-luxury p-4 animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                {card.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500/60" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500/60" />
                )}
              </div>
              <p className="text-xs text-theme-secondary mb-1">{card.label}</p>
              <p className="text-xl font-serif text-primary">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Chart */}
        <div className="card-luxury p-5">
          <h3 className="font-serif text-lg text-primary mb-4">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={CHART_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="day" stroke="#4B5563" fontSize={12} />
              <YAxis stroke="#4B5563" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', color: '#111827' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area type="monotone" dataKey="revenue" stroke={CHART_COLOR} strokeWidth={2} fill="url(#revGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Orders */}
        <div className="card-luxury p-5">
          <h3 className="font-serif text-lg text-primary mb-4">Peak Hours (Today)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="hour" stroke="#4B5563" fontSize={10} />
              <YAxis stroke="#4B5563" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', color: '#111827' }}
              />
              <Bar dataKey="orders" fill={CHART_COLOR} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Items */}
        <div className="card-luxury p-5">
          <h3 className="font-serif text-lg text-primary mb-4 flex items-center gap-2">
            <ChefHat className="w-5 h-5" /> Best Selling Items
          </h3>
          {topItems.length === 0 ? (
            <p className="text-sm text-theme-secondary py-8 text-center">No data yet</p>
          ) : (
            <div className="space-y-2">
              {topItems.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-sm text-primary truncate">{item.name}</span>
                  <span className="text-sm text-theme-secondary font-medium">{item.quantity}x</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Tables */}
        <div className="card-luxury p-5">
          <h3 className="font-serif text-lg text-primary mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5" /> Most Active Tables
          </h3>
          {topTables.length === 0 ? (
            <p className="text-sm text-theme-secondary py-8 text-center">No data yet</p>
          ) : (
            <div className="space-y-2">
              {topTables.map((t, idx) => (
                <div key={t.table_number} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-sm text-primary">Table {t.table_number}</span>
                  <span className="text-sm text-theme-secondary font-medium">{t.orders} orders</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="card-luxury p-5">
          <h3 className="font-serif text-lg text-primary mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" /> Order Status
          </h3>
          {statusBreakdown.length === 0 ? (
            <p className="text-sm text-theme-secondary py-8 text-center">No orders today</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {statusBreakdown.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: '12px', color: '#4B5563' }} />
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', color: '#111827' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card-luxury p-5">
        <h3 className="font-serif text-lg text-primary mb-4">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-theme-secondary py-8 text-center">No orders yet today</p>
        ) : (
          <div className="overflow-x-auto scrollbar-luxury">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-theme-secondary border-b border-theme-border">
                  <th className="pb-2 font-medium">Order #</th>
                  <th className="pb-2 font-medium">Table</th>
                  <th className="pb-2 font-medium">Items</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-theme-border hover:bg-black/5 transition-colors">
                    <td className="py-3 text-primary font-medium">{o.order_number}</td>
                    <td className="py-3 text-primary">Table {o.table_number}</td>
                    <td className="py-3 text-primary">{o.items_count}</td>
                    <td className="py-3 text-primary">{formatCurrency(o.total_amount)}</td>
                    <td className="py-3">
                      <span className="badge capitalize bg-surface text-primary border-theme-border shadow-sm">{o.status}</span>
                    </td>
                    <td className="py-3 text-theme-secondary">{timeAgo(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
