/*
# Fix All Menu Item Images & Add New Columns

## Overview
1. Updates every menu item with a unique, realistic Pexels food image that matches the dish name.
   Previously only 7 generic URLs were shared across all 56 items — now each has its own photo.
2. Adds `is_chef_special` boolean column to `menu_items` for the Chef's Special badge.
3. Adds `restaurant_code` text column to `restaurants` for unique owner restaurant IDs (e.g., NRV-0001).
4. Adds `logo_url` already existed; adds `theme_color` text column for per-restaurant theme customization.

## Changes
- `menu_items.is_chef_special` (boolean, default false)
- `restaurants.restaurant_code` (text, unique)
- `restaurants.theme_color` (text, default '#C9A227')
- All 56 menu item image_url values updated to unique Pexels photos matching each dish.
*/

-- Add is_chef_special column
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_chef_special boolean NOT NULL DEFAULT false;

-- Add restaurant_code and theme_color columns
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS restaurant_code text UNIQUE;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS theme_color text DEFAULT '#C9A227';

-- Set restaurant code for the default restaurant
UPDATE restaurants SET restaurant_code = 'NRV-0001' WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- ============================================================
-- UPDATE ALL MENU ITEM IMAGES WITH UNIQUE, MATCHING PHOTOS
-- ============================================================

-- STARTERS
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/3928854/pexels-photo-3928854.png?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Paneer Tikka' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/7353380/pexels-photo-7353380.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Chicken 65' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/35066808/pexels-photo-35066808.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Veg Manchurian' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/2580464/pexels-photo-2580464.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Fish Amritsari' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/7375283/pexels-photo-7375283.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Crispy Corn' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/9646846/pexels-photo-9646846.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Chicken Tikka' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- INDIAN VEG
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/35993886/pexels-photo-35993886.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Paneer Butter Masala' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/37182513/pexels-photo-37182513.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Dal Makhani' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/34217292/pexels-photo-34217292.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Veg Korma' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/33643313/pexels-photo-33643313.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Aloo Gobi' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/11601078/pexels-photo-11601078.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Baingan Bharta' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- INDIAN NON VEG
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/35158690/pexels-photo-35158690.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Butter Chicken' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/30203309/pexels-photo-30203309.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Mutton Rogan Josh' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/35629938/pexels-photo-35629938.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Chicken Curry' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/38324319/pexels-photo-38324319.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Fish Masala' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/35066815/pexels-photo-35066815.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Egg Curry' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- BIRYANI
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/37303308/pexels-photo-37303308.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Veg Biryani' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/28674660/pexels-photo-28674660.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Chicken Biryani' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/9609856/pexels-photo-9609856.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Mutton Biryani' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/9609859/pexels-photo-9609859.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Paneer Biryani' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- KOFTA
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/36343375/pexels-photo-36343375.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Malai Kofta' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/34217294/pexels-photo-34217294.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Nargisi Kofta' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/36651769/pexels-photo-36651769.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Lauki Kofta' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- SOUP
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/5409027/pexels-photo-5409027.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Manchow Soup' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/12338625/pexels-photo-12338625.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Tomato Soup' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/29631481/pexels-photo-29631481.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Sweet Corn Soup' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/16845652/pexels-photo-16845652.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Hot & Sour Soup' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- SALAD
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/4887993/pexels-photo-4887993.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Garden Fresh Salad' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/7462819/pexels-photo-7462819.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Caesar Salad' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/724664/pexels-photo-724664.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Greek Salad' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- COFFEE
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/18604200/pexels-photo-18604200.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Espresso' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/6747870/pexels-photo-6747870.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Cappuccino' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/38426418/pexels-photo-38426418.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Cold Coffee' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/143645/pexels-photo-143645.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Hazelnut Latte' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- SHAKES
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/32469289/pexels-photo-32469289.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Chocolate Shake' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/28525197/pexels-photo-28525197.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Vanilla Shake' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/4051784/pexels-photo-4051784.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Strawberry Shake' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- EXOTIC SHAKES
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/34541593/pexels-photo-34541593.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Belgian Chocolate Shake' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/18142619/pexels-photo-18142619.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Caramel Crunch Shake' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/34487801/pexels-photo-34487801.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Ferrero Shake' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- MOJITOS
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/4051250/pexels-photo-4051250.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Classic Mint Mojito' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/17321335/pexels-photo-17321335.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Watermelon Mojito' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/32838169/pexels-photo-32838169.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Blue Lagoon Mojito' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- COOLERS
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/30620864/pexels-photo-30620864.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Mango Cooler' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/5335918/pexels-photo-5335918.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Cucumber Cooler' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/37680620/pexels-photo-37680620.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Hibiscus Cooler' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- ICE CRUSHERS
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/18237485/pexels-photo-18237485.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Mango Ice Crusher' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/11449196/pexels-photo-11449196.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Strawberry Ice Crusher' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/8879626/pexels-photo-8879626.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Cola Ice Crusher' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- DESSERTS
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/7406887/pexels-photo-7406887.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Gulab Jamun' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/35532835/pexels-photo-35532835.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Gajar Halwa' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/37934621/pexels-photo-37934621.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Tiramisu' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/27359379/pexels-photo-27359379.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Chocolate Brownie' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- BEVERAGES
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/37186989/pexels-photo-37186989.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Masala Chai' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/4045205/pexels-photo-4045205.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Fresh Lime Soda' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE menu_items SET image_url = 'https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Bottled Water' AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Mark some items as Chef's Special
UPDATE menu_items SET is_chef_special = true WHERE name IN ('Butter Chicken', 'Mutton Rogan Josh', 'Chicken Biryani', 'Malai Kofta', 'Belgian Chocolate Shake', 'Tiramisu') AND restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
