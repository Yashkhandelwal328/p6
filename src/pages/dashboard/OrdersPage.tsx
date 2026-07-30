import { useEffect, useState, useMemo } from 'react';
import { Search, Filter, Download, FileText, FileSpreadsheet, Eye, X, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDateTime, timeAgo, getTodayRange, formatOrderStatus } from '@/lib/format';
import type { Order, OrderItem, OrderStatus } from '@/types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';

export function OrdersPage() {
  const { restaurantId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('today');
  const [selectedOrder, setSelectedOrder] = useState<{ order: Order; items: OrderItem[] } | null>(null);

  useEffect(() => {
    loadOrders();
    const channel = supabase
      .channel('orders-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` }, () => loadOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [restaurantId]);

  async function loadOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  }

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (dateFilter === 'today') {
      const today = getTodayRange();
      result = result.filter(o => o.created_at >= today.start && o.created_at < today.end);
    }
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.order_number.toLowerCase().includes(q) ||
        (o.table_number && `table ${o.table_number}`.includes(q)) ||
        o.customer_name?.toLowerCase().includes(q) ||
        (o.table_number && String(o.table_number).includes(q)) ||
        o.order_type.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, statusFilter, searchQuery, dateFilter]);

  async function viewOrder(order: Order) {
    const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    setSelectedOrder({ order, items: data ?? [] });
  }

  async function confirmPayment(orderId: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('id', orderId);
      if (error) throw error;
      if (selectedOrder && selectedOrder.order.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          order: { ...selectedOrder.order, payment_status: 'paid' },
        });
      }
    } catch (err: any) {
      alert('Failed to confirm payment: ' + err.message);
    }
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('The infinoto Cafe & Restaurant – Orders Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Orders: ${filteredOrders.length}`, 14, 34);

    autoTable(doc, {
      startY: 40,
      head: [['Order #', 'Type/Table', 'Items', 'Total', 'Status', 'Payment', 'Date']],
      body: filteredOrders.map(o => [
        o.order_number,
        o.order_type === 'delivery' ? 'Delivery' : `Table ${o.table_number}`,
        String(o.items_count),
        formatCurrency(o.total_amount),
        formatOrderStatus(o.status, o.order_type),
        o.payment_status,
        formatDateTime(o.created_at),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [201, 162, 39] },
    });

    doc.save(`nirvana-orders-${Date.now()}.pdf`);
  }

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(
      filteredOrders.map(o => ({
        'Order Number': o.order_number,
        'Type': o.order_type,
        'Table': o.table_number || 'N/A',
        'Customer': o.customer_name ?? '',
        'Delivery Address': o.delivery_address ?? '',
        'Items': o.items_count,
        'Subtotal': o.subtotal,
        'Tax': o.tax_amount,
        'Total': o.total_amount,
        'Status': formatOrderStatus(o.status, o.order_type),
        'Payment Status': o.payment_status,
        'Payment Method': o.payment_method ?? '',
        'Special Instructions': o.special_instructions ?? '',
        'Created At': o.created_at,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, `nirvana-orders-${Date.now()}.xlsx`);
  }

  const statusOptions: (OrderStatus | 'all')[] = ['all', 'new', 'accepted', 'preparing', 'ready', 'served', 'completed', 'cancelled'];

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
          <h1 className="font-serif text-2xl sm:text-3xl text-gradient-gold mb-1">All Orders</h1>
          <p className="text-sm text-ink-400">Search, filter, and export orders</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="btn-outline-gold !py-2 flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4" /> PDF
          </button>
          <button onClick={exportExcel} className="btn-outline-gold !py-2 flex items-center gap-2 text-sm">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card-luxury p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type="text"
              placeholder="Search by order #, table, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-luxury w-full pl-12"
            />
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as 'today' | 'all')}
            className="input-luxury !w-auto"
          >
            <option value="today">Today</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-luxury">
          <Filter className="w-4 h-4 text-ink-400 flex-shrink-0" />
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`badge whitespace-nowrap transition-all capitalize ${
                statusFilter === status
                  ? 'bg-nirvana-400/20 text-nirvana-300 border-nirvana-400/40'
                  : 'glass-dark text-ink-300 border-white/10'
              }`}
            >
              {status === 'all' ? 'All Status' : ORDER_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto scrollbar-luxury">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-400 border-b border-white/5">
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-ink-400">No orders found</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-nirvana-300 font-medium">{order.order_number}</td>
                    <td className="px-4 py-3 text-ink-200">
                      {order.order_type === 'delivery' ? (
                        <span className="badge bg-blue-500/15 text-blue-400 border-blue-500/30">Delivery</span>
                      ) : (
                        `Table ${order.table_number}`
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-200">{order.customer_name ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-200">{order.items_count}</td>
                    <td className="px-4 py-3 text-ink-200">{formatCurrency(order.total_amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge capitalize ${ORDER_STATUS_COLORS[order.status]}`}>
                        {formatOrderStatus(order.status, order.order_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge capitalize ${order.payment_status === 'paid' ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-400 whitespace-nowrap">{timeAgo(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => viewOrder(order)} className="w-8 h-8 flex items-center justify-center glass rounded-lg hover:bg-nirvana-400/10 transition-colors">
                        <Eye className="w-4 h-4 text-nirvana-300" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedOrder(null)}>
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg glass-dark border border-nirvana-400/20 rounded-2xl p-6 max-h-[90vh] overflow-y-auto scrollbar-luxury animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-xl text-gradient-gold">{selectedOrder.order.order_number}</h3>
                <p className="text-sm text-ink-400">
                  {selectedOrder.order.order_type === 'delivery' ? 'Delivery Order' : `Table ${selectedOrder.order.table_number}`} · {formatDateTime(selectedOrder.order.created_at)}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-9 h-9 flex items-center justify-center glass rounded-lg hover:bg-white/10">
                <X className="w-5 h-5 text-ink-300" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 glass rounded-xl p-3">
                  <span className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div className="flex-1">
                    <p className="text-sm text-ink-100">{item.menu_item_name}</p>
                    <p className="text-xs text-ink-400 capitalize">{item.portion} · {item.quantity}x</p>
                  </div>
                  <span className="text-sm text-nirvana-300">{formatCurrency(item.total_price)}</span>
                </div>
              ))}
            </div>

            <div className="glass rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm text-ink-300">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedOrder.order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-ink-300">
                <span>Tax</span>
                <span>{formatCurrency(selectedOrder.order.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-lg font-serif text-nirvana-300 pt-2 border-t border-white/5">
                <span>Total</span>
                <span>{formatCurrency(selectedOrder.order.total_amount)}</span>
              </div>
            </div>

            {selectedOrder.order.special_instructions && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-400"><strong>Special Instructions:</strong> {selectedOrder.order.special_instructions}</p>
              </div>
            )}

            {selectedOrder.order.order_type === 'delivery' && selectedOrder.order.delivery_address && (
              <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-400"><strong>Delivery Address:</strong> {selectedOrder.order.delivery_address}</p>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3 glass rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-400">Payment Status</span>
                <div className="flex items-center gap-2">
                  <span className={`badge capitalize ${selectedOrder.order.payment_status === 'paid' ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}`}>
                    {selectedOrder.order.payment_status}
                  </span>
                  {selectedOrder.order.payment_method === 'online' && selectedOrder.order.payment_status === 'pending' && (
                    <button
                      onClick={() => confirmPayment(selectedOrder.order.id)}
                      className="btn-gold !py-1 !px-2 text-xs"
                    >
                      Confirm Payment
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-400">Status</span>
                <span className={`badge capitalize ${ORDER_STATUS_COLORS[selectedOrder.order.status]}`}>
                  {formatOrderStatus(selectedOrder.order.status, selectedOrder.order.order_type)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
