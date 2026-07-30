import { useEffect, useState, useMemo } from 'react';
import { FileBarChart, FileText, FileSpreadsheet, TrendingUp, ShoppingBag, DollarSign, Users } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, getDateRange, formatDate } from '@/lib/format';
import type { Order } from '@/types';

const GOLD = '#c9a227';

export function ReportsPage() {
  const { restaurantId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<7 | 30 | 90>(30);

  useEffect(() => { loadData(); }, [restaurantId]);

  async function loadData() {
    const { data } = await supabase.from('orders').select('*').eq('restaurant_id', restaurantId).order('created_at', { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  }

  const range = getDateRange(dateRange);
  const rangedOrders = useMemo(() => orders.filter(o => o.created_at >= range.start && o.created_at < range.end), [orders, range]);

  const dailyRevenue = useMemo(() => {
    const map = new Map<string, { revenue: number; orders: number }>();
    rangedOrders.forEach((o) => {
      if (o.status === 'cancelled') return;
      const key = new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const entry = map.get(key) ?? { revenue: 0, orders: 0 };
      entry.revenue += o.total_amount;
      entry.orders += 1;
      map.set(key, entry);
    });
    return Array.from(map.entries()).map(([date, v]) => ({ date, revenue: Math.round(v.revenue), orders: v.orders }));
  }, [rangedOrders]);

  const summary = useMemo(() => {
    const valid = rangedOrders.filter(o => o.status !== 'cancelled');
    const totalRevenue = valid.reduce((s, o) => s + o.total_amount, 0);
    const totalOrders = rangedOrders.length;
    const completedOrders = rangedOrders.filter(o => o.status === 'completed').length;
    const cancelledOrders = rangedOrders.filter(o => o.status === 'cancelled').length;
    const avgOrderValue = valid.length > 0 ? totalRevenue / valid.length : 0;
    const uniqueTables = new Set(rangedOrders.map(o => o.table_number)).size;
    return { totalRevenue, totalOrders, completedOrders, cancelledOrders, avgOrderValue, uniqueTables };
  }, [rangedOrders]);

  function exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('The infinoto Cafe & Restaurant – Restaurant Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Period: Last ${dateRange} days (${formatDate(range.start)} to ${formatDate(new Date().toISOString())})`, 14, 28);
    doc.text(`Total Revenue: ${formatCurrency(summary.totalRevenue)}`, 14, 36);
    doc.text(`Total Orders: ${summary.totalOrders}`, 14, 42);
    doc.text(`Completed: ${summary.completedOrders} | Cancelled: ${summary.cancelledOrders}`, 14, 48);
    doc.text(`Average Order Value: ${formatCurrency(summary.avgOrderValue)}`, 14, 54);
    doc.text(`Unique Tables Served: ${summary.uniqueTables}`, 14, 60);

    autoTable(doc, {
      startY: 68,
      head: [['Date', 'Orders', 'Revenue']],
      body: dailyRevenue.map(d => [d.date, String(d.orders), formatCurrency(d.revenue)]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [201, 162, 39] },
    });

    autoTable(doc, {
      startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10,
      head: [['Order #', 'Table', 'Items', 'Total', 'Status', 'Date']],
      body: rangedOrders.slice(0, 50).map(o => [
        o.order_number, `Table ${o.table_number}`, String(o.items_count),
        formatCurrency(o.total_amount), o.status, formatDate(o.created_at),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [201, 162, 39] },
    });

    doc.save(`nirvana-report-${Date.now()}.pdf`);
  }

  function exportExcel() {
    const summaryWs = XLSX.utils.json_to_sheet([{
      'Period': `Last ${dateRange} days`,
      'Total Revenue': summary.totalRevenue,
      'Total Orders': summary.totalOrders,
      'Completed Orders': summary.completedOrders,
      'Cancelled Orders': summary.cancelledOrders,
      'Avg Order Value': summary.avgOrderValue,
      'Unique Tables': summary.uniqueTables,
    }]);
    const dailyWs = XLSX.utils.json_to_sheet(dailyRevenue);
    const ordersWs = XLSX.utils.json_to_sheet(rangedOrders.map(o => ({
      'Order Number': o.order_number,
      'Table': o.table_number,
      'Customer': o.customer_name ?? '',
      'Items': o.items_count,
      'Subtotal': o.subtotal,
      'Tax': o.tax_amount,
      'Total': o.total_amount,
      'Status': o.status,
      'Payment Status': o.payment_status,
      'Date': o.created_at,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    XLSX.utils.book_append_sheet(wb, dailyWs, 'Daily Revenue');
    XLSX.utils.book_append_sheet(wb, ordersWs, 'Orders');
    XLSX.writeFile(wb, `nirvana-report-${Date.now()}.xlsx`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-2 border-nirvana-400/30 border-t-nirvana-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-gradient-gold mb-1 flex items-center gap-2">
            <FileBarChart className="w-7 h-7" /> Reports & Analytics
          </h1>
          <p className="text-sm text-ink-400">Comprehensive business performance reports</p>
        </div>
        <div className="flex gap-2">
          <select value={dateRange} onChange={(e) => setDateRange(Number(e.target.value) as 7 | 30 | 90)} className="input-luxury !w-auto">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={exportPDF} className="btn-outline-gold !py-2 flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4" /> PDF
          </button>
          <button onClick={exportExcel} className="btn-outline-gold !py-2 flex items-center gap-2 text-sm">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(summary.totalRevenue), icon: DollarSign },
          { label: 'Total Orders', value: summary.totalOrders, icon: ShoppingBag },
          { label: 'Avg Order Value', value: formatCurrency(summary.avgOrderValue), icon: TrendingUp },
          { label: 'Tables Served', value: summary.uniqueTables, icon: Users },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card-luxury p-4 animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="w-10 h-10 rounded-xl glass-gold flex items-center justify-center mb-2">
                <Icon className="w-5 h-5 text-nirvana-400" />
              </div>
              <p className="text-xs text-ink-400 mb-1">{card.label}</p>
              <p className="text-xl font-serif text-ink-100">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue Trend */}
      <div className="card-luxury p-5">
        <h3 className="font-serif text-lg text-nirvana-300 mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="#736a59" fontSize={11} />
            <YAxis stroke="#736a59" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1a1407', border: '1px solid rgba(201,162,39,0.2)', borderRadius: '12px', color: '#f3ede0' }} formatter={(value: number) => formatCurrency(value)} />
            <Legend wrapperStyle={{ color: '#736a59' }} />
            <Line type="monotone" dataKey="revenue" stroke={GOLD} strokeWidth={2} dot={{ fill: GOLD, r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Orders */}
      <div className="card-luxury p-5">
        <h3 className="font-serif text-lg text-nirvana-300 mb-4">Daily Order Count</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="#736a59" fontSize={11} />
            <YAxis stroke="#736a59" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1a1407', border: '1px solid rgba(201,162,39,0.2)', borderRadius: '12px', color: '#f3ede0' }} />
            <Bar dataKey="orders" fill={GOLD} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
