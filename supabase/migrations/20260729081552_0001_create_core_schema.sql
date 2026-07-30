/*
# The Infinito Cafe & Restaurants SaaS — Core Schema

## Overview
Creates the complete production database schema for "The Infinito Cafe & Restaurants",
a multi-tenant restaurant SaaS. The schema supports restaurants, tables (with QR codes),
menu categories, menu items, orders with realtime status flow, order items, payments,
customers, staff, notifications, and table service requests (waiter/water/bill).

## Tables Created
1. `restaurants` — Root tenant entity; each restaurant has settings, branding, contact info.
2. `tables` — Restaurant dining tables; each has a number, QR token, and occupancy status.
3. `categories` — Menu categories (Starter, Main Course, Soup, etc.) with optional parent for sub-categories.
4. `menu_items` — Individual menu items with image, description, veg/non-veg badge, half/full price, prep time, availability, bestseller flag.
5. `orders` — Customer orders with full status flow (new → accepted → preparing → ready → served → completed / cancelled), payment status, special instructions.
6. `order_items` — Line items per order (menu item snapshot, quantity, unit price, half/full).
7. `payments` — Payment records linked to orders (method, status, amount).
8. `customers` — Guest customer profiles (name, phone, optionally linked to auth).
9. `staff` — Staff members with roles (owner, admin, chef, waiter) linked to auth.users.
10. `notifications` — Realtime notification feed for staff (new order, status change, table request).
11. `table_requests` — Service requests from tables (call_waiter, water, bill) with status.

## Relationships
- All tenant-scoped tables reference `restaurants(id)` via FK.
- `tables` → `restaurants`
- `categories` → `restaurants`, self-ref for sub-categories
- `menu_items` → `restaurants`, `categories`
- `orders` → `restaurants`, `tables`, `customers`
- `order_items` → `orders`, `menu_items`
- `payments` → `orders`
- `staff` → `restaurants`, `auth.users`
- `notifications` → `restaurants`, `staff` (optional), `orders` (optional)
- `table_requests` → `restaurants`, `tables`

## Security (RLS)
- Customer-facing tables (restaurants, tables, categories, menu_items, orders, order_items, payments, customers, table_requests): `TO anon, authenticated` — the customer ordering site uses the anon key with no login.
- Staff-only tables (staff, notifications): `TO authenticated` — only logged-in staff can read/write.
- All tables have 4 separate CRUD policies (select/insert/update/delete).
*/

-- ============================================================
-- 0. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. RESTAURANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'The Infinito Cafe & Restaurants',
  tagline text DEFAULT 'Premium Family Dining',
  description text,
  logo_url text,
  address text,
  phone text,
  email text,
  currency text NOT NULL DEFAULT '₹',
  tax_percentage numeric(5,2) NOT NULL DEFAULT 0,
  service_charge_percentage numeric(5,2) NOT NULL DEFAULT 0,
  opening_time time DEFAULT '09:00',
  closing_time time DEFAULT '23:00',
  is_active boolean NOT NULL DEFAULT true,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_restaurants" ON restaurants;
CREATE POLICY "anon_select_restaurants" ON restaurants FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_restaurants" ON restaurants;
CREATE POLICY "auth_insert_restaurants" ON restaurants FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_restaurants" ON restaurants;
CREATE POLICY "auth_update_restaurants" ON restaurants FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_restaurants" ON restaurants;
CREATE POLICY "auth_delete_restaurants" ON restaurants FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 2. TABLES (dining tables with QR tokens)
-- ============================================================
CREATE TABLE IF NOT EXISTS tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number integer NOT NULL,
  name text,
  capacity integer NOT NULL DEFAULT 4,
  qr_token text UNIQUE,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','occupied','reserved','cleaning')),
  current_order_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, table_number)
);

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tables" ON tables;
CREATE POLICY "anon_select_tables" ON tables FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tables" ON tables;
CREATE POLICY "anon_insert_tables" ON tables FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tables" ON tables;
CREATE POLICY "anon_update_tables" ON tables FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tables" ON tables;
CREATE POLICY "anon_delete_tables" ON tables FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 3. CATEGORIES (menu categories with sub-category support)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  icon text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, slug)
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 4. MENU ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name text NOT NULL,
  description text,
  image_url text,
  is_veg boolean NOT NULL DEFAULT true,
  has_half_price boolean NOT NULL DEFAULT false,
  half_price numeric(10,2),
  full_price numeric(10,2) NOT NULL,
  preparation_time_minutes integer NOT NULL DEFAULT 15,
  is_available boolean NOT NULL DEFAULT true,
  is_bestseller boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  rating numeric(3,1) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_menu_items" ON menu_items;
CREATE POLICY "anon_select_menu_items" ON menu_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_menu_items" ON menu_items;
CREATE POLICY "anon_insert_menu_items" ON menu_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_menu_items" ON menu_items;
CREATE POLICY "anon_update_menu_items" ON menu_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_menu_items" ON menu_items;
CREATE POLICY "anon_delete_menu_items" ON menu_items FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 5. CUSTOMERS (guest profiles)
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text,
  phone text,
  email text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  total_orders integer NOT NULL DEFAULT 0,
  total_spent numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_customers" ON customers;
CREATE POLICY "anon_select_customers" ON customers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_customers" ON customers;
CREATE POLICY "anon_insert_customers" ON customers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_customers" ON customers;
CREATE POLICY "anon_update_customers" ON customers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_customers" ON customers;
CREATE POLICY "anon_delete_customers" ON customers FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 6. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id uuid NOT NULL REFERENCES tables(id) ON DELETE RESTRICT,
  table_number integer NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text,
  customer_phone text,
  order_number text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','accepted','preparing','ready','served','completed','cancelled')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  payment_method text CHECK (payment_method IN ('cash','card','upi','online')),
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  service_charge numeric(12,2) NOT NULL DEFAULT 0,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  special_instructions text,
  items_count integer NOT NULL DEFAULT 0,
  accepted_at timestamptz,
  preparing_at timestamptz,
  ready_at timestamptz,
  served_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 7. ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  menu_item_name text NOT NULL,
  menu_item_image text,
  is_veg boolean NOT NULL DEFAULT true,
  portion text NOT NULL DEFAULT 'full' CHECK (portion IN ('half','full')),
  unit_price numeric(10,2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  total_price numeric(12,2) NOT NULL,
  special_instructions text,
  status text DEFAULT 'new' CHECK (status IN ('new','preparing','ready','served','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_order_items" ON order_items;
CREATE POLICY "anon_select_order_items" ON order_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_order_items" ON order_items;
CREATE POLICY "anon_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_order_items" ON order_items;
CREATE POLICY "anon_update_order_items" ON order_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_order_items" ON order_items;
CREATE POLICY "anon_delete_order_items" ON order_items FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 8. PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  method text NOT NULL CHECK (method IN ('cash','card','upi','online')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  transaction_id text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_payments" ON payments;
CREATE POLICY "anon_select_payments" ON payments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_payments" ON payments;
CREATE POLICY "anon_insert_payments" ON payments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_payments" ON payments;
CREATE POLICY "anon_update_payments" ON payments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_payments" ON payments;
CREATE POLICY "anon_delete_payments" ON payments FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 9. STAFF (authenticated staff with roles)
-- ============================================================
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'waiter' CHECK (role IN ('owner','admin','chef','waiter')),
  is_active boolean NOT NULL DEFAULT true,
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, email)
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_staff" ON staff;
CREATE POLICY "auth_select_staff" ON staff FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_staff" ON staff;
CREATE POLICY "auth_insert_staff" ON staff FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_staff" ON staff;
CREATE POLICY "auth_update_staff" ON staff FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_staff" ON staff;
CREATE POLICY "auth_delete_staff" ON staff FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 10. NOTIFICATIONS (realtime feed for staff)
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES staff(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('new_order','order_accepted','order_preparing','order_ready','order_served','order_completed','order_cancelled','table_request','payment_received','low_stock')),
  title text NOT NULL,
  message text,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_notifications" ON notifications;
CREATE POLICY "auth_select_notifications" ON notifications FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_notifications" ON notifications;
CREATE POLICY "auth_insert_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_notifications" ON notifications;
CREATE POLICY "auth_update_notifications" ON notifications FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_notifications" ON notifications;
CREATE POLICY "auth_delete_notifications" ON notifications FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 11. TABLE REQUESTS (call waiter, water, bill)
-- ============================================================
CREATE TABLE IF NOT EXISTS table_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id uuid NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  table_number integer NOT NULL,
  request_type text NOT NULL CHECK (request_type IN ('call_waiter','water','bill','custom')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','acknowledged','completed','cancelled')),
  note text,
  handled_by uuid REFERENCES staff(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE table_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_table_requests" ON table_requests;
CREATE POLICY "anon_select_table_requests" ON table_requests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_table_requests" ON table_requests;
CREATE POLICY "anon_insert_table_requests" ON table_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_table_requests" ON table_requests;
CREATE POLICY "anon_update_table_requests" ON table_requests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_table_requests" ON table_requests;
CREATE POLICY "anon_delete_table_requests" ON table_requests FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_customers_restaurant ON customers(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_restaurant ON staff(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_user ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_restaurant ON notifications(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_table_requests_restaurant ON table_requests(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_table_requests_status ON table_requests(status);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
  CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_table_requests_updated_at BEFORE UPDATE ON table_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- ORDER NUMBER GENERATOR FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  seq_val bigint;
BEGIN
  seq_val := nextval('order_number_seq');
  RETURN 'NV' || to_char(now(), 'YYMMDD') || lpad(seq_val::text, 4, '0');
END;
$$ language 'plpgsql';

DO $$ BEGIN
  CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
