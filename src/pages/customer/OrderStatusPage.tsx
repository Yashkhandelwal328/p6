import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, ChefHat, BellRing, Utensils, XCircle, ArrowLeft, Receipt, ShoppingBag, MapPin, Bike, MessageSquare, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/context/ThemeContext';
import { formatCurrency, formatTime, timeAgo } from '@/lib/format';
import type { Order, OrderItem, OrderStatus, Restaurant } from '@/types';

const DINE_IN_STATUS_STEPS: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: 'new', label: 'Order Placed', icon: Receipt },
  { status: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { status: 'preparing', label: 'Preparing', icon: ChefHat },
  { status: 'ready', label: 'Ready to Serve', icon: BellRing },
  { status: 'served', label: 'Served', icon: Utensils },
  { status: 'completed', label: 'Completed', icon: CheckCircle2 },
];

const DELIVERY_STATUS_STEPS: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: 'new', label: 'Order Placed', icon: Receipt },
  { status: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { status: 'preparing', label: 'Food Being Made', icon: ChefHat },
  { status: 'ready', label: 'Out for Delivery', icon: Bike },
  { status: 'served', label: 'Reached', icon: MapPin },
  { status: 'completed', label: 'Completed', icon: CheckCircle2 },
];

export function OrderStatusPage() {
  const { slug, orderId } = useParams<{ slug?: string, orderId: string }>();
  const { isCustomDomain } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table') || '';
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPaidOnline, setHasPaidOnline] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    async function loadOrder() {
      const [orderRes, itemsRes, restRes] = await Promise.all([
        supabase.from('orders').select('*').eq('id', orderId!).maybeSingle(),
        supabase.from('order_items').select('*').eq('order_id', orderId!),
        supabase.from('restaurants').select('*').eq('subdomain', slug).maybeSingle(),
      ]);

      if (orderRes.data) setOrder(orderRes.data);
      if (itemsRes.data) setItems(itemsRes.data);
      if (restRes.data) setRestaurant(restRes.data);
      setLoading(false);
    }
    loadOrder();

    const channel = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, (payload) => {
        if (payload.new && typeof payload.new === 'object') {
          setOrder(payload.new as Order);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-nirvana-400/30 border-t-nirvana-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    const basePath = slug ? `/${slug}` : '';
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-6">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-ink-300 mb-4">Order not found</p>
          <button onClick={() => navigate(`${basePath}/menu?table=${tableNumber || 1}`)} className="btn-gold">
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const currentSteps = order.order_type === 'delivery' ? DELIVERY_STATUS_STEPS : DINE_IN_STATUS_STEPS;
  const currentStepIndex = currentSteps.findIndex((s) => s.status === order.status);
  const currency = restaurant?.currency ?? '₹';

  return (
    <div className="min-h-screen bg-gradient-dark">
      <header className="glass-dark border-b border-nirvana-400/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              const basePath = slug ? `/${slug}` : '';
              navigate(order.order_type === 'delivery' ? `${basePath}/menu?type=delivery` : `${basePath}/menu?table=${order.table_number}`);
            }}
            className="flex items-center gap-2 text-ink-300 hover:text-nirvana-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Menu</span>
          </button>
          <div className="text-right">
            <p className="text-xs text-ink-600">Order</p>
            <p className="font-serif text-nirvana-300">{order.order_number}</p>
          </div>
        </div>
      </header>

      {order.payment_method === 'online' && order.payment_status === 'pending' ? (
        <main className="max-w-lg mx-auto px-4 sm:px-6 py-12 text-center animate-fade-in-up">
          {!hasPaidOnline ? (
            <div className="card-luxury p-8">
              <h2 className="font-serif text-2xl text-ink-950 mb-2">Complete Your Payment</h2>
              <p className="text-ink-300 text-sm mb-6">
                Please scan the QR code below to pay <strong className="text-nirvana-300">{formatCurrency(order.total_amount, currency)}</strong>
              </p>
              
              {restaurant?.payment_qr_url ? (
                <div className="w-64 h-64 mx-auto bg-white p-4 rounded-xl shadow-gold-lg mb-8 relative">
                  <img src={restaurant.payment_qr_url} alt="Payment QR" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-64 h-64 mx-auto glass rounded-xl flex items-center justify-center text-ink-600 mb-8 border border-white/5">
                  <span className="text-sm">QR Code not configured</span>
                </div>
              )}

              <button 
                onClick={() => setHasPaidOnline(true)}
                className="btn-gold w-full !py-3 text-lg"
              >
                I Have Paid
              </button>
            </div>
          ) : (
            <div className="card-luxury p-8">
              <div className="w-20 h-20 mx-auto glass-gold rounded-full flex items-center justify-center mb-6">
                <Clock className="w-10 h-10 text-nirvana-400 animate-pulse" />
              </div>
              <h2 className="font-serif text-2xl text-ink-950 mb-3">Verifying Payment...</h2>
              <p className="text-ink-300">
                We're waiting for the restaurant to confirm receipt of your payment. This page will update automatically once verified.
              </p>
            </div>
          )}
        </main>
      ) : (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Status Header */}
          <div className="text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-gold mb-4">
            {order.order_type === 'delivery' ? (
              <>
                <ShoppingBag className="w-4 h-4 text-nirvana-400" />
                <span className="text-sm text-nirvana-300">Delivery Order</span>
              </>
            ) : (
              <>
                <Utensils className="w-4 h-4 text-nirvana-400" />
                <span className="text-sm text-nirvana-300">Table {order.table_number}</span>
              </>
            )}
          </div>
          <h1 className="font-serif text-3xl text-ink-950 mb-2">
            {isCancelled ? 'Order Cancelled' : currentSteps[currentStepIndex]?.label ?? 'Order Status'}
          </h1>
          <p className="text-ink-600 text-sm">
            Placed {timeAgo(order.created_at)} · {formatTime(order.created_at)}
          </p>
        </div>

        {/* Progress Tracker */}
        {!isCancelled && (
          <div className="card-luxury p-6 animate-fade-in-up">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-6 h-0.5 bg-white/5" />
              <div
                className="absolute left-0 top-6 h-0.5 bg-gradient-gold transition-all duration-500"
                style={{ width: `${(currentStepIndex / (currentSteps.length - 1)) * 100}%` }}
              />
              {currentSteps.map((step, idx) => {
                const isDone = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const Icon = step.icon;
                return (
                  <div key={step.status} className="relative z-10 flex flex-col items-center gap-2">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isDone
                          ? 'bg-gradient-gold text-ink-950'
                          : 'glass-dark text-ink-500'
                      } ${isCurrent ? 'ring-4 ring-nirvana-400/30 animate-pulse-gold' : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs ${isDone ? 'text-nirvana-300' : 'text-ink-500'} hidden sm:block`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Kitchen Message / Bill */}
        {order.kitchen_message && (
          <div className="card-luxury p-5 animate-fade-in-up border border-nirvana-400/20 shadow-gold">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-ink-950">
                <Receipt className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-lg text-nirvana-300">Message from Restaurant</h3>
            </div>
            <p className="text-sm text-ink-200 whitespace-pre-wrap leading-relaxed">{order.kitchen_message}</p>
          </div>
        )}

        {isCancelled && (
          <div className="card-luxury p-6 text-center border-red-500/20">
            <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-ink-300">This order has been cancelled by the restaurant.</p>
          </div>
        )}

        {/* Order Items */}
        <div className="card-luxury p-5 animate-fade-in-up">
          <h3 className="font-serif text-lg text-nirvana-300 mb-4">Order Details</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 glass rounded-xl p-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  {item.menu_item_image ? (
                    <img src={item.menu_item_image} alt={item.menu_item_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-ink-800 flex items-center justify-center">
                      <Utensils className="w-4 h-4 text-ink-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-100">{item.menu_item_name}</p>
                  <p className="text-xs text-ink-600 capitalize">{item.portion} · Qty {item.quantity}</p>
                </div>
                <span className="text-sm text-nirvana-300 font-medium">{formatCurrency(item.total_price, currency)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="card-luxury p-5 animate-fade-in-up">
          <h3 className="font-serif text-lg text-nirvana-300 mb-4">Bill Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-ink-300">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal, currency)}</span>
            </div>

            {order.service_charge > 0 && (
              <div className="flex justify-between text-sm text-ink-300">
                <span>Service Charge</span>
                <span>{formatCurrency(order.service_charge, currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-serif text-nirvana-300 pt-2 border-t border-white/5">
              <span>Total</span>
              <span>{formatCurrency(order.total_amount, currency)}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between glass rounded-lg p-3">
            <span className="text-sm text-ink-600">Payment Status</span>
            <span className={`badge capitalize ${order.payment_status === 'paid' ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}`}>
              {order.payment_status}
            </span>
          </div>
        </div>

        {order.special_instructions && (
          <div className="card-luxury p-5 animate-fade-in-up">
            <h3 className="font-serif text-lg text-nirvana-300 mb-2">Special Instructions</h3>
            <p className="text-sm text-ink-300">{order.special_instructions}</p>
          </div>
        )}

        {order.order_type === 'delivery' && order.delivery_address && (
          <div className="card-luxury p-5 animate-fade-in-up">
            <h3 className="font-serif text-lg text-nirvana-300 mb-2">Delivery Address</h3>
            <p className="text-sm text-ink-300 whitespace-pre-wrap">{order.delivery_address}</p>
          </div>
        )}

        {/* Review CTA (Only when completed) */}
        {order.status === 'completed' && (
          <div className="card-luxury p-6 text-center animate-fade-in-up border-nirvana-400/30 bg-gradient-to-br from-nirvana-400/10 to-transparent">
            <div className="w-12 h-12 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-serif text-xl text-nirvana-300 mb-2">How was your order?</h3>
            <p className="text-sm text-ink-300 mb-4">We'd love to hear your feedback!</p>
            <Link
              to={isCustomDomain ? '/review' : (slug ? `/${slug}/review` : '/review')}
              className="btn-primary w-full !py-3 flex items-center justify-center gap-2"
            >
              <Star className="w-4 h-4 fill-current" />
              Leave a Review
            </Link>
          </div>
        )}
      </main>
      )}
    </div>
  );
}
