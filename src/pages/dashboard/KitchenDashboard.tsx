import { useEffect, useState, useCallback } from 'react';
import { ChefHat, Clock, CheckCircle2, AlertCircle, Bell, Utensils, X, MapPin, Receipt, MessageSquare, ArrowRight, Bike, BellRing, ClipboardList } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatTime, timeAgo, formatOrderStatus } from '@/lib/format';
import type { Order, OrderItem, OrderStatus } from '@/types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';

interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

const STATUS_FLOW: OrderStatus[] = ['new', 'accepted', 'preparing', 'ready', 'served', 'completed'];

const STATUS_STEP_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  new: { label: 'Placed', icon: Receipt, color: 'text-blue-400' },
  accepted: { label: 'Accepted', icon: CheckCircle2, color: 'text-sky-400' },
  preparing: { label: 'Preparing', icon: ChefHat, color: 'text-amber-400' },
  ready: { label: 'Ready', icon: BellRing, color: 'text-orange-400' },
  served: { label: 'Served', icon: Utensils, color: 'text-green-400' },
  completed: { label: 'Done', icon: CheckCircle2, color: 'text-emerald-400' },
};

const NEXT_ACTION_LABELS: Record<string, { label: string; deliveryLabel?: string }> = {
  new: { label: 'Accept Order' },
  accepted: { label: 'Start Preparing' },
  preparing: { label: 'Mark Ready to Serve', deliveryLabel: 'Mark Out for Delivery' },
  ready: { label: 'Mark Served', deliveryLabel: 'Mark Reached' },
  served: { label: 'Complete Order' },
};

function getNextStatus(current: OrderStatus): OrderStatus | null {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

export function KitchenDashboard() {
  const { restaurantId } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'preparing' | 'ready' | 'completed'>('all');
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

  const updateOrderStatus = useCallback(async (order: OrderWithItems, status: OrderStatus) => {
    const updates: Record<string, string | null> = { status };
    if (status === 'accepted') {
      updates.accepted_at = new Date().toISOString();
      if (order.payment_method === 'online') {
        updates.payment_status = 'paid';
      }
    }
    if (status === 'preparing') updates.preparing_at = new Date().toISOString();
    if (status === 'ready') updates.ready_at = new Date().toISOString();
    if (status === 'served') updates.served_at = new Date().toISOString();
    if (status === 'completed') updates.completed_at = new Date().toISOString();

    await supabase.from('orders').update(updates).eq('id', order.id);

    const notifType = status === 'accepted' ? 'order_accepted'
      : status === 'preparing' ? 'order_preparing'
      : status === 'ready' ? 'order_ready'
      : status === 'served' ? 'order_served'
      : status === 'completed' ? 'order_completed'
      : 'order_cancelled';

    await supabase.from('notifications').insert({
      restaurant_id: restaurantId,
      order_id: order.id,
      type: notifType,
      title: `Order ${ORDER_STATUS_LABELS[status]}`,
      message: `Order status updated to ${ORDER_STATUS_LABELS[status]}`,
    });

    // Instantly refresh the UI and switch to the tab showing the updated order
    const tabForStatus: Record<string, 'all' | 'new' | 'preparing' | 'ready' | 'completed'> = {
      new: 'new',
      accepted: 'new',
      preparing: 'preparing',
      ready: 'ready',
      served: 'ready',
      completed: 'completed',
      cancelled: 'new',
    };
    setActiveTab(tabForStatus[status] ?? 'all');
    loadOrders();
  }, [restaurantId]);

  const sendBillWhatsApp = useCallback((order: OrderWithItems) => {
    if (!order.customer_phone) return;
    const phone = order.customer_phone.replace(/[^0-9]/g, '');
    const formattedPhone = phone.startsWith('91') ? phone : `91${phone}`;
    const billLines = order.order_items.map(i => `• ${i.menu_item_name} x${i.quantity} — ₹${i.total_price}`);
    const msg = `🧾 *Your Bill — Order ${order.order_number}*

${billLines.join('\n')}

*Total: ₹${order.total_amount}*
Payment: ${order.payment_method === 'cash' ? 'Cash' : 'Online'}
${order.order_type === 'dine_in' ? `Table: ${order.table_number}` : 'Delivery Order'}

Thank you for ordering! 🙏`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  }, []);

  const sendCustomWhatsApp = useCallback((order: OrderWithItems, customMsg: string) => {
    if (!order.customer_phone) return;
    const phone = order.customer_phone.replace(/[^0-9]/g, '');
    const formattedPhone = phone.startsWith('91') ? phone : `91${phone}`;
    const msg = `Re: Order ${order.order_number}\n\n${customMsg}`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'new') return ['new', 'accepted'].includes(o.status);
    if (activeTab === 'preparing') return o.status === 'preparing';
    if (activeTab === 'ready') return ['ready', 'served'].includes(o.status);
    if (activeTab === 'completed') return o.status === 'completed';
    return false;
  });

  const counts = {
    all: orders.length,
    new: orders.filter(o => ['new', 'accepted'].includes(o.status)).length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => ['ready', 'served'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'completed').length,
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
          <h1 className="font-serif text-2xl sm:text-3xl text-ink-950 mb-1 flex items-center gap-2">
            <ChefHat className="w-7 h-7" /> Kitchen Display
          </h1>
          <p className="text-sm text-ink-600">Live order preparation system</p>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`btn-outline-gold !py-2 flex items-center gap-2 ${soundEnabled ? 'text-nirvana-300' : 'text-ink-600'}`}
        >
          <Bell className="w-4 h-4" />
          {soundEnabled ? 'Sound On' : 'Sound Off'}
        </button>
      </div>

      {/* Tab Counts */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {([
          { key: 'all', label: 'All Orders', icon: ClipboardList, color: 'text-nirvana-300' },
          { key: 'new', label: 'New Orders', icon: AlertCircle, color: 'text-blue-400' },
          { key: 'preparing', label: 'Preparing', icon: Clock, color: 'text-amber-400' },
          { key: 'ready', label: 'Ready / Served', icon: BellRing, color: 'text-green-400' },
          { key: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-400' },
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
                <span className="text-2xl font-serif text-ink-950">{counts[tab.key]}</span>
              </div>
              <p className="text-xs text-ink-600">{tab.label}</p>
            </button>
          );
        })}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="card-luxury p-12 text-center">
          <ChefHat className="w-12 h-12 text-ink-600 mx-auto mb-3" />
          <p className="text-ink-600">No orders in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const nextStatus = getNextStatus(order.status);
            const currentStepIdx = STATUS_FLOW.indexOf(order.status);
            const actionConfig = NEXT_ACTION_LABELS[order.status];
            const actionLabel = actionConfig
              ? (order.order_type === 'delivery' && actionConfig.deliveryLabel
                ? actionConfig.deliveryLabel
                : actionConfig.label)
              : null;

            return (
            <div key={order.id} className="card-luxury p-4 animate-fade-in-up">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-serif text-lg text-nirvana-300">
                    {order.order_number} {order.order_type === 'delivery' && <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">Delivery</span>}
                  </p>
                  <p className="text-xs text-ink-600">
                    {order.order_type === 'delivery' ? 'Delivery' : `Table ${order.table_number}`} · {timeAgo(order.created_at)}
                  </p>
                </div>
                <span className={`badge ${ORDER_STATUS_COLORS[order.status]} capitalize`}>
                  {formatOrderStatus(order.status, order.order_type)}
                </span>
              </div>

              {/* Inline Status Stepper */}
              <div className="mb-4 p-3 glass rounded-xl">
                <div className="flex items-center justify-between relative">
                  {/* Background track */}
                  <div className="absolute left-3 right-3 top-[13px] h-0.5 bg-white/10" />
                  {/* Progress track */}
                  <div
                    className="absolute left-3 top-[13px] h-0.5 bg-gradient-to-r from-nirvana-400 to-nirvana-300 transition-all duration-500"
                    style={{ width: `${currentStepIdx >= 0 ? (currentStepIdx / (STATUS_FLOW.length - 1)) * (100 - 6) : 0}%` }}
                  />
                  {STATUS_FLOW.map((s, idx) => {
                    const stepConfig = STATUS_STEP_CONFIG[s];
                    const Icon = stepConfig.icon;
                    const isDone = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div key={s} className="relative z-10 flex flex-col items-center" style={{ minWidth: '26px' }}>
                        <div
                          className={`w-[26px] h-[26px] rounded-full flex items-center justify-center transition-all duration-300 ${
                            isDone
                              ? 'bg-gradient-gold text-ink-950'
                              : 'bg-ink-800/60 text-ink-500'
                          } ${isCurrent ? 'ring-2 ring-nirvana-400/40 scale-110' : ''}`}
                        >
                          <Icon className="w-3 h-3" />
                        </div>
                        <span className={`text-[9px] mt-1 whitespace-nowrap ${isDone ? 'text-nirvana-300' : 'text-ink-500'}`}>
                          {stepConfig.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
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
                    <span className="flex-1 text-sm text-ink-800">{item.menu_item_name}</span>
                    <span className="text-xs text-ink-600 capitalize">{item.portion}</span>
                    <span className="text-sm font-semibold text-nirvana-300">{item.quantity}x</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-ink-600 mb-3">
                <span>{formatTime(order.created_at)}</span>
                <span>{order.items_count} items</span>
              </div>

                {/* WhatsApp Bill / Message Buttons */}
                {order.customer_phone && (
                  <div className="flex gap-2 mb-3">
                    <button 
                      onClick={() => sendBillWhatsApp(order)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5" /> WhatsApp Bill
                    </button>
                    <button 
                      onClick={() => {
                        const msg = prompt('Type your message to the customer:');
                        if (msg) sendCustomWhatsApp(order, msg);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Msg
                    </button>
                  </div>
                )}

                {/* Primary Next-Action Button */}
                <div className="flex gap-2">
                  {nextStatus && actionLabel && (
                    <button
                      onClick={() => updateOrderStatus(order, nextStatus)}
                      className="btn-gold flex-1 !py-2.5 text-sm flex items-center justify-center gap-2 font-semibold"
                    >
                      {actionLabel}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  {order.status === 'completed' && (
                    <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                      Order Complete
                    </div>
                  )}
                  {['new', 'accepted'].includes(order.status) && (
                    <button onClick={() => updateOrderStatus(order, 'cancelled')} className="btn-outline-gold !py-2 !px-3 text-sm border-red-500/30 text-red-400 hover:bg-red-500/10">
                      <X className="w-4 h-4" />
                    </button>
                  )}
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}
