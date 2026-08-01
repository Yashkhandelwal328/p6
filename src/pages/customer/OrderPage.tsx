import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate as useNavigateRouter, useParams } from 'react-router-dom';
import { Search, Plus, Minus, ShoppingCart, X, Clock, Star, Flame, Leaf, Utensils, Filter, ShoppingBag, ArrowLeft, MessageSquare, ChefHat, Store, MapPin, Navigation } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatTime } from '@/lib/format';
import type { Category, MenuItem, CartItem, Portion, Restaurant, Table } from '@/types';
import { useTheme } from '@/context/ThemeContext';

export function OrderPage() {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigateRouter();
  // Local storage persistence key
  const storageKey = `order_state_${slug || 'default'}`;

  // Initialize state from local storage if available
  const getInitialState = (key: string, defaultValue: any) => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[key] !== undefined) return parsed[key];
      }
    } catch (e) {
      console.error('Error reading from localStorage', e);
    }
    return defaultValue;
  };

  const [orderType, setOrderType] = useState<'dine_in' | 'delivery'>(() => getInitialState('orderType', 'dine_in'));
  const initialTable = parseInt(searchParams.get('table') || '1', 10);
  const [tableNumber, setTableNumber] = useState<number>(() => getInitialState('tableNumber', isNaN(initialTable) ? 1 : initialTable));
  const { restaurant: contextRestaurant, previewTheme } = useTheme();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(contextRestaurant);

  useEffect(() => {
    if (contextRestaurant) setRestaurant(contextRestaurant);
  }, [contextRestaurant]);

  const [table, setTable] = useState<Table | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  
  const [cart, setCart] = useState<CartItem[]>(() => getInitialState('cart', []));
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState(() => getInitialState('specialInstructions', ''));
  const [customerName, setCustomerName] = useState(() => getInitialState('customerName', ''));
  const [customerPhone, setCustomerPhone] = useState(() => getInitialState('customerPhone', ''));
  const [deliveryAddress, setDeliveryAddress] = useState(() => getInitialState('deliveryAddress', ''));
  const [deliveryLat, setDeliveryLat] = useState<number | null>(() => getInitialState('deliveryLat', null));
  const [deliveryLng, setDeliveryLng] = useState<number | null>(() => getInitialState('deliveryLng', null));
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>(() => getInitialState('paymentMethod', 'cash'));
  
  const [gettingLocation, setGettingLocation] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state to local storage
  useEffect(() => {
    const stateToSave = {
      orderType,
      tableNumber,
      cart,
      specialInstructions,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryLat,
      deliveryLng,
      paymentMethod
    };
    localStorage.setItem(storageKey, JSON.stringify(stateToSave));
  }, [orderType, tableNumber, cart, specialInstructions, customerName, customerPhone, deliveryAddress, deliveryLat, deliveryLng, paymentMethod, storageKey]);

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
        setDeliveryAddress((prev: string) => prev ? prev : 'Location captured via GPS');
      },
      () => {
        setError('Unable to retrieve your location. Please ensure you have granted location permissions.');
        setGettingLocation(false);
      }
    );
  };

  useEffect(() => {
    async function loadData() {
      let activeRestaurant = restaurant;
      
      // If we don't have a restaurant, try fetching by slug
      if (!activeRestaurant && slug) {
        try {
          const { data } = await supabase.from('restaurants').select('*').eq('subdomain', slug).single();
          if (data) {
            activeRestaurant = data;
            setRestaurant(data);
            previewTheme(data);
          }
        } catch (err) {
          console.error("Failed to load restaurant by slug", err);
        }
      }

      if (!activeRestaurant) {
        setLoading(false);
        return;
      }

      const [catRes, menuRes] = await Promise.all([
        supabase.from('categories').select('*').eq('restaurant_id', activeRestaurant.id).order('sort_order'),
        supabase.from('menu_items').select('*').eq('restaurant_id', activeRestaurant.id).order('sort_order'),
      ]);

      if (catRes.data) setCategories(catRes.data);
      if (menuRes.data) setMenuItems(menuRes.data);

      if (orderType === 'dine_in') {
        const tableRes = await supabase.from('tables').select('*').eq('restaurant_id', activeRestaurant.id).eq('table_number', tableNumber).maybeSingle();
        if (tableRes.data) setTable(tableRes.data);
      }
      
      setLoading(false);
    }
    loadData();
  }, [tableNumber, orderType, slug, restaurant, previewTheme]);

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
  const taxAmount = (cartTotal * taxRate) / 100;
  const grandTotal = cartTotal + taxAmount;

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

      const orderPayload: any = {
        restaurant_id: restaurant!.id,
        table_id: orderType === 'dine_in' ? table?.id : null,
        table_number: orderType === 'dine_in' ? tableNumber : null,
        order_type: orderType,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        order_number: orderNumber,
        status: 'new',
        payment_status: 'pending',
        payment_method: paymentMethod,
        subtotal: cartTotal,
        tax_amount: taxAmount,
        service_charge: 0,
        total_amount: grandTotal,
        special_instructions: specialInstructions || null,
        items_count: cartCount,
      };

      if (orderType === 'delivery') {
        orderPayload.delivery_address = deliveryAddress;
        orderPayload.delivery_latitude = deliveryLat;
        orderPayload.delivery_longitude = deliveryLng;
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        restaurant_id: restaurant!.id,
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
        restaurant_id: restaurant!.id,
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
    } catch (err: any) {
      console.error('Order Error:', err);
      setError(err.message || err.details || 'Failed to place order');
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
    <div className="min-h-screen bg-background text-primary selection:bg-primary selection:text-primary-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-end gap-4">
            {!restaurant?.is_active && (
              <div className="absolute left-1/2 -translate-x-1/2 top-4 hidden md:block">
                <span className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-medium px-4 py-1.5 rounded-full">
                  Currently Closed
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="btn-outline !px-4 !py-2.5 flex items-center gap-2 text-sm text-theme-primary border-theme-border hover:border-primary hover:text-primary transition-colors"
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
      <div className="relative overflow-hidden bg-surface">
        {restaurant?.banner_url ? (
          <img 
            src={restaurant.banner_url} 
            alt={restaurant.name || 'Restaurant Banner'} 
            className="absolute inset-0 w-full h-full object-cover opacity-60" 
          />
        ) : (
          <div className="absolute inset-0 bg-primary/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4 animate-fade-in-down">
            <span className="text-sm text-primary font-medium">Welcome to {restaurant?.name || 'our restaurant'}</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl text-theme-primary mb-3 animate-fade-in-up drop-shadow-sm">
            {restaurant?.name || 'Loading...'}
          </h2>
          <p className="text-theme-secondary text-sm sm:text-base max-w-xl mx-auto animate-fade-in font-medium">
            {restaurant?.tagline ?? ''}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="sticky top-[73px] z-30 bg-background/90 backdrop-blur-xl border-b border-theme-border py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-secondary" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface border border-theme-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-theme-primary placeholder:text-theme-secondary"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setVegFilter('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border flex items-center gap-1 ${vegFilter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-surface text-theme-secondary border-theme-border hover:border-primary'}`}
            >
              <Filter className="w-3 h-3" /> All
            </button>
            <button
              onClick={() => setVegFilter('veg')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border flex items-center gap-1 ${vegFilter === 'veg' ? 'bg-green-500 text-white border-green-500' : 'bg-surface text-theme-secondary border-theme-border hover:border-green-500'}`}
            >
              <Leaf className="w-3 h-3" /> Veg
            </button>
            <button
              onClick={() => setVegFilter('nonveg')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border flex items-center gap-1 ${vegFilter === 'nonveg' ? 'bg-red-500 text-white border-red-500' : 'bg-surface text-theme-secondary border-theme-border hover:border-red-500'}`}
            >
              <Flame className="w-3 h-3" /> Non-Veg
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-[145px] z-20 bg-background/90 backdrop-blur-md border-b border-theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-surface text-theme-secondary hover:text-primary border border-theme-border'
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
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-surface text-theme-secondary hover:text-primary border border-theme-border'
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
          <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide">
            {subCategories.map((sub) => (
              <span key={sub.id} className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                {sub.name}
              </span>
            ))}
          </div>
        )}

        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-2xl border border-theme-border">
            <p className="text-theme-primary text-lg font-medium">No items found</p>
            <p className="text-theme-secondary text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
            {filteredItems.map((item, idx) => {
              const fullQty = getCartQty(item.id, 'full');
              const halfQty = getCartQty(item.id, 'half');
              const hasHalf = item.has_half_price && item.half_price != null;

              return (
                <div
                  key={item.id}
                  className={`bg-surface rounded-2xl overflow-hidden group hover:shadow-lg transition-all border border-theme-border animate-fade-in-up flex flex-col h-full ${!item.is_available ? 'opacity-50 grayscale' : ''}`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="relative aspect-video overflow-hidden bg-background">
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
                            div.className = 'w-full h-full bg-background flex items-center justify-center fallback-icon';
                            const icon = document.createElement('div');
                            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-theme-secondary"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a2 2 0 0 0-2 2v6h-4a2 2 0 0 0 0 4h2"/></svg>';
                            div.appendChild(icon);
                            parent.appendChild(div);
                          }
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Utensils className="w-12 h-12 text-theme-secondary/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

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
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground flex items-center gap-1 shadow-sm uppercase tracking-wider">
                          <Star className="w-2.5 h-2.5 fill-current" /> Bestseller
                        </span>
                      )}
                      {item.is_chef_special && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center gap-1 shadow-sm uppercase tracking-wider">
                          <ChefHat className="w-2.5 h-2.5" /> Chef's Special
                        </span>
                      )}
                    </div>

                    {/* Out of Stock overlay */}
                    {!item.is_available && (
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-red-500 text-white text-sm font-bold shadow-md">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-serif text-lg text-theme-primary leading-tight">{item.name}</h3>
                      {item.rating > 0 && (
                        <span className="flex items-center gap-1 text-xs text-primary font-medium whitespace-nowrap bg-primary/10 px-1.5 py-0.5 rounded-md">
                          <Star className="w-3 h-3 fill-current" />
                          {item.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-theme-secondary line-clamp-2 mb-4 flex-1">
                      {item.description ?? 'No description available'}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-theme-secondary mb-4">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.preparation_time_minutes} min</span>
                    </div>

                    {item.is_available ? (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          {hasHalf ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-theme-secondary">Half: <span className="text-primary font-bold">{formatCurrency(item.half_price!, restaurant?.currency)}</span></span>
                              <span className="text-xs text-theme-secondary">Full: <span className="text-primary font-bold">{formatCurrency(item.full_price, restaurant?.currency)}</span></span>
                            </div>
                          ) : (
                            <span className="text-xl font-serif text-primary font-bold">{formatCurrency(item.full_price, restaurant?.currency)}</span>
                          )}
                        </div>

                        {hasHalf ? (
                          <div className="mt-4 pt-4 border-t border-theme-border space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-theme-primary">Half Portion</span>
                              {halfQty === 0 ? (
                                <button
                                  onClick={() => addToCart(item, 'half')}
                                  className="btn-primary !px-4 !py-1.5 text-sm flex items-center gap-1 rounded-lg"
                                >
                                  <Plus className="w-4 h-4" /> Add
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 bg-primary/10 rounded-lg p-1 border border-primary/20">
                                  <button onClick={() => updateQty(item.id, 'half', -1)} className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/20 rounded-md transition-colors">
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="text-primary font-bold w-6 text-center">{halfQty}</span>
                                  <button onClick={() => updateQty(item.id, 'half', 1)} className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/20 rounded-md transition-colors">
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-theme-primary">Full Portion</span>
                              {fullQty === 0 ? (
                                <button
                                  onClick={() => addToCart(item, 'full')}
                                  className="btn-primary !px-4 !py-1.5 text-sm flex items-center gap-1 rounded-lg"
                                >
                                  <Plus className="w-4 h-4" /> Add
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 bg-primary/10 rounded-lg p-1 border border-primary/20">
                                  <button onClick={() => updateQty(item.id, 'full', -1)} className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/20 rounded-md transition-colors">
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="text-primary font-bold w-6 text-center">{fullQty}</span>
                                  <button onClick={() => updateQty(item.id, 'full', 1)} className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/20 rounded-md transition-colors">
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 pt-4 border-t border-theme-border">
                            {fullQty === 0 ? (
                              <button
                                onClick={() => addToCart(item, 'full')}
                                className="btn-primary w-full !py-2.5 text-sm flex items-center justify-center gap-1 rounded-xl shadow-sm"
                              >
                                <Plus className="w-4 h-4" /> Add to Cart
                              </button>
                            ) : (
                              <div className="flex items-center justify-between gap-2 bg-primary/10 rounded-xl p-1.5 border border-primary/20">
                                <button onClick={() => updateQty(item.id, 'full', -1)} className="w-9 h-9 flex items-center justify-center text-primary hover:bg-primary/20 rounded-lg transition-colors">
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-primary font-bold text-lg">{fullQty}</span>
                                <button onClick={() => updateQty(item.id, 'full', 1)} className="w-9 h-9 flex items-center justify-center text-primary hover:bg-primary/20 rounded-lg transition-colors">
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-theme-border">
                        <button disabled className="w-full px-4 py-2.5 rounded-xl bg-surface text-theme-secondary text-sm font-medium cursor-not-allowed border border-theme-border opacity-60">
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
              className="w-full btn-primary flex items-center justify-between px-6 py-4 shadow-lg rounded-xl"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
              <span className="flex items-center gap-2">
                {formatCurrency(cartTotal, restaurant?.currency)}
                <span className="opacity-60">·</span>
                <span>View Cart</span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in" onClick={() => setCartOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-background border-l border-theme-border h-full overflow-y-auto scrollbar-hide animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-surface/90 backdrop-blur-md border-b border-theme-border px-5 py-4 flex items-center justify-between">
              <h3 className="font-serif text-xl text-theme-primary font-bold">Your Cart</h3>
              <button onClick={() => setCartOpen(false)} className="w-9 h-9 flex items-center justify-center bg-background rounded-lg hover:bg-surface border border-theme-border transition-colors">
                <X className="w-5 h-5 text-theme-secondary" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-20 bg-surface rounded-2xl border border-theme-border">
                  <ShoppingBag className="w-12 h-12 text-theme-secondary/50 mx-auto mb-3" />
                  <p className="text-theme-secondary">Your cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={`${item.menu_item.id}-${item.portion}`} className="bg-surface border border-theme-border rounded-xl p-3 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-background">
                      {item.menu_item.image_url ? (
                        <img src={item.menu_item.image_url} alt={item.menu_item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Utensils className="w-5 h-5 text-theme-secondary/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-theme-primary truncate">{item.menu_item.name}</p>
                      <p className="text-xs text-theme-secondary capitalize">{item.portion} · {formatCurrency(item.unit_price, restaurant?.currency)}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-primary/10 rounded-lg p-1 border border-primary/20">
                      <button onClick={() => updateQty(item.menu_item.id, item.portion, -1)} className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/20 rounded-md transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-primary font-bold text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.menu_item.id, item.portion, 1)} className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/20 rounded-md transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="sticky bottom-0 bg-surface/90 backdrop-blur-md border-t border-theme-border p-5 space-y-3">
                <div className="flex justify-between text-sm text-theme-secondary font-medium">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotal, restaurant?.currency)}</span>
                </div>

                <div className="flex justify-between text-base font-serif text-theme-primary font-bold pt-3 border-t border-theme-border">
                  <span>Total</span>
                  <span>{formatCurrency(grandTotal, restaurant?.currency)}</span>
                </div>
                <button
                  onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                  className="btn-primary w-full"
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-background border border-theme-border rounded-2xl p-6 max-h-[90vh] overflow-y-auto scrollbar-hide animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl text-theme-primary font-bold">Checkout</h3>
              <button onClick={() => setCheckoutOpen(false)} className="w-9 h-9 flex items-center justify-center bg-surface border border-theme-border rounded-lg hover:bg-theme-border/50 transition-colors">
                <X className="w-5 h-5 text-theme-secondary" />
              </button>
            </div>

            <div className="flex bg-surface rounded-lg p-1 mb-6 border border-theme-border">
              <button
                onClick={() => setOrderType('dine_in')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  orderType === 'dine_in' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-theme-secondary hover:text-theme-primary'
                }`}
              >
                Dine-in
              </button>
              <button
                onClick={() => setOrderType('delivery')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  orderType === 'delivery' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-theme-secondary hover:text-theme-primary'
                }`}
              >
                Delivery
              </button>
            </div>

            {orderType === 'dine_in' ? (
              <div className="mb-4 bg-surface rounded-xl p-4 border border-theme-border">
                <label className="block text-sm text-theme-primary font-medium mb-1.5 flex items-center gap-1">
                  <Utensils className="w-4 h-4" /> Table Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 bg-background border border-theme-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-theme-primary placeholder:text-theme-secondary"
                  placeholder="Enter your table number"
                />
              </div>
            ) : (
              <div className="mb-4 space-y-4">
                <div className="bg-surface rounded-xl p-4 border border-theme-border">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-theme-primary font-medium flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> Delivery Address
                    </label>
                    <button 
                      onClick={handleGetLocation} 
                      disabled={gettingLocation}
                      className="text-xs flex items-center gap-1 text-primary hover:opacity-80 transition-opacity font-medium"
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
                    className="w-full px-4 py-2.5 bg-background border border-theme-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-theme-primary placeholder:text-theme-secondary resize-none"
                  />
                  {deliveryLat && deliveryLng && (
                    <p className="text-xs text-green-500 mt-2 flex items-center gap-1 font-medium">
                      <Star className="w-3 h-3 fill-current" /> GPS Location Captured
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-theme-primary font-medium mb-1.5">Your Name (optional)</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2.5 bg-background border border-theme-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-theme-primary placeholder:text-theme-secondary"
                />
              </div>
              <div>
                <label className="block text-sm text-theme-primary font-medium mb-1.5">Phone {orderType === 'delivery' && <span className="text-red-500">*</span>}</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter your phone"
                  className="w-full px-4 py-2.5 bg-background border border-theme-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-theme-primary placeholder:text-theme-secondary"
                />
              </div>
              <div>
                <label className="block text-sm text-theme-primary font-medium mb-1.5 flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" /> Special Instructions
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g., less spicy, no onions, extra gravy..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-background border border-theme-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-theme-primary placeholder:text-theme-secondary resize-none"
                />
              </div>
            </div>

            <div className="bg-surface rounded-xl p-4 space-y-3 mb-6 border border-theme-border">
              <div className="flex justify-between text-sm text-theme-secondary font-medium">
                <span>Items ({cartCount})</span>
                <span>{formatCurrency(cartTotal, restaurant?.currency)}</span>
              </div>

              <div className="flex justify-between text-lg font-serif text-theme-primary font-bold pt-3 border-t border-theme-border">
                <span>Total</span>
                <span>{formatCurrency(grandTotal, restaurant?.currency)}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-theme-primary font-medium mb-2">Payment Method</label>
              <div className="flex bg-surface rounded-lg p-1 mt-2 border border-theme-border">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    paymentMethod === 'cash' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  Pay with Cash
                </button>
                <button
                  onClick={() => setPaymentMethod('online')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    paymentMethod === 'online' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  Pay Online
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setCheckoutOpen(false)} className="btn-outline flex-1">
                Back
              </button>
              {!restaurant?.is_active ? (
                <div className="flex-[2] text-center p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 font-medium">
                  Sorry, we are currently closed
                </div>
              ) : (
                <button
                  onClick={placeOrder}
                  disabled={placing || cart.length === 0 || (paymentMethod === 'online' && !restaurant?.payment_qr_url)}
                  className="btn-primary flex-[2]"
                >
                  {placing ? 'Placing Order...' : paymentMethod === 'online' ? 'Proceed' : 'Place Order'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
