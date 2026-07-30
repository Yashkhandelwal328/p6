import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = 'https://frvsunqsnrtefixsxrrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnN1bnFzbnJ0ZWZpeHN4cnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDk4NTYsImV4cCI6MjEwMDg4NTg1Nn0.IJOwwRO5UHcDm16yMuDR2poyChuIqJhFSFtoGb_38Fg';
const RESTAURANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: ws },
});

// Sign in as owner to bypass RLS
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: 'owner@nirvana.com',
  password: 'Nirvana@123',
});
if (authError) {
  console.error('❌ Failed to authenticate:', authError.message);
  process.exit(1);
}
console.log('✅ Authenticated as owner:', authData.user.email);

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// All categories from the PDF
const categoriesData = [
  { name: 'Mocktails / Beverages', slug: 'mocktails-beverages', sort_order: 1 },
  { name: 'Veg Soup', slug: 'veg-soup', sort_order: 2 },
  { name: 'Non-Veg Soup', slug: 'non-veg-soup', sort_order: 3 },
  { name: 'Kabab', slug: 'kabab', sort_order: 4 },
  { name: 'Starter', slug: 'starter', sort_order: 5 },
  { name: 'South Indian', slug: 'south-indian', sort_order: 6 },
  { name: 'Uttapam', slug: 'uttapam', sort_order: 7 },
  { name: 'Snacks', slug: 'snacks', sort_order: 8 },
  { name: 'Chinese', slug: 'chinese', sort_order: 9 },
  { name: 'Indian Veg', slug: 'indian-veg', sort_order: 10 },
  { name: 'Indian Non-Veg', slug: 'indian-non-veg', sort_order: 11 },
  { name: 'Mutton', slug: 'mutton', sort_order: 12 },
  { name: 'Egg', slug: 'egg', sort_order: 13 },
  { name: 'Daal', slug: 'daal', sort_order: 14 },
  { name: 'Tandoori Roti', slug: 'tandoori-roti', sort_order: 15 },
  { name: 'Biryani', slug: 'biryani', sort_order: 16 },
  { name: 'Raita', slug: 'raita', sort_order: 17 },
  { name: 'Papad', slug: 'papad', sort_order: 18 },
  { name: 'Salad', slug: 'salad', sort_order: 19 },
  { name: 'Rice', slug: 'rice', sort_order: 20 },
  { name: 'Desserts', slug: 'desserts', sort_order: 21 },
  { name: 'Kofta', slug: 'kofta', sort_order: 22 },
];

// All menu items from PDF, grouped by category slug
// Format: { name, full_price, half_price (null if none), is_veg, prep_time, category_slug }
const menuItemsData = [
  // ===== MOCKTAILS / BEVERAGES =====
  { name: 'Blue Lagoon', full_price: 110, is_veg: true, category_slug: 'mocktails-beverages', prep_time: 8 },
  { name: 'Mint Mojito', full_price: 100, is_veg: true, category_slug: 'mocktails-beverages', prep_time: 8 },
  { name: 'Kiwi Mint Mojito', full_price: 110, is_veg: true, category_slug: 'mocktails-beverages', prep_time: 8 },
  { name: 'Watermelon', full_price: 120, is_veg: true, category_slug: 'mocktails-beverages', prep_time: 5 },
  { name: 'Mineral Water', full_price: 20, is_veg: true, category_slug: 'mocktails-beverages', prep_time: 1 },
  { name: 'Lassi', full_price: 70, is_veg: true, category_slug: 'mocktails-beverages', prep_time: 5 },
  { name: 'Cold Drink', full_price: 25, is_veg: true, category_slug: 'mocktails-beverages', prep_time: 1 },
  { name: 'Hot Coffee', full_price: 30, is_veg: true, category_slug: 'mocktails-beverages', prep_time: 5 },
  { name: 'Cold Coffee', full_price: 100, is_veg: true, category_slug: 'mocktails-beverages', prep_time: 5 },
  { name: 'Tea', full_price: 25, is_veg: true, category_slug: 'mocktails-beverages', prep_time: 5 },
  { name: 'Masala Cold Drink', full_price: 70, is_veg: true, category_slug: 'mocktails-beverages', prep_time: 5 },
  { name: 'Dahi', full_price: 60, is_veg: true, category_slug: 'mocktails-beverages', prep_time: 2 },

  // ===== VEG SOUP =====
  { name: 'Veg Soup', full_price: 100, is_veg: true, category_slug: 'veg-soup', prep_time: 10 },
  { name: 'Veg Hot & Sour Soup', full_price: 110, is_veg: true, category_slug: 'veg-soup', prep_time: 10 },
  { name: 'Veg Manchow Soup', full_price: 110, is_veg: true, category_slug: 'veg-soup', prep_time: 10 },
  { name: 'Tomato Soup', full_price: 120, is_veg: true, category_slug: 'veg-soup', prep_time: 10 },
  { name: 'Veg Sweet Corn Soup', full_price: 130, is_veg: true, category_slug: 'veg-soup', prep_time: 10 },

  // ===== NON-VEG SOUP =====
  { name: 'Chicken Soup', full_price: 110, is_veg: false, category_slug: 'non-veg-soup', prep_time: 12 },
  { name: 'Chicken Hot & Sour Soup', full_price: 110, is_veg: false, category_slug: 'non-veg-soup', prep_time: 12 },
  { name: 'Chicken Manchow Soup', full_price: 120, is_veg: false, category_slug: 'non-veg-soup', prep_time: 12 },
  { name: 'Chicken Clear Soup', full_price: 130, is_veg: false, category_slug: 'non-veg-soup', prep_time: 12 },
  { name: 'Chicken Sweet Corn Soup', full_price: 120, is_veg: false, category_slug: 'non-veg-soup', prep_time: 12 },

  // ===== KABAB =====
  { name: 'Chicken Seekh Kabab', full_price: 250, is_veg: false, category_slug: 'kabab', prep_time: 20 },
  { name: 'Chicken Tandoori Kabab', full_price: 250, is_veg: false, category_slug: 'kabab', prep_time: 20 },
  { name: 'Leg Kabab', full_price: 220, is_veg: false, category_slug: 'kabab', prep_time: 20 },
  { name: 'Chicken Tikka', full_price: 260, is_veg: false, category_slug: 'kabab', prep_time: 20 },
  { name: 'Chicken Lahsuni Kabab', full_price: 280, is_veg: false, category_slug: 'kabab', prep_time: 20 },
  { name: 'Chicken Malai Tikka', full_price: 340, is_veg: false, category_slug: 'kabab', prep_time: 20 },
  { name: 'Chicken Kali Mirch', full_price: 280, is_veg: false, category_slug: 'kabab', prep_time: 20 },
  { name: 'Chicken Afgani Kabab', full_price: 280, is_veg: false, category_slug: 'kabab', prep_time: 20 },
  { name: 'Chicken Hashmi Kabab', full_price: 260, is_veg: false, category_slug: 'kabab', prep_time: 20 },
  { name: 'Paneer Tikka', full_price: 240, is_veg: true, category_slug: 'kabab', prep_time: 18 },
  { name: 'Paneer Malai Tikka', full_price: 240, is_veg: true, category_slug: 'kabab', prep_time: 18 },
  { name: 'Hara Bhara Kabab', full_price: 200, is_veg: true, category_slug: 'kabab', prep_time: 15 },

  // ===== STARTER =====
  { name: 'Chicken Lollipop (6 Pieces)', full_price: 290, is_veg: false, category_slug: 'starter', prep_time: 18 },
  { name: 'Chicken Ginger', full_price: 240, is_veg: false, category_slug: 'starter', prep_time: 15 },
  { name: 'Paneer Ginger', full_price: 200, is_veg: true, category_slug: 'starter', prep_time: 15 },
  { name: 'Paneer Garlic', full_price: 200, is_veg: true, category_slug: 'starter', prep_time: 15 },
  { name: 'Chicken Garlic', full_price: 240, is_veg: false, category_slug: 'starter', prep_time: 15 },
  { name: 'Chicken 65', full_price: 260, is_veg: false, category_slug: 'starter', prep_time: 15 },
  { name: 'Chicken Chilli Boneless', full_price: 220, is_veg: false, category_slug: 'starter', prep_time: 15 },
  { name: 'Chicken Chilli Bone', full_price: 200, is_veg: false, category_slug: 'starter', prep_time: 15 },

  // ===== SOUTH INDIAN =====
  { name: 'Masala Dosa', full_price: 100, is_veg: true, category_slug: 'south-indian', prep_time: 12 },
  { name: 'Paneer Dosa', full_price: 120, is_veg: true, category_slug: 'south-indian', prep_time: 12 },
  { name: 'Paper Dosa', full_price: 80, is_veg: true, category_slug: 'south-indian', prep_time: 10 },
  { name: 'Paneer Masala Dosa', full_price: 110, is_veg: true, category_slug: 'south-indian', prep_time: 12 },
  { name: 'Mushroom Dosa', full_price: 140, is_veg: true, category_slug: 'south-indian', prep_time: 12 },
  { name: 'Paneer Butter Masala Dosa', full_price: 110, is_veg: true, category_slug: 'south-indian', prep_time: 15 },
  { name: 'Rava Plain Dosa', full_price: 100, is_veg: true, category_slug: 'south-indian', prep_time: 10 },
  { name: 'Rava Masala Dosa', full_price: 120, is_veg: true, category_slug: 'south-indian', prep_time: 12 },
  { name: 'Rava Paneer Masala Dosa', full_price: 140, is_veg: true, category_slug: 'south-indian', prep_time: 12 },

  // ===== UTTAPAM =====
  { name: 'Uttapam', full_price: 70, is_veg: true, category_slug: 'uttapam', prep_time: 10 },
  { name: 'Masala Uttapam', full_price: 80, is_veg: true, category_slug: 'uttapam', prep_time: 10 },
  { name: 'Onion Uttapam', full_price: 80, is_veg: true, category_slug: 'uttapam', prep_time: 10 },
  { name: 'Veg Uttapam', full_price: 80, is_veg: true, category_slug: 'uttapam', prep_time: 10 },
  { name: 'Tomato Uttapam', full_price: 80, is_veg: true, category_slug: 'uttapam', prep_time: 10 },
  { name: 'Paneer Uttapam', full_price: 90, is_veg: true, category_slug: 'uttapam', prep_time: 12 },
  { name: 'Sambhar Uttapam', full_price: 70, is_veg: true, category_slug: 'uttapam', prep_time: 10 },

  // ===== SNACKS =====
  { name: 'Veg Pakoda', full_price: 130, is_veg: true, category_slug: 'snacks', prep_time: 10 },
  { name: 'Paneer Pakoda', full_price: 150, is_veg: true, category_slug: 'snacks', prep_time: 10 },
  { name: 'Chicken Pakoda', full_price: 170, is_veg: false, category_slug: 'snacks', prep_time: 10 },
  { name: 'Finger Chips', full_price: 140, is_veg: true, category_slug: 'snacks', prep_time: 10 },
  { name: 'Baby Corn Crispy', full_price: 220, is_veg: true, category_slug: 'snacks', prep_time: 12 },

  // ===== CHINESE =====
  { name: 'Veg Chowmein', full_price: 100, is_veg: true, category_slug: 'chinese', prep_time: 12 },
  { name: 'Veg Hakka Noodle', full_price: 100, is_veg: true, category_slug: 'chinese', prep_time: 12 },
  { name: 'Paneer Chowmein', full_price: 120, is_veg: true, category_slug: 'chinese', prep_time: 12 },
  { name: 'Mushroom Chowmein', full_price: 150, is_veg: true, category_slug: 'chinese', prep_time: 12 },
  { name: 'Chicken Chowmein', full_price: 180, is_veg: false, category_slug: 'chinese', prep_time: 15 },
  { name: 'Egg Chowmein', full_price: 130, is_veg: false, category_slug: 'chinese', prep_time: 12 },
  { name: 'Mix Chowmein', full_price: 160, is_veg: false, category_slug: 'chinese', prep_time: 15 },
  { name: 'Schezwan Chowmein', full_price: 130, is_veg: true, category_slug: 'chinese', prep_time: 12 },
  { name: 'Veg Fried Rice', full_price: 140, is_veg: true, category_slug: 'chinese', prep_time: 12 },
  { name: 'Paneer Fried Rice', full_price: 130, is_veg: true, category_slug: 'chinese', prep_time: 12 },
  { name: 'Chicken Fried Rice', full_price: 180, is_veg: false, category_slug: 'chinese', prep_time: 15 },
  { name: 'Egg Fried Rice', full_price: 160, is_veg: false, category_slug: 'chinese', prep_time: 12 },
  { name: 'Mix Fried Rice', full_price: 160, is_veg: false, category_slug: 'chinese', prep_time: 15 },
  { name: 'Mushroom Fried Rice', full_price: 150, is_veg: true, category_slug: 'chinese', prep_time: 12 },
  { name: 'Paneer Chilli', full_price: 200, is_veg: true, category_slug: 'chinese', prep_time: 15 },
  { name: 'Mushroom Chilli', full_price: 220, is_veg: true, category_slug: 'chinese', prep_time: 15 },
  { name: 'Potato Chilli', full_price: 140, is_veg: true, category_slug: 'chinese', prep_time: 12 },
  { name: 'Baby Corn Chilli', full_price: 200, is_veg: true, category_slug: 'chinese', prep_time: 15 },
  { name: 'Chicken Chilli', full_price: 220, is_veg: false, category_slug: 'chinese', prep_time: 15 },
  { name: 'Paneer Manchurian', full_price: 200, is_veg: true, category_slug: 'chinese', prep_time: 15 },
  { name: 'Chicken Manchurian', full_price: 220, is_veg: false, category_slug: 'chinese', prep_time: 15 },

  // ===== INDIAN VEG =====
  { name: 'Infinito Special Paneer', full_price: 300, is_veg: true, category_slug: 'indian-veg', prep_time: 20 },
  { name: 'Paneer Lajawab', full_price: 280, is_veg: true, category_slug: 'indian-veg', prep_time: 18 },
  { name: 'Paneer Do Pyaza', full_price: 210, half_price: 130, is_veg: true, category_slug: 'indian-veg', prep_time: 18 },
  { name: 'Paneer Butter Masala', full_price: 220, half_price: 130, is_veg: true, category_slug: 'indian-veg', prep_time: 18 },
  { name: 'Paneer Kadhai', full_price: 220, is_veg: true, category_slug: 'indian-veg', prep_time: 18 },
  { name: 'Paneer Handi', full_price: 230, half_price: 140, is_veg: true, category_slug: 'indian-veg', prep_time: 18 },
  { name: 'Paneer Lapeta', full_price: 320, is_veg: true, category_slug: 'indian-veg', prep_time: 20 },
  { name: 'Paneer Kasha', full_price: 290, is_veg: true, category_slug: 'indian-veg', prep_time: 20 },
  { name: 'Paneer Kalaji', full_price: 320, is_veg: true, category_slug: 'indian-veg', prep_time: 20 },
  { name: 'Shahi Paneer', full_price: 290, is_veg: true, category_slug: 'indian-veg', prep_time: 18 },
  { name: 'Kaju Paneer', full_price: 280, is_veg: true, category_slug: 'indian-veg', prep_time: 18 },
  { name: 'Paneer Masala', full_price: 190, is_veg: true, category_slug: 'indian-veg', prep_time: 15 },
  { name: 'Palak Paneer', full_price: 220, is_veg: true, category_slug: 'indian-veg', prep_time: 18 },
  { name: 'Matar Paneer', full_price: 190, is_veg: true, category_slug: 'indian-veg', prep_time: 18 },
  { name: 'Paneer Punjabi', full_price: 290, is_veg: true, category_slug: 'indian-veg', prep_time: 20 },
  { name: 'Shahi Paneer Brown', full_price: 280, is_veg: true, category_slug: 'indian-veg', prep_time: 18 },
  { name: 'Paneer Mushroom Masala', full_price: 270, is_veg: true, category_slug: 'indian-veg', prep_time: 18 },
  { name: 'Paneer Mushroom Butter Masala', full_price: 220, is_veg: true, category_slug: 'indian-veg', prep_time: 18 },
  { name: 'Paneer Kolhapuri', full_price: 230, is_veg: true, category_slug: 'indian-veg', prep_time: 18 },
  { name: 'Paneer Lababdar', full_price: 230, is_veg: true, category_slug: 'indian-veg', prep_time: 18 },
  { name: 'Mushroom Do Pyaza', full_price: 220, is_veg: true, category_slug: 'indian-veg', prep_time: 15 },
  { name: 'Mushroom Butter Masala', full_price: 220, is_veg: true, category_slug: 'indian-veg', prep_time: 15 },
  { name: 'Mushroom Masala', full_price: 220, is_veg: true, category_slug: 'indian-veg', prep_time: 15 },
  { name: 'Mushroom Handi', full_price: 230, is_veg: true, category_slug: 'indian-veg', prep_time: 18 },
  { name: 'Mushroom Kadhai', full_price: 230, is_veg: true, category_slug: 'indian-veg', prep_time: 18 },
  { name: 'Mushroom Sufiya', full_price: 280, is_veg: true, category_slug: 'indian-veg', prep_time: 20 },
  { name: 'Palak Mushroom', full_price: 210, is_veg: true, category_slug: 'indian-veg', prep_time: 15 },
  { name: 'Mix Veg', full_price: 180, is_veg: true, category_slug: 'indian-veg', prep_time: 15 },
  { name: 'Paneer Bhujiya', full_price: 130, is_veg: true, category_slug: 'indian-veg', prep_time: 12 },
  { name: 'Aloo Bhujiya', full_price: 110, is_veg: true, category_slug: 'indian-veg', prep_time: 10 },
  { name: 'Aloo Jeera', full_price: 110, is_veg: true, category_slug: 'indian-veg', prep_time: 10 },
  { name: 'Aloo Gobi Bhujiya', full_price: 150, is_veg: true, category_slug: 'indian-veg', prep_time: 12 },

  // ===== INDIAN NON-VEG =====
  { name: 'Chicken Do Pyaza', full_price: 260, is_veg: false, category_slug: 'indian-non-veg', prep_time: 20 },
  { name: 'Chicken Masala', full_price: 270, is_veg: false, category_slug: 'indian-non-veg', prep_time: 20 },
  { name: 'Butter Chicken', full_price: 300, is_veg: false, category_slug: 'indian-non-veg', prep_time: 20 },
  { name: 'Chicken Kadhai', full_price: 260, is_veg: false, category_slug: 'indian-non-veg', prep_time: 20 },
  { name: 'Chicken Handi', full_price: 280, is_veg: false, category_slug: 'indian-non-veg', prep_time: 20 },
  { name: 'Chicken Diwani Handi', full_price: 300, is_veg: false, category_slug: 'indian-non-veg', prep_time: 22 },
  { name: 'Chicken Dehati', full_price: 450, half_price: 250, is_veg: false, category_slug: 'indian-non-veg', prep_time: 25 },
  { name: 'Chicken Kadhi', full_price: 260, is_veg: false, category_slug: 'indian-non-veg', prep_time: 20 },
  { name: 'Chicken Stew', full_price: 270, is_veg: false, category_slug: 'indian-non-veg', prep_time: 20 },
  { name: 'Chicken Bhuna', full_price: 280, is_veg: false, category_slug: 'indian-non-veg', prep_time: 20 },
  { name: 'Chicken Kasha', full_price: 260, is_veg: false, category_slug: 'indian-non-veg', prep_time: 20 },
  { name: 'Chicken Lababdar', full_price: 290, is_veg: false, category_slug: 'indian-non-veg', prep_time: 20 },
  { name: 'Chicken Laziz', full_price: 290, is_veg: false, category_slug: 'indian-non-veg', prep_time: 20 },
  { name: 'Chicken Tikka Butter Masala', full_price: 320, is_veg: false, category_slug: 'indian-non-veg', prep_time: 22 },
  { name: 'Chicken Tikka Masala', full_price: 270, is_veg: false, category_slug: 'indian-non-veg', prep_time: 22 },
  { name: 'Chicken Hashmi Butter Masala', full_price: 330, is_veg: false, category_slug: 'indian-non-veg', prep_time: 22 },
  { name: 'Chicken Bharta', full_price: 260, is_veg: false, category_slug: 'indian-non-veg', prep_time: 20 },
  { name: 'Chicken Patiyala', full_price: 290, is_veg: false, category_slug: 'indian-non-veg', prep_time: 22 },
  { name: 'Chicken Punjabi', full_price: 310, is_veg: false, category_slug: 'indian-non-veg', prep_time: 22 },
  { name: 'Chicken Mughlai', full_price: 310, is_veg: false, category_slug: 'indian-non-veg', prep_time: 22 },
  { name: 'Chicken Chatpata', full_price: 270, is_veg: false, category_slug: 'indian-non-veg', prep_time: 18 },
  { name: 'Murgh Musallam', full_price: 590, is_veg: false, category_slug: 'indian-non-veg', prep_time: 30 },

  // ===== MUTTON =====
  { name: 'Mutton Do Pyaza', full_price: 330, is_veg: false, category_slug: 'mutton', prep_time: 25 },
  { name: 'Mutton Kadhi', full_price: 330, is_veg: false, category_slug: 'mutton', prep_time: 25 },
  { name: 'Mutton Kadhahi', full_price: 320, is_veg: false, category_slug: 'mutton', prep_time: 25 },
  { name: 'Mutton Handi', full_price: 340, is_veg: false, category_slug: 'mutton', prep_time: 25 },
  { name: 'Mutton Bhuna (2 Piece)', full_price: 200, is_veg: false, category_slug: 'mutton', prep_time: 25 },
  { name: 'Mutton Rogan Josh', full_price: 320, is_veg: false, category_slug: 'mutton', prep_time: 25 },
  { name: 'Mutton Masala', full_price: 330, is_veg: false, category_slug: 'mutton', prep_time: 25 },
  { name: 'Mutton Dehati', full_price: 330, is_veg: false, category_slug: 'mutton', prep_time: 25 },

  // ===== EGG =====
  { name: 'Anda Kadhi (4 Pic)', full_price: 160, is_veg: false, category_slug: 'egg', prep_time: 12 },
  { name: 'Anda Do Pyaza (4 Pic)', full_price: 170, is_veg: false, category_slug: 'egg', prep_time: 12 },
  { name: 'Anda Masala', full_price: 170, is_veg: false, category_slug: 'egg', prep_time: 12 },
  { name: 'Anda Kadahi (4 Pic)', full_price: 180, is_veg: false, category_slug: 'egg', prep_time: 12 },
  { name: 'Anda Handi (4 Pic)', full_price: 170, is_veg: false, category_slug: 'egg', prep_time: 15 },
  { name: 'Anda Butter Masala (4 Pic)', full_price: 170, is_veg: false, category_slug: 'egg', prep_time: 15 },
  { name: 'Anda Bhurji (4 Pic)', full_price: 100, is_veg: false, category_slug: 'egg', prep_time: 8 },

  // ===== DAAL =====
  { name: 'Dal Fry', full_price: 90, is_veg: true, category_slug: 'daal', prep_time: 12 },
  { name: 'Plain Dal', full_price: 90, is_veg: true, category_slug: 'daal', prep_time: 10 },
  { name: 'Dal Tadka', full_price: 100, is_veg: true, category_slug: 'daal', prep_time: 12 },
  { name: 'Dal Mughlai', full_price: 140, is_veg: true, category_slug: 'daal', prep_time: 15 },
  { name: 'Jeera Dal', full_price: 80, is_veg: true, category_slug: 'daal', prep_time: 10 },
  { name: 'Dal Butter Tadka', full_price: 110, is_veg: true, category_slug: 'daal', prep_time: 12 },

  // ===== TANDOORI ROTI =====
  { name: 'Plain Roti', full_price: 12, is_veg: true, category_slug: 'tandoori-roti', prep_time: 5 },
  { name: 'Butter Roti', full_price: 15, is_veg: true, category_slug: 'tandoori-roti', prep_time: 5 },
  { name: 'Butter Naan', full_price: 40, is_veg: true, category_slug: 'tandoori-roti', prep_time: 8 },
  { name: 'Plain Naan', full_price: 35, is_veg: true, category_slug: 'tandoori-roti', prep_time: 8 },
  { name: 'Stuffed Naan', full_price: 70, is_veg: true, category_slug: 'tandoori-roti', prep_time: 10 },
  { name: 'Paneer Stuffed Naan', full_price: 70, is_veg: true, category_slug: 'tandoori-roti', prep_time: 10 },
  { name: 'Stuffed Kulcha', full_price: 70, is_veg: true, category_slug: 'tandoori-roti', prep_time: 10 },
  { name: 'Kashmiri Naan', full_price: 100, is_veg: true, category_slug: 'tandoori-roti', prep_time: 10 },
  { name: 'Garlic Naan', full_price: 80, is_veg: true, category_slug: 'tandoori-roti', prep_time: 8 },
  { name: 'Missi Roti', full_price: 60, is_veg: true, category_slug: 'tandoori-roti', prep_time: 8 },
  { name: 'Paneer Paratha', full_price: 70, is_veg: true, category_slug: 'tandoori-roti', prep_time: 10 },
  { name: 'Onion Kulcha', full_price: 60, is_veg: true, category_slug: 'tandoori-roti', prep_time: 8 },
  { name: 'Aloo Paratha', full_price: 60, is_veg: true, category_slug: 'tandoori-roti', prep_time: 10 },
  { name: 'Lachha Paratha', full_price: 50, is_veg: true, category_slug: 'tandoori-roti', prep_time: 8 },
  { name: 'Onion Paratha', full_price: 50, is_veg: true, category_slug: 'tandoori-roti', prep_time: 8 },

  // ===== BIRYANI =====
  { name: 'Veg Biryani', full_price: 180, is_veg: true, category_slug: 'biryani', prep_time: 20 },
  { name: 'Paneer Biryani', full_price: 220, is_veg: true, category_slug: 'biryani', prep_time: 20 },
  { name: 'Chicken Biryani', full_price: 230, is_veg: false, category_slug: 'biryani', prep_time: 22 },
  { name: 'Anda Biryani', full_price: 190, is_veg: false, category_slug: 'biryani', prep_time: 20 },
  { name: 'Mushroom Biryani', full_price: 220, is_veg: true, category_slug: 'biryani', prep_time: 20 },
  { name: 'Chicken Hyderabadi Biryani', full_price: 240, is_veg: false, category_slug: 'biryani', prep_time: 25 },
  { name: 'Mutton Biryani', full_price: 260, is_veg: false, category_slug: 'biryani', prep_time: 25 },

  // ===== KOFTA =====
  { name: 'Veg Kofta', full_price: 220, is_veg: true, category_slug: 'kofta', prep_time: 18 },
  { name: 'Paneer Kofta', full_price: 230, is_veg: true, category_slug: 'kofta', prep_time: 18 },
  { name: 'Malai Kofta', full_price: 250, is_veg: true, category_slug: 'kofta', prep_time: 20 },

  // ===== RAITA =====
  { name: 'Veg Raita', full_price: 100, is_veg: true, category_slug: 'raita', prep_time: 5 },
  { name: 'Onion Raita', full_price: 80, is_veg: true, category_slug: 'raita', prep_time: 5 },
  { name: 'Boondi Raita', full_price: 80, is_veg: true, category_slug: 'raita', prep_time: 5 },

  // ===== PAPAD =====
  { name: 'Papad Dry', full_price: 15, is_veg: true, category_slug: 'papad', prep_time: 3 },
  { name: 'Papad Fry', full_price: 15, is_veg: true, category_slug: 'papad', prep_time: 5 },
  { name: 'Papad Masala', full_price: 50, is_veg: true, category_slug: 'papad', prep_time: 5 },

  // ===== SALAD =====
  { name: 'Green Salad', full_price: 50, is_veg: true, category_slug: 'salad', prep_time: 5 },
  { name: 'Onion Salad', full_price: 60, is_veg: true, category_slug: 'salad', prep_time: 5 },
  { name: 'Fruit Salad', full_price: 120, is_veg: true, category_slug: 'salad', prep_time: 8 },

  // ===== RICE =====
  { name: 'Plain Rice', full_price: 90, is_veg: true, category_slug: 'rice', prep_time: 10 },
  { name: 'Jeera Rice', full_price: 100, is_veg: true, category_slug: 'rice', prep_time: 10 },
  { name: 'Lemon Rice', full_price: 110, is_veg: true, category_slug: 'rice', prep_time: 10 },
  { name: 'Veg Pulao', full_price: 150, is_veg: true, category_slug: 'rice', prep_time: 15 },
  { name: 'Matar Pulao', full_price: 150, is_veg: true, category_slug: 'rice', prep_time: 15 },
  { name: 'Navratan Pulao', full_price: 200, is_veg: true, category_slug: 'rice', prep_time: 18 },

  // ===== DESSERTS =====
  { name: 'Pastry', full_price: 60, is_veg: true, category_slug: 'desserts', prep_time: 3 },
  { name: 'Ice Cream', full_price: 50, is_veg: true, category_slug: 'desserts', prep_time: 3 },
];

async function seedMenu() {
  console.log('🔄 Starting menu seed process...\n');

  // Step 1: Delete existing menu items (must go first due to foreign key)
  console.log('🗑️  Deleting existing menu items...');
  const { error: deleteItemsError } = await supabase
    .from('menu_items')
    .delete()
    .eq('restaurant_id', RESTAURANT_ID);
  
  if (deleteItemsError) {
    console.error('❌ Failed to delete menu items:', deleteItemsError.message);
    return;
  }
  console.log('✅ Existing menu items deleted.\n');

  // Step 2: Delete existing categories
  console.log('🗑️  Deleting existing categories...');
  const { error: deleteCatError } = await supabase
    .from('categories')
    .delete()
    .eq('restaurant_id', RESTAURANT_ID);
  
  if (deleteCatError) {
    console.error('❌ Failed to delete categories:', deleteCatError.message);
    return;
  }
  console.log('✅ Existing categories deleted.\n');

  // Step 3: Insert new categories
  console.log('📂 Inserting new categories...');
  const categoryRecords = categoriesData.map((cat) => ({
    id: uuid(),
    restaurant_id: RESTAURANT_ID,
    name: cat.name,
    slug: cat.slug,
    parent_id: null,
    sort_order: cat.sort_order,
    icon: null,
    is_active: true,
  }));

  const { data: insertedCategories, error: insertCatError } = await supabase
    .from('categories')
    .insert(categoryRecords)
    .select();

  if (insertCatError) {
    console.error('❌ Failed to insert categories:', insertCatError.message);
    return;
  }
  console.log(`✅ ${insertedCategories.length} categories inserted.\n`);

  // Build slug -> id map
  const categoryMap = {};
  for (const cat of insertedCategories) {
    categoryMap[cat.slug] = cat.id;
  }

  // Step 4: Insert menu items in batches
  console.log('🍽️  Inserting menu items...');
  let sortOrder = 1;
  const menuRecords = menuItemsData.map((item) => {
    const hasHalf = item.half_price != null;
    return {
      id: uuid(),
      restaurant_id: RESTAURANT_ID,
      category_id: categoryMap[item.category_slug],
      name: item.name,
      description: null,
      image_url: null,
      is_veg: item.is_veg,
      has_half_price: hasHalf,
      half_price: hasHalf ? item.half_price : null,
      full_price: item.full_price,
      preparation_time_minutes: item.prep_time,
      is_available: true,
      is_bestseller: false,
      is_chef_special: false,
      sort_order: sortOrder++,
      rating: 0,
    };
  });

  // Insert in batches of 50 to avoid payload limits
  const batchSize = 50;
  let totalInserted = 0;
  for (let i = 0; i < menuRecords.length; i += batchSize) {
    const batch = menuRecords.slice(i, i + batchSize);
    const { data, error: insertError } = await supabase
      .from('menu_items')
      .insert(batch)
      .select();

    if (insertError) {
      console.error(`❌ Failed to insert batch ${Math.floor(i / batchSize) + 1}:`, insertError.message);
      return;
    }
    totalInserted += data.length;
    console.log(`  ✅ Batch ${Math.floor(i / batchSize) + 1}: ${data.length} items inserted`);
  }

  console.log(`\n🎉 Done! Total: ${insertedCategories.length} categories, ${totalInserted} menu items seeded.`);
}

seedMenu().catch(console.error);
