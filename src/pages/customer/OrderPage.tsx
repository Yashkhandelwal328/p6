import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate as useNavigateRouter } from 'react-router-dom';
import { Search, Plus, Minus, ShoppingCart, X, Clock, Star, Flame, Leaf, Utensils, Filter, ShoppingBag, ArrowLeft, MessageSquare, ChefHat, Store, MapPin, Navigation } from 'lucide-react';
import { supabase, DEFAULT_RESTAURANT_ID } from '@/lib/supabase';
import { formatCurrency, formatTime } from '@/lib/format';
import type { Category, MenuItem, CartItem, Portion, Restaurant, Table } from '@/types';

export function OrderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigateRouter();
  const orderType = searchParams.get('type') === 'delivery' ? 'delivery' : 'dine_in';
  const tableNumber = parseInt(searchParams.get('table') || '1', 10);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [table, setTable] = useState<Table | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryLat, setDeliveryLat] = useState<number | null>(null);
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Haversine formula
  const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setGettingLocation(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDeliveryLat(position.coords.latitude);
        setDeliveryLng(position.coords.longitude);
        setGettingLocation(false);
        setDeliveryAddress((prev) => prev ? prev : 'Location captured via GPS');
      },
      () => {
        setError('Unable to retrieve your location. Please ensure you have granted location permissions.');
        setGettingLocation(false);
      }
    );
  };

  useEffect(() => {
    async function loadData() {
      const [restRes, catRes, menuRes] = await Promise.all([
        supabase.from('restaurants').select('*').eq('id', DEFAULT_RESTAURANT_ID).maybeSingle(),
        supabase.from('categories').select('*').eq('restaurant_id', DEFAULT_RESTAURANT_ID).order('sort_order'),
        supabase.from('menu_items').select('*').eq('restaurant_id', DEFAULT_RESTAURANT_ID).order('sort_order'),
      ]);

      if (restRes.data) setRestaurant(restRes.data);
      if (catRes.data) setCategories(catRes.data);
      if (menuRes.data) setMenuItems(menuRes.data);

      if (orderType === 'dine_in') {
        const tableRes = await supabase.from('tables').select('*').eq('restaurant_id', DEFAULT_RESTAURANT_ID).eq('table_number', tableNumber).maybeSingle();
        if (tableRes.data) setTable(tableRes.data);
      }
      
      setLoading(false);
    }
    loadData();
  }, [tableNumber, orderType]);

  const topLevelCategories = useMemo(
    () => categories.filter((c) => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order),
    [categories],
  );

  const subCategories = useMemo(
    () => categories.filter((c) => c.parent_id === activeCategory),
    [categories, activeCategory],
  );

  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (activeCategory !== 'all') {
      const childIds = categories.filter((c) => c.parent_id === activeCategory).map((c) => c.id);
      const categoryIds = [activeCategory, ...childIds];
      items = items.filter((i) => categoryIds.includes(i.category_id));
    }
    if (vegFilter !== 'all') {
      items = items.filter((i) => (vegFilter === 'veg' ? i.is_veg : !i.is_veg));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description?.toLowerCase().includes(q) ?? false),
      );
    }
    return items;
  }, [menuItems, activeCategory, categories, vegFilter, searchQuery]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const taxRate = restaurant?.tax_percentage ?? 0;
  const taxAmount = 0; // Tax removed as requested
  const grandTotal = cartTotal;

  const addToCart = useCallback((item: MenuItem, portion: Portion = 'full') => {
    const price = portion === 'half' && item.half_price ? item.half_price : item.full_price;
    setCart((prev) => {
      const existing = prev.find((c) => c.menu_item.id === item.id && c.portion === portion);
      if (existing) {
        return prev.map((c) =>
          c === existing ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { menu_item: item, portion, quantity: 1, unit_price: price }];
    });
  }, []);

  const updateQty = useCallback((itemId: string, portion: Portion, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menu_item.id === itemId && c.portion === portion);
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((c) => c !== existing);
      }
      return prev.map((c) => (c === existing ? { ...c, quantity: newQty } : c));
    });
  }, []);

  const getCartQty = (itemId: string, portion: Portion) => {
    const item = cart.find((c) => c.menu_item.id === itemId && c.portion === portion);
    return item?.quantity ?? 0;
  };

  async function placeOrder() {
    if (cart.length === 0) return;
    
    // Validations for delivery
    if (orderType === 'delivery') {
      if (!customerPhone) {
        setError('Phone number is required for delivery.');
        return;
      }
      if (!deliveryAddress) {
        setError('Delivery address is required.');
        return;
      }
      if (restaurant?.min_delivery_amount && cartTotal < restaurant.min_delivery_amount) {
        setError(`Minimum order amount for delivery is ${formatCurrency(restaurant.min_delivery_amount, restaurant.currency)}`);
        return;
      }
      if (restaurant?.max_delivery_radius_km && restaurant.restaurant_latitude && restaurant.restaurant_longitude && deliveryLat && deliveryLng) {
        const distance = getDistanceInKm(deliveryLat, deliveryLng, restaurant.restaurant_latitude, restaurant.restaurant_longitude);
        if (distance > restaurant.max_delivery_radius_km) {
          setError(`Sorry, we only deliver within a ${restaurant.max_delivery_radius_km}km radius. You are ${distance.toFixed(1)}km away.`);
          return;
        }
      } else if (restaurant?.max_delivery_radius_km && (!deliveryLat || !deliveryLng)) {
        setError('Please use the GPS button to verify your location is within our delivery radius.');
        return;
      }
    }

    setPlacing(true);
    setError(null);

    try {
      const orderNumber = `NV${new Date().toISOString().slice(2, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurant_id: DEFAULT_RESTAURANT_ID,
          table_id: orderType === 'dine_in' ? table?.id : null,
          table_number: orderType === 'dine_in' ? tableNumber : null,
          order_type: orderType,
          delivery_address: orderType === 'delivery' ? deliveryAddress : null,
          delivery_latitude: orderType === 'delivery' ? deliveryLat : null,
          delivery_longitude: orderType === 'delivery' ? deliveryLng : null,
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
          order_number: orderNumber,
          status: 'new',
          payment_status: 'pending',
          subtotal: cartTotal,
          tax_amount: taxAmount,
          service_charge: 0,
          total_amount: grandTotal,
          special_instructions: specialInstructions || null,
          items_count: cartCount,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        restaurant_id: DEFAULT_RESTAURANT_ID,
        menu_item_id: item.menu_item.id,
        menu_item_name: item.menu_item.name,
        menu_item_image: item.menu_item.image_url,
        is_veg: item.menu_item.is_veg,
        portion: item.portion,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total_price: item.unit_price * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      await supabase.from('notifications').insert({
        restaurant_id: DEFAULT_RESTAURANT_ID,
        order_id: order.id,
        type: 'new_order',
        title: orderType === 'delivery' ? 'New Delivery Order' : 'New Order Received',
        message: orderType === 'delivery' 
          ? `Delivery Order ${orderNumber} — ${cartCount} items`
          : `Order ${orderNumber} from Table ${tableNumber} — ${cartCount} items`,
      });

      if (orderType === 'dine_in' && table) {
        await supabase.from('tables').update({ status: 'occupied', current_order_id: order.id }).eq('id', table.id);
      }

      navigate(`/order/status/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-nirvana-400/30 border-t-nirvana-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-nirvana-300 font-display text-lg">Preparing your menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-dark border-b border-nirvana-400/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-xl sm:text-2xl text-gradient-gold leading-tight">
                {restaurant?.name ?? 'Nirvana'}
              </h1>
              <p className="text-xs sm:text-sm text-nirvana-300/70 font-display">
                {orderType === 'delivery' ? 'Delivery Order' : `Ordering from Table ${tableNumber}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="btn-outline-gold !px-4 !py-2.5 flex items-center gap-2 text-sm"
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">Owner Login</span>
              </button>
              <button
                onClick={() => setCartOpen(true)}
                className="relative btn-gold !px-4 !py-2.5 flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-coffee opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-gold mb-4 animate-fade-in-down">
            <Utensils className="w-4 h-4 text-nirvana-400" />
            <span className="text-sm text-nirvana-300 font-medium">Welcome to Nirvana</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-gradient-gold mb-3 animate-fade-in-up">
            The Family Restaurant
          </h2>
          <p className="text-ink-300 text-sm sm:text-base max-w-xl mx-auto animate-fade-in">
            {restaurant?.tagline ?? 'Premium Family Dining Experience'}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="sticky top-[73px] z-30 bg-ink-950/80 backdrop-blur-xl border-b border-white/5 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-luxury w-full pl-12"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-luxury pb-1">
            <button
              onClick={() => setVegFilter('all')}
              className={`badge whitespace-nowrap transition-all ${vegFilter === 'all' ? 'bg-nirvana-400/20 text-nirvana-300 border-nirvana-400/40' : 'glass-dark text-ink-300 border-white/10'}`}
            >
              <Filter className="w-3 h-3" /> All
            </button>
            <button
              onClick={() => setVegFilter('veg')}
              className={`badge whitespace-nowrap transition-all ${vegFilter === 'veg' ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'glass-dark text-ink-300 border-white/10'}`}
            >
              <Leaf className="w-3 h-3" /> Veg
            </button>
            <button
              onClick={() => setVegFilter('nonveg')}
              className={`badge whitespace-nowrap transition-all ${vegFilter === 'nonveg' ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'glass-dark text-ink-300 border-white/10'}`}
            >
              <Flame className="w-3 h-3" /> Non-Veg
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-[145px] z-20 bg-ink-950/60 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-luxury py-3">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-gradient-gold text-ink-950'
                  : 'glass-dark text-ink-300 hover:text-nirvana-300'
              }`}
            >
              All Items
            </button>
            {topLevelCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-gradient-gold text-ink-950'
                    : 'glass-dark text-ink-300 hover:text-nirvana-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-32">
        {subCategories.length > 0 && (
          <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-luxury">
            {subCategories.map((sub) => (
              <span key={sub.id} className="badge glass-gold text-nirvana-300 border-nirvana-400/20 whitespace-nowrap">
                {sub.name}
              </span>
            ))}
          </div>
        )}

        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-ink-400 text-lg">No items found</p>
            <p className="text-ink-500 text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item, idx) => {
              const fullQty = getCartQty(item.id, 'full');
              const halfQty = getCartQty(item.id, 'half');
              const hasHalf = item.has_half_price && item.half_price != null;

              return (
                <div
                  key={item.id}
                  className={`card-luxury overflow-hidden group animate-fade-in-up ${!item.is_available ? 'opacity-50 grayscale' : ''}`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="relative h-44 overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.fallback-icon')) {
                            const div = document.createElement('div');
                            div.className = 'w-full h-full bg-ink-800 flex items-center justify-center fallback-icon';
                            const icon = document.createElement('div');
                            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ink-600"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a2 2 0 0 0-2 2v6h-4a2 2 0 0 0 0 4h2"/></svg>';
                            div.appendChild(icon);
                            parent.appendChild(div);
                          }
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-ink-800 flex items-center justify-center">
                        <Utensils className="w-12 h-12 text-ink-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent" />

                    {/* Veg/Non-Veg Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`badge ${item.is_veg ? 'bg-green-500/90 text-white border-green-400' : 'bg-red-500/90 text-white border-red-400'}`}>
                        {item.is_veg ? <Leaf className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                        {item.is_veg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>

                    {/* Bestseller & Chef's Special Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                      {item.is_bestseller && (
                        <span className="badge bg-nirvana-400/90 text-ink-950 border-nirvana-300">
                          <Star className="w-3 h-3 fill-current" /> Bestseller
                        </span>
                      )}
                      {item.is_chef_special && (
                        <span className="badge bg-amber-500/90 text-ink-950 border-amber-400">
                          <ChefHat className="w-3 h-3" /> Chef's Special
                        </span>
                      )}
                    </div>

                    {/* Out of Stock overlay */}
                    {!item.is_available && (
                      <div className="absolute inset-0 bg-ink-950/60 flex items-center justify-center">
                        <span className="badge bg-red-500/90 text-white border-red-400 text-sm font-semibold">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-serif text-lg text-ink-100 leading-tight">{item.name}</h3>
                      {item.rating > 0 && (
                        <span className="flex items-center gap-1 text-xs text-nirvana-300 whitespace-nowrap">
                          <Star className="w-3 h-3 fill-current" />
                          {item.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-ink-400 line-clamp-2 mb-3">
                      {item.description ?? 'No description available'}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-ink-400 mb-3">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.preparation_time_minutes} min</span>
                    </div>

                    {item.is_available ? (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          {hasHalf ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-ink-400">Half: <span className="text-nirvana-300 font-semibold">{formatCurrency(item.half_price!, restaurant?.currency)}</span></span>
                              <span className="text-xs text-ink-400">Full: <span className="text-nirvana-300 font-semibold">{formatCurrency(item.full_price, restaurant?.currency)}</span></span>
                            </div>
                          ) : (
                            <span className="text-xl font-serif text-nirvana-300">{formatCurrency(item.full_price, restaurant?.currency)}</span>
                          )}
                        </div>

                        {hasHalf ? (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm text-ink-300">Half Portion</span>
                              {halfQty === 0 ? (
                                <button
                                  onClick={() => addToCart(item, 'half')}
                                  className="btn-gold !px-3 !py-1.5 text-sm flex items-center gap-1"
                                >
                                  <Plus className="w-4 h-4" /> Add
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 glass-gold rounded-lg p-1">
                                  <button onClick={() => updateQty(item.id, 'half', -1)} className="w-7 h-7 flex items-center justify-center text-nirvana-300 hover:bg-nirvana-400/10 rounded-md transition-colors">
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="text-nirvana-300 font-semibold w-6 text-center">{halfQty}</span>
                                  <button onClick={() => updateQty(item.id, 'half', 1)} className="w-7 h-7 flex items-center justify-center text-nirvana-300 hover:bg-nirvana-400/10 rounded-md transition-colors">
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm text-ink-300">Full Portion</span>
                              {fullQty === 0 ? (
                                <button
                                  onClick={() => addToCart(item, 'full')}
                                  className="btn-gold !px-3 !py-1.5 text-sm flex items-center gap-1"
                                >
                                  <Plus className="w-4 h-4" /> Add
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 glass-gold rounded-lg p-1">
                                  <button onClick={() => updateQty(item.id, 'full', -1)} className="w-7 h-7 flex items-center justify-center text-nirvana-300 hover:bg-nirvana-400/10 rounded-md transition-colors">
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="text-nirvana-300 font-semibold w-6 text-center">{fullQty}</span>
                                  <button onClick={() => updateQty(item.id, 'full', 1)} className="w-7 h-7 flex items-center justify-center text-nirvana-300 hover:bg-nirvana-400/10 rounded-md transition-colors">
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3">
                            {fullQty === 0 ? (
                              <button
                                onClick={() => addToCart(item, 'full')}
                                className="btn-gold w-full !py-2 text-sm flex items-center justify-center gap-1"
                              >
                                <Plus className="w-4 h-4" /> Add to Cart
                              </button>
                            ) : (
                              <div className="flex items-center justify-between gap-2 glass-gold rounded-lg p-1.5">
                                <button onClick={() => updateQty(item.id, 'full', -1)} className="w-8 h-8 flex items-center justify-center text-nirvana-300 hover:bg-nirvana-400/10 rounded-md transition-colors">
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-nirvana-300 font-semibold">{fullQty}</span>
                                <button onClick={() => updateQty(item.id, 'full', 1)} className="w-8 h-8 flex items-center justify-center text-nirvana-300 hover:bg-nirvana-400/10 rounded-md transition-colors">
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="mt-3">
                        <button disabled className="w-full px-4 py-2 rounded-xl bg-ink-800 text-ink-500 text-sm font-medium cursor-not-allowed border border-white/5">
                          Out of Stock
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Sticky Cart Bar */}
      {cartCount > 0 && !cartOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 animate-fade-in-up">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => setCartOpen(true)}
              className="w-full btn-gold flex items-center justify-between px-6 py-4 shadow-gold-lg"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
              <span className="flex items-center gap-2">
                {formatCurrency(cartTotal, restaurant?.currency)}
                <span className="text-ink-950/60">·</span>
                <span>View Cart</span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in" onClick={() => setCartOpen(false)}>
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-ink-900 border-l border-nirvana-400/20 h-full overflow-y-auto scrollbar-luxury animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 glass-dark border-b border-nirvana-400/10 px-5 py-4 flex items-center justify-between">
              <h3 className="font-serif text-xl text-gradient-gold">Your Cart</h3>
              <button onClick={() => setCartOpen(false)} className="w-9 h-9 flex items-center justify-center glass rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-ink-300" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag className="w-12 h-12 text-ink-600 mx-auto mb-3" />
                  <p className="text-ink-400">Your cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={`${item.menu_item.id}-${item.portion}`} className="glass-dark rounded-xl p-3 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      {item.menu_item.image_url ? (
                        <img src={item.menu_item.image_url} alt={item.menu_item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-ink-800 flex items-center justify-center">
                          <Utensils className="w-5 h-5 text-ink-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-100 truncate">{item.menu_item.name}</p>
                      <p className="text-xs text-ink-400 capitalize">{item.portion} · {formatCurrency(item.unit_price, restaurant?.currency)}</p>
                    </div>
                    <div className="flex items-center gap-2 glass-gold rounded-lg p-1">
                      <button onClick={() => updateQty(item.menu_item.id, item.portion, -1)} className="w-7 h-7 flex items-center justify-center text-nirvana-300 hover:bg-nirvana-400/10 rounded-md">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-nirvana-300 font-semibold text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.menu_item.id, item.portion, 1)} className="w-7 h-7 flex items-center justify-center text-nirvana-300 hover:bg-nirvana-400/10 rounded-md">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="sticky bottom-0 glass-dark border-t border-nirvana-400/10 p-5 space-y-3">
                <div className="flex justify-between text-sm text-ink-300">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotal, restaurant?.currency)}</span>
                </div>

                <div className="flex justify-between text-base font-serif text-nirvana-300 pt-2 border-t border-white/5">
                  <span>Total</span>
                  <span>{formatCurrency(grandTotal, restaurant?.currency)}</span>
                </div>
                <button
                  onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                  className="btn-gold w-full"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setCheckoutOpen(false)}>
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg glass-dark border border-nirvana-400/20 rounded-2xl p-6 max-h-[90vh] overflow-y-auto scrollbar-luxury animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl text-gradient-gold">Checkout</h3>
              <button onClick={() => setCheckoutOpen(false)} className="w-9 h-9 flex items-center justify-center glass rounded-lg hover:bg-white/10">
                <X className="w-5 h-5 text-ink-300" />
              </button>
            </div>

            {orderType === 'dine_in' ? (
              <div className="mb-4 glass rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-nirvana-400/15 flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-nirvana-400" />
                </div>
                <div>
                  <p className="text-sm text-ink-400">Table Number</p>
                  <p className="text-lg font-serif text-nirvana-300">Table {tableNumber}</p>
                </div>
              </div>
            ) : (
              <div className="mb-4 space-y-4">
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-ink-300 flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> Delivery Address
                    </label>
                    <button 
                      onClick={handleGetLocation} 
                      disabled={gettingLocation}
                      className="text-xs flex items-center gap-1 text-nirvana-400 hover:text-nirvana-300 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      {gettingLocation ? 'Locating...' : 'Use My Location'}
                    </button>
                  </div>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter complete delivery address..."
                    rows={2}
                    className="input-luxury w-full resize-none"
                  />
                  {deliveryLat && deliveryLng && (
                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> GPS Location Captured
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-ink-300 mb-1.5">Your Name (optional)</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="input-luxury w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-ink-300 mb-1.5">Phone {orderType === 'delivery' && <span className="text-red-400">*</span>}</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter your phone"
                  className="input-luxury w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-ink-300 mb-1.5 flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" /> Special Instructions
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g., less spicy, no onions, extra gravy..."
                  rows={3}
                  className="input-luxury w-full resize-none"
                />
              </div>
            </div>

            <div className="glass rounded-xl p-4 space-y-2 mb-6">
              <div className="flex justify-between text-sm text-ink-300">
                <span>Items ({cartCount})</span>
                <span>{formatCurrency(cartTotal, restaurant?.currency)}</span>
              </div>

              <div className="flex justify-between text-lg font-serif text-nirvana-300 pt-2 border-t border-white/5">
                <span>Total</span>
                <span>{formatCurrency(grandTotal, restaurant?.currency)}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setCheckoutOpen(false)} className="btn-outline-gold flex-1">
                Back
              </button>
              <button
                onClick={placeOrder}
                disabled={placing || cart.length === 0}
                className="btn-gold flex-1"
              >
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
