/*
# Seed Default Restaurant, Categories, and Dining Tables

## Overview
Inserts the default "The Infinito Cafe & Restaurants" record, all menu categories
(including sub-categories for Main Course), and 15 dining tables with unique QR tokens.

## Data Inserted
1. `restaurants` — One default restaurant record with branding and contact info.
2. `categories` — 14 top-level categories + 4 sub-categories under "Main Course".
3. `tables` — 15 dining tables (table_number 1–15) with unique QR tokens and capacity 4.

## Notes
- Uses ON CONFLICT DO NOTHING to be idempotent.
- QR tokens are generated as simple unique strings; the frontend builds QR URLs from them.
*/

-- Default restaurant
INSERT INTO restaurants (id, name, tagline, description, address, phone, email, currency, tax_percentage, service_charge_percentage, opening_time, closing_time, settings)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'The Infinito Cafe & Restaurants',
  'Premium Family Dining Experience',
  'A luxury family restaurant serving authentic Indian cuisine, exotic beverages, and gourmet desserts in an elegant atmosphere.',
  '123 Heritage Street, Food District, Mumbai, Maharashtra 400001',
  '+91 98765 43210',
  'contact@nirvana.com',
  '₹',
  5.00,
  0.00,
  '09:00',
  '23:59',
  '{"theme": "dark", "primary_color": "#C9A227", "enable_dine_in": true, "enable_takeaway": false}'
)
ON CONFLICT (id) DO NOTHING;

-- Categories with sub-categories for Main Course
INSERT INTO categories (restaurant_id, name, slug, sort_order, icon) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Starter', 'starter', 1, 'flame'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Main Course', 'main-course', 2, 'utensils'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Soup', 'soup', 3, 'soup'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Salad', 'salad', 4, 'leaf'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Coffee', 'coffee', 5, 'coffee'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Shakes', 'shakes', 6, 'glass-water'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Exotic Shakes', 'exotic-shakes', 7, 'glass-water'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mojitos', 'mojitos', 8, 'citrus'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Coolers', 'coolers', 9, 'snowflake'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ice Crushers', 'ice-crushers', 10, 'ice-cream-cone'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Desserts', 'desserts', 11, 'cake-slice'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Beverages', 'beverages', 12, 'cup-soda')
ON CONFLICT (restaurant_id, slug) DO NOTHING;

-- Sub-categories under Main Course
INSERT INTO categories (restaurant_id, name, slug, parent_id, sort_order, icon)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Indian Veg', 'indian-veg', id, 1, 'leaf'
FROM categories WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND slug = 'main-course'
ON CONFLICT (restaurant_id, slug) DO NOTHING;

INSERT INTO categories (restaurant_id, name, slug, parent_id, sort_order, icon)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Indian Non Veg', 'indian-non-veg', id, 2, 'beef'
FROM categories WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND slug = 'main-course'
ON CONFLICT (restaurant_id, slug) DO NOTHING;

INSERT INTO categories (restaurant_id, name, slug, parent_id, sort_order, icon)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Biryani', 'biryani', id, 3, 'rice'
FROM categories WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND slug = 'main-course'
ON CONFLICT (restaurant_id, slug) DO NOTHING;

INSERT INTO categories (restaurant_id, name, slug, parent_id, sort_order, icon)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Kofta', 'kofta', id, 4, 'meat'
FROM categories WHERE restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND slug = 'main-course'
ON CONFLICT (restaurant_id, slug) DO NOTHING;

-- Dining tables (1-15) with unique QR tokens
INSERT INTO tables (restaurant_id, table_number, name, capacity, qr_token, status)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  n,
  'Table ' || n,
  CASE WHEN n <= 5 THEN 2 WHEN n <= 10 THEN 4 ELSE 6 END,
  'nirvana-tbl-' || lpad(n::text, 3, '0') || '-' || substring(gen_random_uuid()::text, 1, 8),
  'available'
FROM generate_series(1, 15) AS n
ON CONFLICT (restaurant_id, table_number) DO NOTHING;
