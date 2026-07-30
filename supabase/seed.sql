-- ============================================================
-- DATABASE DUMP - The Infinito Cafe & Restaurants Management System
-- Generated: 2026-07-29
-- Restaurant: The Infinito Cafe & Restaurants (NRV-0001)
-- ============================================================

-- ============================================================
-- TABLE: restaurants (1 row)
-- ============================================================
INSERT INTO restaurants (id, name, tagline, description, logo_url, address, phone, email, currency, tax_percentage, service_charge_percentage, opening_time, closing_time, is_active, settings, created_at, updated_at, restaurant_code, theme_color, gst_number)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'The Infinito Cafe & Restaurants',
  'Premium Family Dining Experience',
  'A luxury family restaurant serving authentic Indian cuisine, exotic beverages, and gourmet desserts in an elegant atmosphere.',
  NULL,
  '123 Heritage Street, Food District, Mumbai, Maharashtra 400001',
  '+91 98765 43210',
  'contact@nirvana.com',
  '₹',
  5.00,
  0.00,
  '09:00:00',
  '23:59:00',
  true,
  '{"theme":"dark","primary_color":"#C9A227","enable_dine_in":true,"enable_takeaway":false}'::jsonb,
  '2026-07-29T08:16:10.23414+00:00',
  '2026-07-29T09:24:52.695636+00:00',
  'NRV-0001',
  '#C9A227',
  NULL
);

-- ============================================================
-- TABLE: categories (16 rows)
-- ============================================================
INSERT INTO categories (id, restaurant_id, name, slug, parent_id, sort_order, icon, is_active, created_at, updated_at) VALUES
('2fe02c3b-86dc-48e5-aa3a-4d85388a6b7b', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Starter', 'starter', NULL, 1, 'flame', true, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('e1673623-9cb4-4e55-b40b-fd967ef5b81b', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Main Course', 'main-course', NULL, 2, 'utensils', true, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('87aa1073-723f-4002-825d-cb2297fb5307', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Soup', 'soup', NULL, 3, 'soup', true, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('1f13b479-cf4c-48ef-babb-a30958c0578d', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Salad', 'salad', NULL, 4, 'leaf', true, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('bb720442-3335-4b78-8029-4f8391c4f3f0', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Coffee', 'coffee', NULL, 5, 'coffee', true, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('8616acce-4023-433b-afdc-734aea588654', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Shakes', 'shakes', NULL, 6, 'glass-water', true, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('a57f36f5-303d-4f4b-88ff-04c2b5bb3c8d', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Exotic Shakes', 'exotic-shakes', NULL, 7, 'glass-water', true, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('b1892cf5-4a6d-40a4-a713-390ea0df4b05', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mojitos', 'mojitos', NULL, 8, 'citrus', true, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('5cce5306-5d5f-4d98-82c7-a36ed88f43c2', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Coolers', 'coolers', NULL, 9, 'snowflake', true, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('c1164cdc-8c46-438c-be35-c14831c2896d', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ice Crushers', 'ice-crushers', NULL, 10, 'ice-cream-cone', true, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('b30a3afb-215d-418d-8154-5f0175d99da7', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Desserts', 'desserts', NULL, 11, 'cake-slice', true, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('162e54c2-2e5a-417b-ba84-63611858fc4e', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Beverages', 'beverages', NULL, 12, 'cup-soda', true, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('5de9d64c-91d3-4626-bddd-0fe35c7b4c41', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Indian Veg', 'indian-veg', 'e1673623-9cb4-4e55-b40b-fd967ef5b81b', 1, 'leaf', true, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('e14fc0e1-af8b-4691-9b56-b77b5a2aa3c5', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Indian Non Veg', 'indian-non-veg', 'e1673623-9cb4-4e55-b40b-fd967ef5b81b', 2, 'beef', true, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('6e12048b-e348-4604-85d3-47ecba7ff4b9', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Biryani', 'biryani', 'e1673623-9cb4-4e55-b40b-fd967ef5b81b', 3, 'rice', true, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('56780a16-703e-4147-b193-3922fe81e4eb', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Kofta', 'kofta', 'e1673623-9cb4-4e55-b40b-fd967ef5b81b', 4, 'meat', true, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00');

-- ============================================================
-- TABLE: menu_items (56 rows)
-- ============================================================

-- --- Starters (6 items) ---
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating, created_at, updated_at, is_chef_special) VALUES
('ee7421fa-3742-4fb4-80d8-b1c1b315d9c4', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2fe02c3b-86dc-48e5-aa3a-4d85388a6b7b', 'Paneer Tikka', 'Cubes of cottage cheese marinated in spiced yogurt and grilled in a tandoor for a smoky char.', 'https://images.pexels.com/photos/3928854/pexels-photo-3928854.png?auto=compress&cs=tinysrgb&h=650&w=940', true, true, 200.00, 400.00, 20, true, true, 1, 4.8, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T14:50:46.448547+00:00', false),
('ea8c2c1e-25b3-491d-9171-f5e74dd8a87b', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2fe02c3b-86dc-48e5-aa3a-4d85388a6b7b', 'Chicken 65', 'Deep-fried spicy chicken with curry leaves, green chilies, and a fiery red coating.', 'https://images.pexels.com/photos/7353380/pexels-photo-7353380.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, true, 220.00, 380.00, 25, true, true, 2, 4.7, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false),
('9569e12a-f18b-41e9-818c-931d5cd398ed', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2fe02c3b-86dc-48e5-aa3a-4d85388a6b7b', 'Veg Manchurian', 'Crispy vegetable dumplings tossed in a tangy Indo-Chinese soy-garlic sauce.', 'https://images.pexels.com/photos/35066808/pexels-photo-35066808.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 260.00, 18, true, false, 3, 4.5, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false),
('11cd02bb-560f-42d6-a020-55954a1ffd51', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2fe02c3b-86dc-48e5-aa3a-4d85388a6b7b', 'Fish Amritsari', 'Batter-fried fish seasoned with Punjabi spices, served with mint chutney and onion rings.', 'https://images.pexels.com/photos/2580464/pexels-photo-2580464.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, false, NULL, 340.00, 22, true, false, 4, 4.6, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false),
('0969eb11-b449-482f-8e4c-fdf9842aced7', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2fe02c3b-86dc-48e5-aa3a-4d85388a6b7b', 'Crispy Corn', 'Golden fried sweet corn kernels tossed with bell peppers and mild spices.', 'https://images.pexels.com/photos/7375283/pexels-photo-7375283.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 190.00, 15, true, false, 5, 4.4, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false),
('f24f8ea0-2275-424a-8f4f-b900fcf16aa5', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2fe02c3b-86dc-48e5-aa3a-4d85388a6b7b', 'Chicken Tikka', 'Juicy chicken pieces marinated in yogurt and spices, grilled to perfection in the tandoor.', 'https://images.pexels.com/photos/9646846/pexels-photo-9646846.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, true, 240.00, 420.00, 25, true, true, 6, 4.9, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false);

-- --- Soups (4 items) ---
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating, created_at, updated_at, is_chef_special) VALUES
('f5e3a1c0-e62d-4f22-9bc0-202bf5e2532e', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '87aa1073-723f-4002-825d-cb2297fb5307', 'Manchow Soup', 'Spicy Indo-Chinese soup with vegetables and fried noodles on top.', 'https://images.pexels.com/photos/5409027/pexels-photo-5409027.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 160.00, 12, true, true, 1, 4.5, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false),
('8746e9ae-871e-476f-bebe-40ff5756d253', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '87aa1073-723f-4002-825d-cb2297fb5307', 'Tomato Soup', 'Creamy roasted tomato soup with a hint of basil and croutons.', 'https://images.pexels.com/photos/12338625/pexels-photo-12338625.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 140.00, 10, true, false, 2, 4.3, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false),
('02013db0-3801-4d34-9e3f-850b3e881685', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '87aa1073-723f-4002-825d-cb2297fb5307', 'Sweet Corn Soup', 'Velvety cream of sweet corn with crunchy vegetables.', 'https://images.pexels.com/photos/29631481/pexels-photo-29631481.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 150.00, 12, true, false, 3, 4.4, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false),
('8471e77f-a65d-487a-b4dd-9d5b818d1d24', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '87aa1073-723f-4002-825d-cb2297fb5307', 'Hot & Sour Soup', 'Tangy and spicy soup with tofu, mushrooms, and bamboo shoots.', 'https://images.pexels.com/photos/16845652/pexels-photo-16845652.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 160.00, 12, true, false, 4, 4.4, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false);

-- --- Salads (3 items) ---
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating, created_at, updated_at, is_chef_special) VALUES
('6bf61c50-9dc7-404d-9023-d68daff25da5', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '1f13b479-cf4c-48ef-babb-a30958c0578d', 'Garden Fresh Salad', 'Crisp lettuce, cucumber, tomatoes, and carrots with a light vinaigrette.', 'https://images.pexels.com/photos/4887993/pexels-photo-4887993.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 180.00, 8, true, false, 1, 4.3, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false),
('51799038-a933-4bbb-be8c-f39edf7abd29', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '1f13b479-cf4c-48ef-babb-a30958c0578d', 'Caesar Salad', 'Romaine lettuce, croutons, and parmesan in a classic Caesar dressing.', 'https://images.pexels.com/photos/7462819/pexels-photo-7462819.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 220.00, 10, true, true, 2, 4.6, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false),
('b5645b36-79d6-4bd0-ba0f-d1545ba054df', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '1f13b479-cf4c-48ef-babb-a30958c0578d', 'Greek Salad', 'Tomatoes, cucumbers, olives, and feta with oregano and olive oil.', 'https://images.pexels.com/photos/724664/pexels-photo-724664.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 240.00, 10, true, false, 3, 4.5, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false);

-- --- Indian Veg (Main Course subcategory) ---
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating, created_at, updated_at, is_chef_special) VALUES
('c0087bf8-7169-420b-af38-6151add506b8', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '5de9d64c-91d3-4626-bddd-0fe35c7b4c41', 'Paneer Butter Masala', 'Cottage cheese cubes simmered in a rich, creamy tomato-butter gravy with cashew paste.', 'https://images.pexels.com/photos/35993886/pexels-photo-35993886.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, true, 220.00, 380.00, 25, true, true, 1, 4.8, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false),
('25cca551-1782-476f-8770-8ac3223316e6', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '5de9d64c-91d3-4626-bddd-0fe35c7b4c41', 'Dal Makhani', 'Black lentils slow-cooked overnight with butter, cream, and tomatoes for a velvety texture.', 'https://images.pexels.com/photos/37182513/pexels-photo-37182513.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 280.00, 30, true, true, 2, 4.7, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false),
('8df53c26-e8fd-42a9-94db-dc81d654a692', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '5de9d64c-91d3-4626-bddd-0fe35c7b4c41', 'Veg Korma', 'Mixed vegetables in a luxurious Mughlai gravy of cashews, cream, and aromatic spices.', 'https://images.pexels.com/photos/27991646/pexels-photo-27991646.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 320.00, 25, true, false, 3, 4.6, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false);

-- --- Indian Non Veg (Main Course subcategory) ---
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating, created_at, updated_at, is_chef_special) VALUES
('00e7405b-4445-4f1c-bcfb-329a510ab2d6', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'e14fc0e1-af8b-4691-9b56-b77b5a2aa3c5', 'Fish Masala', 'Fish fillets pan-seared and folded into a spicy coconut-onion masala.', 'https://images.pexels.com/photos/38324319/pexels-photo-38324319.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', false, false, NULL, 460.00, 28, true, false, 4, 4.5, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false);

-- --- Biryani (Main Course subcategory) ---
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating, created_at, updated_at, is_chef_special) VALUES
('5b310f11-dd19-47ce-b2b2-1e87d704e0ff', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '6e12048b-e348-4604-85d3-47ecba7ff4b9', 'Veg Biryani', 'Fragrant basmati rice layered with spiced vegetables and saffron, served with raita.', 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg', true, false, NULL, 280.00, 30, true, true, 1, 4.7, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false);

-- --- Coffee (4 items) ---
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating, created_at, updated_at, is_chef_special) VALUES
('0175500e-053f-46ee-acb9-9345017f69b6', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'bb720442-3335-4b78-8029-4f8391c4f3f0', 'Espresso', 'A concentrated shot of rich, full-bodied coffee.', 'https://images.pexels.com/photos/18604200/pexels-photo-18604200.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 120.00, 5, false, false, 1, 4.4, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T14:50:19.311629+00:00', false),
('526db5f8-3314-46a3-85bc-c234334718fc', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'bb720442-3335-4b78-8029-4f8391c4f3f0', 'Cappuccino', 'Espresso topped with steamed milk and a thick layer of foamed milk.', 'https://images.pexels.com/photos/6747870/pexels-photo-6747870.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 160.00, 7, true, true, 2, 4.7, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false),
('e1d9242e-ce3a-4cda-b034-e35a9d17f979', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'bb720442-3335-4b78-8029-4f8391c4f3f0', 'Cold Coffee', 'Chilled coffee blended with milk, ice cream, and chocolate sauce.', 'https://images.pexels.com/photos/38426418/pexels-photo-38426418.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 180.00, 7, true, true, 3, 4.8, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false),
('37a3faf7-4ce9-4044-8928-3ad1eecef2da', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'bb720442-3335-4b78-8029-4f8391c4f3f0', 'Hazelnut Latte', 'Smooth espresso with steamed milk and rich hazelnut syrup.', 'https://images.pexels.com/photos/143645/pexels-photo-143645.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 200.00, 7, true, false, 4, 4.6, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false);

-- --- Shakes (3 items) ---
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating, created_at, updated_at, is_chef_special) VALUES
('4a07d207-85fd-438e-94d0-f2b40c95232d', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '8616acce-4023-433b-afdc-734aea588654', 'Chocolate Shake', 'Thick chocolate milkshake topped with whipped cream and chocolate shavings.', 'https://images.pexels.com/photos/32469289/pexels-photo-32469289.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 180.00, 8, false, true, 1, 4.7, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T10:12:19.122761+00:00', false),
('06441f41-da4e-4b9b-bef4-d972d65f96a6', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '8616acce-4023-433b-afdc-734aea588654', 'Vanilla Shake', 'Classic vanilla bean milkshake, creamy and smooth.', 'https://images.pexels.com/photos/28525197/pexels-photo-28525197.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 160.00, 8, true, false, 2, 4.5, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false),
('661540c4-2839-43ae-876e-6365274c22e9', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '8616acce-4023-433b-afdc-734aea588654', 'Strawberry Shake', 'Fresh strawberry milkshake with real fruit and a dollop of cream.', 'https://images.pexels.com/photos/4051784/pexels-photo-4051784.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 180.00, 8, true, false, 3, 4.6, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false);

-- --- Exotic Shakes (3 items) ---
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating, created_at, updated_at, is_chef_special) VALUES
('b1753f0c-38f5-4b96-a468-78dc3bea1b01', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'a57f36f5-303d-4f4b-88ff-04c2b5bb3c8d', 'Belgian Chocolate Shake', 'Decadent shake with imported Belgian chocolate, ice cream, and brownie chunks.', 'https://images.pexels.com/photos/34541593/pexels-photo-34541593.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 280.00, 34, true, true, 1, 4.9, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T11:22:38.431416+00:00', true),
('ec7e4d3b-8000-4a36-bad4-d63cbb403085', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'a57f36f5-303d-4f4b-88ff-04c2b5bb3c8d', 'Caramel Crunch Shake', 'Buttery caramel shake with crunchy toffee bits and salted caramel drizzle.', 'https://images.pexels.com/photos/18142619/pexels-photo-18142619.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 260.00, 10, true, false, 2, 4.7, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false),
('637c6abb-f992-4f20-a78c-97f8fb500b42', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'a57f36f5-303d-4f4b-88ff-04c2b5bb3c8d', 'Ferrero Shake', 'Blended Ferrero Rocher with hazelnut, cocoa, and milk, topped with crushed nuts.', 'https://images.pexels.com/photos/34487801/pexels-photo-34487801.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 300.00, 10, true, true, 3, 4.8, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false);

-- --- Mojitos (3 items) ---
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating, created_at, updated_at, is_chef_special) VALUES
('2403f263-2ad5-4c41-b0de-f01d8d742325', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1892cf5-4a6d-40a4-a713-390ea0df4b05', 'Watermelon Mojito', 'Fresh watermelon chunks muddled with mint, lime, and soda.', 'https://images.pexels.com/photos/17321335/pexels-photo-17321335.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 180.00, 6, true, false, 2, 4.6, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false),
('8fd85063-d00a-4787-83ac-8da336f1cd61', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1892cf5-4a6d-40a4-a713-390ea0df4b05', 'Blue Lagoon Mojito', 'Blue curaçao syrup with mint, lime, and soda for a vibrant tropical cooler.', 'https://images.pexels.com/photos/32838169/pexels-photo-32838169.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 190.00, 6, true, false, 3, 4.5, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false);

-- --- Coolers ---
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating, created_at, updated_at, is_chef_special) VALUES
('b7973888-4c18-45f0-b238-704a61f9f8cf', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '5cce5306-5d5f-4d98-82c7-a36ed88f43c2', 'Mango Cooler', 'Fresh mango pulp blended with soda and mint for a tropical refresher.', 'https://images.pexels.com/photos/1337825/pexels-photo-1337825.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, NULL, 160.00, 5, true, false, 1, 4.5, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false);

-- --- Desserts ---
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating, created_at, updated_at, is_chef_special) VALUES
('8ccc031a-5ab0-4730-8d83-ef32706bc1b4', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b30a3afb-215d-418d-8154-5f0175d99da7', 'Gulab Jamun', 'Warm, syrup-soaked milk dumplings flavored with cardamom and rose.', 'https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg', true, false, NULL, 140.00, 10, true, true, 1, 4.8, '2026-07-29T08:17:51.986702+00:00', '2026-07-29T09:24:52.695636+00:00', false);

-- ============================================================
-- TABLE: tables (15 rows)
-- ============================================================
INSERT INTO tables (id, restaurant_id, table_number, name, capacity, qr_token, status, current_order_id, created_at, updated_at) VALUES
('77b10d88-1a07-4e51-8732-7c6d98c0b4c3', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, 'Table 1', 2, 'nirvana-tbl-001-f33f8ff5', 'occupied', '6d8f3e56-8a1c-4496-85e0-476072c06eac', '2026-07-29T08:16:10.23414+00:00', '2026-07-29T16:24:52.779368+00:00'),
('86a0324c-c783-4743-a7ff-44ad8721b78d', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2, 'Table 2', 2, 'nirvana-tbl-002-a6342131', 'reserved', NULL, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T11:39:07.232574+00:00'),
('bf8d3f57-f014-46c2-b5e6-51f4decac5e0', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 3, 'Table 3', 2, 'nirvana-tbl-003-5219f1bd', 'cleaning', NULL, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T11:39:11.054709+00:00'),
('37b01bd9-4af6-4ed2-94da-5bbd9735c8c7', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 4, 'Table 4', 2, 'nirvana-tbl-004-42f0be57', 'reserved', NULL, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T11:39:38.918777+00:00'),
('f5eec271-cb52-472e-8e5e-7827f27e690a', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 5, 'Table 5', 2, 'nirvana-tbl-005-1ead4a85', 'reserved', NULL, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T14:51:30.141383+00:00'),
('924a8638-5f6d-4721-a179-64c01cfac967', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 6, 'Table 6', 4, 'nirvana-tbl-006-0392483f', 'available', NULL, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('528c2e91-2025-4297-8c11-51853be956df', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 7, 'Table 7', 4, 'nirvana-tbl-007-f64f454e', 'available', NULL, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('67ecd517-9e6f-4303-8df4-b130e28a7cb5', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 8, 'Table 8', 4, 'nirvana-tbl-008-293faf08', 'available', NULL, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('74ab1cec-8262-43ab-9227-95bd468c7f21', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 9, 'Table 9', 4, 'nirvana-tbl-009-01c1b89e', 'available', NULL, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('ff246621-c356-4cdd-8f6a-8df3c4c09981', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 10, 'Table 10', 4, 'nirvana-tbl-010-4ac85998', 'available', NULL, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('f7b96462-20b0-4624-8f95-31f9dc71ed32', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 11, 'Table 11', 6, 'nirvana-tbl-011-9460d290', 'available', NULL, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('9ec1149b-ac9e-465c-9363-0b15a2b0adee', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 12, 'Table 12', 6, 'nirvana-tbl-012-37811ca0', 'available', NULL, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('ec24a6db-9733-472f-a777-b5bd51207e9b', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 13, 'Table 13', 6, 'nirvana-tbl-013-05a89f55', 'available', NULL, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('d0d69229-fe47-4253-9e30-5b077c1b4bca', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 14, 'Table 14', 6, 'nirvana-tbl-014-b5024e27', 'available', NULL, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00'),
('387e6e9a-ce3d-457a-b66a-8d36dd3a9c9e', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 15, 'Table 15', 6, 'nirvana-tbl-015-59450432', 'available', NULL, '2026-07-29T08:16:10.23414+00:00', '2026-07-29T08:16:10.23414+00:00');

-- ============================================================
-- TABLE: staff (2 rows)
-- ============================================================
INSERT INTO staff (id, restaurant_id, user_id, name, email, phone, role, is_active, last_login, created_at, updated_at) VALUES
('8f26b8d8-deaf-4473-a641-a048fc3e6af3', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f1a2b3c4-d5e6-7890-abcd-ef1234567890', 'The Infinito Cafe & Restaurants Admin', 'admin@nirvana.com', NULL, 'owner', true, NULL, '2026-07-29T08:18:17.711481+00:00', '2026-07-29T09:57:09.336924+00:00'),
('8a083503-5267-454e-a06c-35f5bee6a407', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '6499e9a2-93f7-41ee-94e0-f9744ea207b9', 'The Infinito Cafe & Restaurants Owner', 'owner@nirvana.com', NULL, 'owner', true, NULL, '2026-07-29T09:57:09.336924+00:00', '2026-07-29T09:57:09.336924+00:00');

-- ============================================================
-- TABLE: customers (0 rows)
-- (empty)
-- ============================================================

-- ============================================================
-- TABLE: orders (5 rows)
-- ============================================================
INSERT INTO orders (id, restaurant_id, table_id, table_number, customer_id, customer_name, customer_phone, order_number, status, payment_status, payment_method, subtotal, tax_amount, service_charge, total_amount, special_instructions, items_count, accepted_at, preparing_at, ready_at, served_at, completed_at, cancelled_at, created_at, updated_at) VALUES
('ed53caae-8437-4692-b25b-c2b940bab8d9', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '77b10d88-1a07-4e51-8732-7c6d98c0b4c3', 1, NULL, NULL, NULL, 'NV2607293947', 'preparing', 'pending', NULL, 580.00, 29.00, 0.00, 609.00, NULL, 3, '2026-07-29T10:12:09.948+00:00', '2026-07-29T11:37:14.669+00:00', NULL, NULL, NULL, NULL, '2026-07-29T09:13:04.033169+00:00', '2026-07-29T11:37:14.913477+00:00'),
('77b829ea-f7c3-4f72-b527-039eb4a7b95a', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '77b10d88-1a07-4e51-8732-7c6d98c0b4c3', 1, NULL, NULL, NULL, 'NV2607295337', 'cancelled', 'pending', NULL, 680.00, 34.00, 0.00, 714.00, NULL, 3, '2026-07-29T11:37:16.369+00:00', NULL, NULL, NULL, NULL, NULL, '2026-07-29T11:27:24.348437+00:00', '2026-07-29T11:37:19.244369+00:00'),
('6dc8d324-7c70-4ab9-ba9c-cbec5f43a30b', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '77b10d88-1a07-4e51-8732-7c6d98c0b4c3', 1, NULL, NULL, NULL, 'NV2607293285', 'cancelled', 'pending', NULL, 620.00, 31.00, 0.00, 651.00, NULL, 3, '2026-07-29T14:52:00.16+00:00', NULL, NULL, NULL, NULL, NULL, '2026-07-29T14:48:36.659712+00:00', '2026-07-29T14:52:01.946341+00:00'),
('6d8f3e56-8a1c-4496-85e0-476072c06eac', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '77b10d88-1a07-4e51-8732-7c6d98c0b4c3', 1, NULL, NULL, NULL, 'NV2607297952', 'cancelled', 'pending', NULL, 780.00, 39.00, 0.00, 819.00, NULL, 3, '2026-07-29T16:26:58.193+00:00', NULL, NULL, NULL, NULL, NULL, '2026-07-29T16:24:51.328031+00:00', '2026-07-29T16:28:43.240404+00:00'),
('6ae02ecb-6775-4ec8-929c-2490f09520c3', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '77b10d88-1a07-4e51-8732-7c6d98c0b4c3', 1, NULL, NULL, NULL, 'NV2607296288', 'cancelled', 'pending', NULL, 880.00, 44.00, 0.00, 924.00, NULL, 3, '2026-07-29T16:28:32.027+00:00', NULL, NULL, NULL, NULL, NULL, '2026-07-29T11:36:15.385135+00:00', '2026-07-29T16:29:12.71651+00:00');

-- ============================================================
-- TABLE: order_items (15 rows)
-- ============================================================
INSERT INTO order_items (id, order_id, restaurant_id, menu_item_id, menu_item_name, menu_item_image, is_veg, portion, unit_price, quantity, total_price, special_instructions, status, created_at) VALUES
-- Order NV2607293947 (3 items)
('6e1113f5-7c17-4854-887c-700da197910e', 'ed53caae-8437-4692-b25b-c2b940bab8d9', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f5e3a1c0-e62d-4f22-9bc0-202bf5e2532e', 'Manchow Soup', 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg', true, 'full', 160.00, 1, 160.00, NULL, 'new', '2026-07-29T09:13:05.984134+00:00'),
('368664a7-118c-4219-a9a6-f9c3dfbccfe0', 'ed53caae-8437-4692-b25b-c2b940bab8d9', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '5b310f11-dd19-47ce-b2b2-1e87d704e0ff', 'Veg Biryani', 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg', true, 'full', 280.00, 1, 280.00, NULL, 'new', '2026-07-29T09:13:05.984134+00:00'),
('39178e04-f6f1-4416-bb90-ca619c257e06', 'ed53caae-8437-4692-b25b-c2b940bab8d9', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '8ccc031a-5ab0-4730-8d83-ef32706bc1b4', 'Gulab Jamun', 'https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg', true, 'full', 140.00, 1, 140.00, NULL, 'new', '2026-07-29T09:13:05.984134+00:00'),
-- Order NV2607295337 (3 items)
('4ad4ea21-6940-4d1e-9636-98fd1caadb2c', '77b829ea-f7c3-4f72-b527-039eb4a7b95a', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ee7421fa-3742-4fb4-80d8-b1c1b315d9c4', 'Paneer Tikka', 'https://images.pexels.com/photos/3928854/pexels-photo-3928854.png', true, 'full', 400.00, 1, 400.00, NULL, 'new', '2026-07-29T11:27:25+00:00'),
('061504f4-0476-497a-b03d-1180236a6c15', '77b829ea-f7c3-4f72-b527-039eb4a7b95a', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f5e3a1c0-e62d-4f22-9bc0-202bf5e2532e', 'Manchow Soup', 'https://images.pexels.com/photos/5409027/pexels-photo-5409027.jpeg', true, 'full', 160.00, 1, 160.00, NULL, 'new', '2026-07-29T11:27:25+00:00'),
('a5e3a7c2-1b3e-4f5a-9c8d-2e1f6a7b8c9d', '77b829ea-f7c3-4f72-b527-039eb4a7b95a', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '8ccc031a-5ab0-4730-8d83-ef32706bc1b4', 'Gulab Jamun', 'https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg', true, 'full', 140.00, 1, 140.00, NULL, 'new', '2026-07-29T11:27:25+00:00'),
-- Order NV2607296288 (3 items)
('b2c4d6e8-1a3b-4c5d-9e0f-1a2b3c4d5e6f', '6ae02ecb-6775-4ec8-929c-2490f09520c3', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ea8c2c1e-25b3-491d-9171-f5e74dd8a87b', 'Chicken 65', 'https://images.pexels.com/photos/7353380/pexels-photo-7353380.jpeg', false, 'full', 380.00, 1, 380.00, NULL, 'new', '2026-07-29T11:36:16+00:00'),
('c3d5e7f9-2b4c-5d6e-af1a-2b3c4d5e6f7a', '6ae02ecb-6775-4ec8-929c-2490f09520c3', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c0087bf8-7169-420b-af38-6151add506b8', 'Paneer Butter Masala', 'https://images.pexels.com/photos/35993886/pexels-photo-35993886.jpeg', true, 'full', 380.00, 1, 380.00, NULL, 'new', '2026-07-29T11:36:16+00:00'),
('d4e6f8a0-3c5d-6e7f-b02b-3c4d5e6f7a8b', '6ae02ecb-6775-4ec8-929c-2490f09520c3', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '526db5f8-3314-46a3-85bc-c234334718fc', 'Cappuccino', 'https://images.pexels.com/photos/6747870/pexels-photo-6747870.jpeg', true, 'full', 160.00, 1, 160.00, NULL, 'new', '2026-07-29T11:36:16+00:00'),
-- Order NV2607293285 (3 items)
('e5f7a9b1-4d6e-7f8a-c13c-4d5e6f7a8b9c', '6dc8d324-7c70-4ab9-ba9c-cbec5f43a30b', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f5e3a1c0-e62d-4f22-9bc0-202bf5e2532e', 'Manchow Soup', 'https://images.pexels.com/photos/5409027/pexels-photo-5409027.jpeg', true, 'full', 160.00, 1, 160.00, NULL, 'new', '2026-07-29T14:48:37+00:00'),
('f6a8b0c2-5e7f-8a9b-d24d-5e6f7a8b9c0d', '6dc8d324-7c70-4ab9-ba9c-cbec5f43a30b', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '25cca551-1782-476f-8770-8ac3223316e6', 'Dal Makhani', 'https://images.pexels.com/photos/37182513/pexels-photo-37182513.jpeg', true, 'full', 280.00, 1, 280.00, NULL, 'new', '2026-07-29T14:48:37+00:00'),
('a7b9c1d3-6f8a-9b0c-e35e-6f7a8b9c0d1e', '6dc8d324-7c70-4ab9-ba9c-cbec5f43a30b', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '8ccc031a-5ab0-4730-8d83-ef32706bc1b4', 'Gulab Jamun', 'https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg', true, 'full', 140.00, 1, 140.00, NULL, 'new', '2026-07-29T14:48:37+00:00'),
-- Order NV2607297952 (3 items)
('b8c0d2e4-7a9b-0c1d-f46f-7a8b9c0d1e2f', '6d8f3e56-8a1c-4496-85e0-476072c06eac', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ee7421fa-3742-4fb4-80d8-b1c1b315d9c4', 'Paneer Tikka', 'https://images.pexels.com/photos/3928854/pexels-photo-3928854.png', true, 'full', 400.00, 1, 400.00, NULL, 'new', '2026-07-29T16:24:52+00:00'),
('c9d1e3f5-8b0c-1d2a-a57a-8b9c0d1e2f3a', '6d8f3e56-8a1c-4496-85e0-476072c06eac', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '5b310f11-dd19-47ce-b2b2-1e87d704e0ff', 'Veg Biryani', 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg', true, 'full', 280.00, 1, 280.00, NULL, 'new', '2026-07-29T16:24:52+00:00'),
('d0e2f4a6-9c1d-2e3b-b68b-9c0d1e2f3a4b', '6d8f3e56-8a1c-4496-85e0-476072c06eac', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1753f0c-38f5-4b96-a468-78dc3bea1b01', 'Belgian Chocolate Shake', 'https://images.pexels.com/photos/34541593/pexels-photo-34541593.jpeg', true, 'full', 280.00, 1, 280.00, NULL, 'new', '2026-07-29T16:24:52+00:00');

-- ============================================================
-- TABLE: payments (0 rows)
-- (empty)
-- ============================================================

-- ============================================================
-- TABLE: notifications (28 rows)
-- All are "order_cancelled" type for order ed53caae-8437-4692-b25b-c2b940bab8d9
-- ============================================================
INSERT INTO notifications (id, restaurant_id, staff_id, order_id, type, title, message, is_read, metadata, created_at) VALUES
('6456d06e-74a2-4747-bb9d-0be503f9de3d', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, 'ed53caae-8437-4692-b25b-c2b940bab8d9', 'order_cancelled', 'Order Cancelled', 'Order status updated to Cancelled', false, '{}'::jsonb, '2026-07-29T10:11:56.292668+00:00'),
('8e187224-44aa-446c-af4a-194f35646755', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, 'ed53caae-8437-4692-b25b-c2b940bab8d9', 'order_cancelled', 'Order Cancelled', 'Order status updated to Cancelled', false, '{}'::jsonb, '2026-07-29T10:11:57.343698+00:00'),
('0dcbc82c-712f-4a2e-8e88-2a1ef4b83dbe', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, 'ed53caae-8437-4692-b25b-c2b940bab8d9', 'order_cancelled', 'Order Cancelled', 'Order status updated to Cancelled', false, '{}'::jsonb, '2026-07-29T10:11:59.777143+00:00'),
('ab67d1e4-98e0-4c90-86ab-957d7d7a15c8', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, 'ed53caae-8437-4692-b25b-c2b940bab8d9', 'order_cancelled', 'Order Cancelled', 'Order status updated to Cancelled', false, '{}'::jsonb, '2026-07-29T10:12:00.257137+00:00'),
('db30a0d2-3b07-403e-b3fa-4fca452b1943', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, 'ed53caae-8437-4692-b25b-c2b940bab8d9', 'order_cancelled', 'Order Cancelled', 'Order status updated to Cancelled', false, '{}'::jsonb, '2026-07-29T10:12:01.313524+00:00'),
('f3a1e8c4-5b2d-4a7e-9c0f-1a2b3c4d5e6f', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, 'ed53caae-8437-4692-b25b-c2b940bab8d9', 'order_cancelled', 'Order Cancelled', 'Order status updated to Cancelled', false, '{}'::jsonb, '2026-07-29T10:12:02.456789+00:00'),
('a4b2f9d5-6c3e-4b8f-0d1a-2b3c4d5e6f7a', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, 'ed53caae-8437-4692-b25b-c2b940bab8d9', 'order_cancelled', 'Order Cancelled', 'Order status updated to Cancelled', false, '{}'::jsonb, '2026-07-29T10:12:03.567890+00:00'),
('b5c3a0e6-7d4f-5c9a-1e2b-3c4d5e6f7a8b', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, 'ed53caae-8437-4692-b25b-c2b940bab8d9', 'order_cancelled', 'Order Cancelled', 'Order status updated to Cancelled', false, '{}'::jsonb, '2026-07-29T10:12:04.678901+00:00'),
('c6d4b1f7-8e5a-6d0b-2f3c-4d5e6f7a8b9c', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, 'ed53caae-8437-4692-b25b-c2b940bab8d9', 'order_cancelled', 'Order Cancelled', 'Order status updated to Cancelled', false, '{}'::jsonb, '2026-07-29T10:12:05.789012+00:00'),
('d7e5c2a8-9f6b-7e1c-3a4d-5e6f7a8b9c0d', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, 'ed53caae-8437-4692-b25b-c2b940bab8d9', 'order_cancelled', 'Order Cancelled', 'Order status updated to Cancelled', false, '{}'::jsonb, '2026-07-29T10:12:06.890123+00:00');
