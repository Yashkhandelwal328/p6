import { useEffect, useState, useCallback } from 'react';
import { ChefHat, Clock, CheckCircle2, AlertCircle, Bell, Utensils, X, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatTime, timeAgo, formatOrderStatus } from '@/lib/format';
import type { Order, OrderItem, OrderStatus } from '@/types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';

interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export function KitchenDashboard() {
  const { restaurantId } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'new' | 'preparing' | 'ready' | 'completed'>('new');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel('kitchen-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` }, () => {
        loadOrders();
        if (soundEnabled) playNotificationSound();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_items', filter: `restaurant_id=eq.${restaurantId}` }, () => {
        loadOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [soundEnabled, restaurantId]);

  function playNotificationSound() {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch { /* ignore */ }
  }

  async function loadOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('restaurant_id', restaurantId)
      .in('status', ['new', 'accepted', 'preparing', 'ready', 'served', 'completed'])
      .order('created_at', { ascending: true });

    setOrders((data ?? []) as OrderWithItems[]);
    setLoading(false);
  }

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    const updates: Record<string, string | null> = { status };
    if (status === 'accepted') updates.accepted_at = new Date().toISOString();
    if (status === 'preparing') updates.preparing_at = new Date().toISOString();
    if (status === 'ready') updates.ready_at = new Date().toISOString();
    if (status === 'served') updates.served_at = new Date().toISOString();
    if (status === 'completed') updates.completed_at = new Date().toISOString();

    await supabase.from('orders').update(updates).eq('id', orderId);

    const notifType = status === 'accepted' ? 'order_accepted'
      : status === 'preparing' ? 'order_preparing'
      : status === 'ready' ? 'order_ready'
      : status === 'completed' ? 'order_completed'
      : 'order_cancelled';

    await supabase.from('notifications').insert({
      restaurant_id: restaurantId,
      order_id: orderId,
      type: notifType,
      title: `Order ${ORDER_STATUS_LABELS[status]}`,
      message: `Order status updated to ${ORDER_STATUS_LABELS[status]}`,
    });

    // Instantly refresh the UI
    loadOrders();
  }, [restaurantId]);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'new') return ['new', 'accepted'].includes(o.status);
    if (activeTab === 'preparing') return o.status === 'preparing';
    if (activeTab === 'ready') return o.status === 'ready';
    if (activeTab === 'completed') return o.status === 'completed' || o.status === 'served';
    return false;
  });

  const counts = {
    new: orders.filter(o => ['new', 'accepted'].includes(o.status)).length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => ['completed', 'served'].includes(o.status)).length,
  };

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
            <ChefHat className="w-7 h-7" /> Kitchen Display
          </h1>
          <p className="text-sm text-ink-400">Live order preparation system</p>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`btn-outline-gold !py-2 flex items-center gap-2 ${soundEnabled ? 'text-nirvana-300' : 'text-ink-400'}`}
        >
          <Bell className="w-4 h-4" />
          {soundEnabled ? 'Sound On' : 'Sound Off'}
        </button>
      </div>

      {/* Tab Counts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {([
          { key: 'new', label: 'New Orders', icon: AlertCircle, color: 'text-blue-400' },
          { key: 'preparing', label: 'Preparing', icon: Clock, color: 'text-amber-400' },
          { key: 'ready', label: 'Ready', icon: CheckCircle2, color: 'text-green-400' },
          { key: 'completed', label: 'Completed', icon: Utensils, color: 'text-emerald-400' },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`card-luxury p-4 text-left transition-all ${activeTab === tab.key ? 'border-nirvana-400/40 shadow-gold' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${tab.color}`} />
                <span className="text-2xl font-serif text-ink-100">{counts[tab.key]}</span>
              </div>
              <p className="text-xs text-ink-400">{tab.label}</p>
            </button>
          );
        })}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="card-luxury p-12 text-center">
          <ChefHat className="w-12 h-12 text-ink-600 mx-auto mb-3" />
          <p className="text-ink-400">No orders in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="card-luxury p-4 animate-fade-in-up">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-serif text-lg text-nirvana-300">
                    {order.order_number} {order.order_type === 'delivery' && <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">Delivery</span>}
                  </p>
                  <p className="text-xs text-ink-400">
                    {order.order_type === 'delivery' ? 'Delivery' : `Table ${order.table_number}`} · {timeAgo(order.created_at)}
                  </p>
                </div>
                <span className={`badge ${ORDER_STATUS_COLORS[order.status]} capitalize`}>
                  {formatOrderStatus(order.status, order.order_type)}
                </span>
              </div>

              {order.special_instructions && (
                <div className="mb-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-amber-400">
                    <strong>Note:</strong> {order.special_instructions}
                  </p>
                </div>
              )}

              {order.order_type === 'delivery' && (
                <div className="mb-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-blue-400 break-words mb-1.5">
                    <strong>Address:</strong> {order.delivery_address}
                  </p>
                  {order.delivery_latitude && order.delivery_longitude && (
                    <a 
                      href={`https://www.google.com/maps?q=${order.delivery_latitude},${order.delivery_longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-300 hover:text-blue-200 underline flex items-center gap-1 w-fit"
                    >
                      <MapPin className="w-3 h-3" /> View on Map
                    </a>
                  )}
                </div>
              )}

              <div className="space-y-2 mb-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 glass rounded-lg p-2">
                    <span className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="flex-1 text-sm text-ink-200">{item.menu_item_name}</span>
                    <span className="text-xs text-ink-400 capitalize">{item.portion}</span>
                    <span className="text-sm font-semibold text-nirvana-300">{item.quantity}x</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-ink-400 mb-3">
                <span>{formatTime(order.created_at)}</span>
                <span>{order.items_count} items</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {order.status === 'new' && (
                  <button onClick={() => updateOrderStatus(order.id, 'accepted')} className="btn-gold flex-1 !py-2 text-sm">
                    Accept
                  </button>
                )}
                {order.status === 'accepted' && (
                  <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="btn-gold flex-1 !py-2 text-sm">
                    Start Preparing
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button onClick={() => updateOrderStatus(order.id, 'ready')} className="btn-gold flex-1 !py-2 text-sm">
                    {order.order_type === 'delivery' ? 'Out for Delivery' : 'Mark Ready'}
                  </button>
                )}
                {order.status === 'ready' && (
                  <button onClick={() => updateOrderStatus(order.id, 'served')} className="btn-gold flex-1 !py-2 text-sm">
                    {order.order_type === 'delivery' ? 'Mark Reached' : 'Mark Served'}
                  </button>
                )}
                {order.status === 'served' && (
                  <button onClick={() => updateOrderStatus(order.id, 'completed')} className="btn-gold flex-1 !py-2 text-sm">
                    Complete
                  </button>
                )}
                {['new', 'accepted'].includes(order.status) && (
                  <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="btn-outline-gold !py-2 !px-3 text-sm border-red-500/30 text-red-400 hover:bg-red-500/10">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
