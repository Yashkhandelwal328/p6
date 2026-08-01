export type OrderType = 'dine_in' | 'delivery' | 'takeaway';
export type OrderStatus = 'new' | 'accepted' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'online';
export type StaffRole = 'super_admin' | 'owner' | 'manager' | 'cashier' | 'chef' | 'waiter';
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';
export type Portion = 'half' | 'full';
export type RequestType = 'call_waiter' | 'water' | 'bill' | 'custom';
export type RequestStatus = 'pending' | 'acknowledged' | 'completed' | 'cancelled';
export type NotificationType =
  | 'new_order'
  | 'order_accepted'
  | 'order_preparing'
  | 'order_ready'
  | 'order_served'
  | 'order_completed'
  | 'order_cancelled'
  | 'table_request'
  | 'payment_received'
  | 'low_stock';

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  description: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  currency: string;
  tax_percentage: number;
  service_charge_percentage: number;
  opening_time: string;
  closing_time: string;
  is_active: boolean;
  restaurant_code: string | null;
  theme_color: string | null;
  settings: Record<string, unknown>;
  min_delivery_amount: number;
  max_delivery_radius_km: number;
  restaurant_latitude: number | null;
  restaurant_longitude: number | null;
  payment_qr_url: string | null;
  is_open: boolean;
  
  // SaaS Branding & Domain
  subdomain: string | null;
  custom_domain: string | null;
  banner_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  button_style: 'rounded' | 'pill' | 'square';
  border_radius: string;
  font_family: string;
  website_status: 'draft' | 'published' | 'maintenance' | 'suspended';
  
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  restaurant_id: string;
  plan: 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'past_due' | 'cancelled' | 'trial';
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: number;
  name: string | null;
  capacity: number;
  qr_token: string | null;
  status: TableStatus;
  current_order_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_veg: boolean;
  has_half_price: boolean;
  half_price: number | null;
  full_price: number;
  preparation_time_minutes: number;
  is_available: boolean;
  is_bestseller: boolean;
  is_chef_special: boolean;
  sort_order: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id: string | null;
  table_number: number | null;
  order_type: OrderType;
  delivery_address: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  subtotal: number;
  tax_amount: number;
  service_charge: number;
  total_amount: number;
  special_instructions: string | null;
  items_count: number;
  accepted_at: string | null;
  preparing_at: string | null;
  ready_at: string | null;
  served_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  restaurant_id: string;
  menu_item_id: string | null;
  menu_item_name: string;
  menu_item_image: string | null;
  is_veg: boolean;
  portion: Portion;
  unit_price: number;
  quantity: number;
  total_price: number;
  special_instructions: string | null;
  status: string;
  created_at: string;
}

export interface Payment {
  id: string;
  restaurant_id: string;
  order_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  restaurant_id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  user_id: string | null;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  restaurant_id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  role: StaffRole;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  restaurant_id: string;
  staff_id: string | null;
  order_id: string | null;
  type: NotificationType;
  title: string;
  message: string | null;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface TableRequest {
  id: string;
  restaurant_id: string;
  table_id: string;
  table_number: number;
  request_type: RequestType;
  status: RequestStatus;
  note: string | null;
  handled_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  menu_item: MenuItem;
  portion: Portion;
  quantity: number;
  unit_price: number;
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'new',
  'accepted',
  'preparing',
  'ready',
  'served',
  'completed',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'New',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  accepted: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  preparing: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  ready: 'bg-green-500/15 text-green-400 border-green-500/30',
  served: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  completed: 'bg-emerald-600/15 text-emerald-400 border-emerald-600/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export interface PremiumLead {
  id: string;
  restaurant_id: string | null;
  owner_name: string;
  business_name: string;
  phone_number: string;
  email: string | null;
  preferred_call_time: string | null;
  notes: string | null;
  status: 'new' | 'contacted' | 'meeting_scheduled' | 'converted' | 'rejected';
  created_at: string;
  updated_at: string;
}
