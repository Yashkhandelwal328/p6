/*
# Seed Sample Menu Items

## Overview
Inserts a rich set of sample menu items across all categories for the The infinoto Cafe & Restaurant restaurant.
Each item includes name, description, image URL (from Pexels food photography),
veg/non-veg badge, half/full pricing, preparation time, availability, and bestseller flags.

## Items by Category
- Starter: 6 items (Paneer Tikka, Chicken 65, Veg Manchurian, Fish Amritsari, Crispy Corn, Chicken Tikka)
- Indian Veg: 5 items (Paneer Butter Masala, Dal Makhani, Veg Korma, Aloo Gobi, Baingan Bharta)
- Indian Non Veg: 5 items (Butter Chicken, Mutton Rogan Josh, Chicken Curry, Fish Masala, Egg Curry)
- Biryani: 4 items (Veg Biryani, Chicken Biryani, Mutton Biryani, Paneer Biryani)
- Kofta: 3 items (Malai Kofta, Nargisi Kofta, Lauki Kofta)
- Soup: 4 items (Manchow Soup, Tomato Soup, Sweet Corn Soup, Hot & Sour Soup)
- Salad: 3 items (Garden Salad, Caesar Salad, Greek Salad)
- Coffee: 4 items (Espresso, Cappuccino, Cold Coffee, Hazelnut Latte)
- Shakes: 3 items (Chocolate Shake, Vanilla Shake, Strawberry Shake)
- Exotic Shakes: 3 items (Belgian Chocolate Shake, Caramel Crunch Shake, Ferrero Shake)
- Mojitos: 3 items (Classic Mint Mojito, Watermelon Mojito, Blue Lagoon Mojito)
- Coolers: 3 items (Mango Cooler, Cucumber Cooler, Hibiscus Cooler)
- Ice Crushers: 3 items (Mango Ice Crusher, Strawberry Ice Crusher, Cola Ice Crusher)
- Desserts: 4 items (Gulab Jamun, Gajar Halwa, Tiramisu, Chocolate Brownie)
- Beverages: 3 items (Masala Chai, Fresh Lime Soda, Bottled Water)

## Notes
- Uses subqueries to resolve category IDs by slug.
- All items reference the default restaurant.
- ON CONFLICT would need a unique constraint; we use WHERE NOT EXISTS for idempotency.
*/

-- Helper: insert items only if they don't already exist (check by name + restaurant)
-- We use a temporary function approach via individual INSERT ... SELECT with WHERE NOT EXISTS

-- ============ STARTER ============
INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Paneer Tikka', 'Cubes of cottage cheese marinated in spiced yogurt and grilled in a tandoor for a smoky char.', 'https://images.pexels.com/photos/6748484/pexels-photo-6748484.jpeg', true, true, 180.00, 320.00, 20, true, true, 1, 4.8
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'starter'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Paneer Tikka');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Chicken 65', 'Deep-fried spicy chicken with curry leaves, green chilies, and a fiery red coating.', 'https://images.pexels.com/photos/7214071/pexels-photo-7214071.jpeg', false, true, 220.00, 380.00, 25, true, true, 2, 4.7
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'starter'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Chicken 65');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Veg Manchurian', 'Crispy vegetable dumplings tossed in a tangy Indo-Chinese soy-garlic sauce.', 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg', true, false, NULL, 260.00, 18, true, false, 3, 4.5
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'starter'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Veg Manchurian');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Fish Amritsari', 'Batter-fried fish seasoned with Punjabi spices, served with mint chutney and onion rings.', 'https://images.pexels.com/photos/6995444/pexels-photo-6995444.jpeg', false, false, NULL, 340.00, 22, true, false, 4, 4.6
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'starter'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Fish Amritsari');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Crispy Corn', 'Golden fried sweet corn kernels tossed with bell peppers and mild spices.', 'https://images.pexels.com/photos/5786660/pexels-photo-5786660.jpeg', true, false, NULL, 190.00, 15, true, false, 5, 4.4
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'starter'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Crispy Corn');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Chicken Tikka', 'Juicy chicken pieces marinated in yogurt and spices, grilled to perfection in the tandoor.', 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg', false, true, 240.00, 420.00, 25, true, true, 6, 4.9
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'starter'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Chicken Tikka');

-- ============ INDIAN VEG ============
INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Paneer Butter Masala', 'Cottage cheese cubes simmered in a rich, creamy tomato-butter gravy with cashew paste.', 'https://images.pexels.com/photos/6748484/pexels-photo-6748484.jpeg', true, true, 220.00, 380.00, 25, true, true, 1, 4.8
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'indian-veg'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Paneer Butter Masala');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Dal Makhani', 'Black lentils slow-cooked overnight with butter, cream, and tomatoes for a velvety texture.', 'https://images.pexels.com/photos/15491596/pexels-photo-15491596.jpeg', true, false, NULL, 280.00, 30, true, true, 2, 4.7
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'indian-veg'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Dal Makhani');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Veg Korma', 'Mixed vegetables in a luxurious Mughlai gravy of cashews, cream, and aromatic spices.', 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg', true, true, 200.00, 340.00, 25, true, false, 3, 4.5
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'indian-veg'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Veg Korma');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Aloo Gobi', 'A classic dry curry of potatoes and cauliflower with cumin, turmeric, and ginger.', 'https://images.pexels.com/photos/5786660/pexels-photo-5786660.jpeg', true, false, NULL, 240.00, 20, true, false, 4, 4.4
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'indian-veg'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Aloo Gobi');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Baingan Bharta', 'Roasted eggplant mashed and sautéed with onions, tomatoes, and smoky spices.', 'https://images.pexels.com/photos/6748484/pexels-photo-6748484.jpeg', true, false, NULL, 260.00, 25, true, false, 5, 4.5
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'indian-veg'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Baingan Bharta');

-- ============ INDIAN NON VEG ============
INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Butter Chicken', 'Tandoori chicken simmered in a silky tomato-butter gravy with cream and fenugreek leaves.', 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg', false, true, 280.00, 480.00, 30, true, true, 1, 4.9
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'indian-non-veg'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Butter Chicken');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Mutton Rogan Josh', 'Tender mutton braised in a Kashmiri red chili gravy with whole spices and yogurt.', 'https://images.pexels.com/photos/7214071/pexels-photo-7214071.jpeg', false, true, 340.00, 560.00, 35, true, true, 2, 4.8
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'indian-non-veg'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Mutton Rogan Josh');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Chicken Curry', 'Chicken pieces cooked in a homestyle onion-tomato masala with aromatic spices.', 'https://images.pexels.com/photos/6995444/pexels-photo-6995444.jpeg', false, true, 260.00, 440.00, 30, true, false, 3, 4.6
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'indian-non-veg'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Chicken Curry');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Fish Masala', 'Fish fillets pan-seared and folded into a spicy coconut-onion masala.', 'https://images.pexels.com/photos/6995444/pexels-photo-6995444.jpeg', false, false, NULL, 460.00, 28, true, false, 4, 4.5
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'indian-non-veg'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Fish Masala');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Egg Curry', 'Boiled eggs halved and simmered in a spiced onion-tomato gravy.', 'https://images.pexels.com/photos/5786660/pexels-photo-5786660.jpeg', false, false, NULL, 220.00, 20, true, false, 5, 4.3
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'indian-non-veg'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Egg Curry');

-- ============ BIRYANI ============
INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Veg Biryani', 'Fragrant basmati rice layered with spiced vegetables and saffron, served with raita.', 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg', true, false, NULL, 280.00, 30, true, false, 1, 4.5
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'biryani'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Veg Biryani');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Chicken Biryani', 'Long-grain basmati with marinated chicken, fried onions, and saffron — dum cooked.', 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg', false, false, NULL, 380.00, 35, true, true, 2, 4.9
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'biryani'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Chicken Biryani');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Mutton Biryani', 'Slow-cooked mutton and basmati rice with whole spices, mint, and caramelized onions.', 'https://images.pexels.com/photos/7214071/pexels-photo-7214071.jpeg', false, false, NULL, 480.00, 40, true, true, 3, 4.8
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'biryani'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Mutton Biryani');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Paneer Biryani', 'Basmati rice cooked with marinated paneer, saffron, and biryani spices.', 'https://images.pexels.com/photos/6748484/pexels-photo-6748484.jpeg', true, false, NULL, 320.00, 30, true, false, 4, 4.6
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'biryani'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Paneer Biryani');

-- ============ KOFTA ============
INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Malai Kofta', 'Soft paneer-potato dumplings in a creamy cashew-saffron gravy.', 'https://images.pexels.com/photos/6748484/pexels-photo-6748484.jpeg', true, true, 220.00, 360.00, 28, true, true, 1, 4.7
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'kofta'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Malai Kofta');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Nargisi Kofta', 'Minced mutton dumplings with a boiled-egg center in a rich Mughlai gravy.', 'https://images.pexels.com/photos/7214071/pexels-photo-7214071.jpeg', false, false, NULL, 420.00, 35, true, false, 2, 4.6
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'kofta'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Nargisi Kofta');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Lauki Kofta', 'Bottle gourd dumplings in a tangy tomato-onion gravy.', 'https://images.pexels.com/photos/5786660/pexels-photo-5786660.jpeg', true, false, NULL, 240.00, 25, true, false, 3, 4.3
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'kofta'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Lauki Kofta');

-- ============ SOUP ============
INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Manchow Soup', 'Spicy Indo-Chinese soup with vegetables and fried noodles on top.', 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg', true, false, NULL, 160.00, 12, true, true, 1, 4.5
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'soup'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Manchow Soup');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Tomato Soup', 'Creamy roasted tomato soup with a hint of basil and croutons.', 'https://images.pexels.com/photos/5786660/pexels-photo-5786660.jpeg', true, false, NULL, 140.00, 10, true, false, 2, 4.3
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'soup'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Tomato Soup');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Sweet Corn Soup', 'Velvety cream of sweet corn with crunchy vegetables.', 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg', true, false, NULL, 150.00, 12, true, false, 3, 4.4
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'soup'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Sweet Corn Soup');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Hot & Sour Soup', 'Tangy and spicy soup with tofu, mushrooms, and bamboo shoots.', 'https://images.pexels.com/photos/5786660/pexels-photo-5786660.jpeg', true, false, NULL, 160.00, 12, true, false, 4, 4.4
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'soup'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Hot & Sour Soup');

-- ============ SALAD ============
INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Garden Fresh Salad', 'Crisp lettuce, cucumber, tomatoes, and carrots with a light vinaigrette.', 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg', true, false, NULL, 180.00, 8, true, false, 1, 4.3
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'salad'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Garden Fresh Salad');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Caesar Salad', 'Romaine lettuce, croutons, and parmesan in a classic Caesar dressing.', 'https://images.pexels.com/photos/5786660/pexels-photo-5786660.jpeg', true, false, NULL, 220.00, 10, true, true, 2, 4.6
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'salad'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Caesar Salad');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Greek Salad', 'Tomatoes, cucumbers, olives, and feta with oregano and olive oil.', 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg', true, false, NULL, 240.00, 10, true, false, 3, 4.5
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'salad'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Greek Salad');

-- ============ COFFEE ============
INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Espresso', 'A concentrated shot of rich, full-bodied coffee.', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', true, false, NULL, 120.00, 5, true, false, 1, 4.4
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'coffee'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Espresso');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Cappuccino', 'Espresso topped with steamed milk and a thick layer of foamed milk.', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', true, false, NULL, 160.00, 7, true, true, 2, 4.7
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'coffee'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Cappuccino');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Cold Coffee', 'Chilled coffee blended with milk, ice cream, and chocolate sauce.', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', true, false, NULL, 180.00, 7, true, true, 3, 4.8
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'coffee'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Cold Coffee');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Hazelnut Latte', 'Smooth espresso with steamed milk and rich hazelnut syrup.', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', true, false, NULL, 200.00, 7, true, false, 4, 4.6
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'coffee'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Hazelnut Latte');

-- ============ SHAKES ============
INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Chocolate Shake', 'Thick chocolate milkshake topped with whipped cream and chocolate shavings.', 'https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg', true, false, NULL, 180.00, 8, true, true, 1, 4.7
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'shakes'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Chocolate Shake');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Vanilla Shake', 'Classic vanilla bean milkshake, creamy and smooth.', 'https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg', true, false, NULL, 160.00, 8, true, false, 2, 4.5
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'shakes'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Vanilla Shake');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Strawberry Shake', 'Fresh strawberry milkshake with real fruit and a dollop of cream.', 'https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg', true, false, NULL, 180.00, 8, true, false, 3, 4.6
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'shakes'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Strawberry Shake');

-- ============ EXOTIC SHAKES ============
INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Belgian Chocolate Shake', 'Decadent shake with imported Belgian chocolate, ice cream, and brownie chunks.', 'https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg', true, false, NULL, 280.00, 10, true, true, 1, 4.9
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'exotic-shakes'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Belgian Chocolate Shake');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Caramel Crunch Shake', 'Buttery caramel shake with crunchy toffee bits and salted caramel drizzle.', 'https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg', true, false, NULL, 260.00, 10, true, false, 2, 4.7
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'exotic-shakes'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Caramel Crunch Shake');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Ferrero Shake', 'Blended Ferrero Rocher with hazelnut, cocoa, and milk, topped with crushed nuts.', 'https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg', true, false, NULL, 300.00, 10, true, true, 3, 4.8
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'exotic-shakes'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Ferrero Shake');

-- ============ MOJITOS ============
INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Classic Mint Mojito', 'Fresh mint, lime, and soda over crushed ice — refreshing and zesty.', 'https://images.pexels.com/photos/3221101/pexels-photo-3221101.jpeg', true, false, NULL, 160.00, 6, true, true, 1, 4.7
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'mojitos'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Classic Mint Mojito');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Watermelon Mojito', 'Fresh watermelon chunks muddled with mint, lime, and soda.', 'https://images.pexels.com/photos/3221101/pexels-photo-3221101.jpeg', true, false, NULL, 180.00, 6, true, false, 2, 4.6
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'mojitos'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Watermelon Mojito');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Blue Lagoon Mojito', 'Blue curaçao syrup with mint, lime, and soda for a vibrant tropical cooler.', 'https://images.pexels.com/photos/3221101/pexels-photo-3221101.jpeg', true, false, NULL, 190.00, 6, true, false, 3, 4.5
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'mojitos'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Blue Lagoon Mojito');

-- ============ COOLERS ============
INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Mango Cooler', 'Fresh mango pulp blended with soda and mint for a tropical refresher.', 'https://images.pexels.com/photos/3221101/pexels-photo-3221101.jpeg', true, false, NULL, 150.00, 6, true, true, 1, 4.6
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'coolers'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Mango Cooler');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Cucumber Cooler', 'Chilled cucumber, lime, and soda with a hint of mint.', 'https://images.pexels.com/photos/3221101/pexels-photo-3221101.jpeg', true, false, NULL, 140.00, 6, true, false, 2, 4.4
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'coolers'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Cucumber Cooler');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Hibiscus Cooler', 'Iced hibiscus tea with rose syrup, lime, and soda.', 'https://images.pexels.com/photos/3221101/pexels-photo-3221101.jpeg', true, false, NULL, 160.00, 6, true, false, 3, 4.5
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'coolers'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Hibiscus Cooler');

-- ============ ICE CRUSHERS ============
INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Mango Ice Crusher', 'Crushed ice blended with mango pulp and a splash of condensed milk.', 'https://images.pexels.com/photos/3221101/pexels-photo-3221101.jpeg', true, false, NULL, 130.00, 5, true, false, 1, 4.5
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'ice-crushers'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Mango Ice Crusher');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Strawberry Ice Crusher', 'Crushed ice with fresh strawberry syrup and a whipped cream topping.', 'https://images.pexels.com/photos/3221101/pexels-photo-3221101.jpeg', true, false, NULL, 130.00, 5, true, false, 2, 4.4
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'ice-crushers'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Strawberry Ice Crusher');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Cola Ice Crusher', 'Crushed ice with cola syrup and a squeeze of lime.', 'https://images.pexels.com/photos/3221101/pexels-photo-3221101.jpeg', true, false, NULL, 120.00, 5, true, false, 3, 4.3
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'ice-crushers'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Cola Ice Crusher');

-- ============ DESSERTS ============
INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Gulab Jamun', 'Warm milk-solid dumplings soaked in cardamom-rose syrup.', 'https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg', true, false, NULL, 140.00, 5, true, true, 1, 4.8
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'desserts'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Gulab Jamun');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Gajar Halwa', 'Slow-cooked grated carrots with ghee, milk, and nuts.', 'https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg', true, false, NULL, 160.00, 8, true, false, 2, 4.6
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'desserts'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Gajar Halwa');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Tiramisu', 'Layers of mascarpone, espresso-soaked ladyfingers, and cocoa.', 'https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg', true, false, NULL, 220.00, 5, true, true, 3, 4.9
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'desserts'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Tiramisu');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Chocolate Brownie', 'Warm fudgy brownie served with vanilla ice cream and chocolate sauce.', 'https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg', true, false, NULL, 200.00, 6, true, true, 4, 4.8
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'desserts'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Chocolate Brownie');

-- ============ BEVERAGES ============
INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Masala Chai', 'Traditional Indian spiced tea with cardamom, ginger, and clove.', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', true, false, NULL, 60.00, 5, true, true, 1, 4.6
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'beverages'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Masala Chai');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Fresh Lime Soda', 'Refreshing lime and soda — sweet, salted, or mixed.', 'https://images.pexels.com/photos/3221101/pexels-photo-3221101.jpeg', true, false, NULL, 80.00, 4, true, false, 2, 4.4
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'beverages'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Fresh Lime Soda');

INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, is_veg, has_half_price, half_price, full_price, preparation_time_minutes, is_available, is_bestseller, sort_order, rating)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', c.id, 'Bottled Water', 'Chilled 1L mineral water.', 'https://images.pexels.com/photos/3221101/pexels-photo-3221101.jpeg', true, false, NULL, 40.00, 1, true, false, 3, 4.0
FROM categories c WHERE c.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND c.slug = 'beverages'
AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND mi.name = 'Bottled Water');
