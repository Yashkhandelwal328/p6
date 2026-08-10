import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = 'https://frvsunqsnrtefixsxrrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnN1bnFzbnJ0ZWZpeHN4cnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDk4NTYsImV4cCI6MjEwMDg4NTg1Nn0.IJOwwRO5UHcDm16yMuDR2poyChuIqJhFSFtoGb_38Fg';
const RESTAURANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: ws },
});

// Generate UUID v4
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function generateSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

const markdownTable = `
| Category                  | Item                          | Price (₹) |
| ------------------------- | ----------------------------- | --------: |
| **Mocktails / Beverages** | Blue Lagoon                   |       110 |
|                           | Mint Mojito                   |       100 |
|                           | Kiwi Mint Mojito              |       110 |
|                           | Watermelon                    |       120 |
|                           | Mineral Water                 |        20 |
|                           | Lassi                         |        70 |
|                           | Cold Drink                    |        25 |
|                           | Hot Coffee                    |        30 |
|                           | Cold Coffee                   |       100 |
|                           | Tea                           |        25 |
|                           | Masala Cold Drink             |        70 |
|                           | Dahi                          |        60 |
| **Veg Soup**              | Veg Soup                      |       100 |
|                           | Veg Hot & Sour Soup           |       110 |
|                           | Veg Manchow Soup              |       110 |
|                           | Tomato Soup                   |       120 |
|                           | Veg Sweet Corn Soup           |       110 |
| **Non-Veg Soup**          | Chicken Soup                  |       110 |
|                           | Chicken Hot & Sour Soup       |       110 |
|                           | Chicken Manchow Soup          |       120 |
|                           | Chicken Clear Soup            |       130 |
|                           | Chicken Sweet Corn Soup       |       120 |
| **Kabab**                 | Chicken Seekh Kabab           |       250 |
|                           | Chicken Tandoori Kabab        |       250 |
|                           | Leg Kabab                     |       220 |
|                           | Chicken Tikka                 |       260 |
|                           | Chicken Lahsuni Kabab         |       280 |
|                           | Chicken Malai Tikka           |       340 |
|                           | Chicken Kali Mirch            |       280 |
|                           | Chicken Afgani Kabab          |       280 |
|                           | Chicken Hashmi Kabab          |       260 |
|                           | Paneer Tikka                  |       240 |
|                           | Paneer Malai Tikka            |       240 |
|                           | Hara Bhara Kabab              |       200 |
| **Starter**               | Chicken Lollipop (6 pcs)      |       290 |
|                           | Chicken Ginger                |       240 |
|                           | Paneer Ginger                 |       200 |
|                           | Paneer Garlic                 |       200 |
|                           | Chicken Garlic                |       240 |
|                           | Chicken 65                    |       260 |
|                           | Chicken Chilli Boneless       |       220 |
|                           | Chicken Chilli Bone           |       200 |
| **South Indian**          | Masala Dosa                   |       100 |
|                           | Paneer Dosa                   |       120 |
|                           | Paper Dosa                    |        80 |
|                           | Paneer Masala Dosa            |       110 |
|                           | Mushroom Dosa                 |       140 |
|                           | Paneer Butter Masala Dosa     |       110 |
|                           | Rava Plain Dosa               |       100 |
|                           | Rava Masala Dosa              |       120 |
|                           | Rava Paneer Masala Dosa       |       140 |
| **Uttapam**               | Uttapam                       |        70 |
|                           | Masala Uttapam                |        80 |
|                           | Onion Uttapam                 |        80 |
|                           | Veg Uttapam                   |        80 |
|                           | Tomato Uttapam                |        80 |
|                           | Paneer Uttapam                |        90 |
|                           | Sambhar Uttapam               |        70 |
| **Snacks**                | Veg Pakoda                    |       130 |
|                           | Paneer Pakoda                 |       150 |
|                           | Chicken Pakoda                |       170 |
|                           | Finger Chips                  |       140 |
|                           | Baby Corn Crispy              |       220 |
| **Chinese**               | Veg Chowmein                  |       100 |
|                           | Veg Hakka Noodle              |       100 |
|                           | Paneer Chowmein               |       120 |
|                           | Mushroom Chowmein             |       150 |
|                           | Chicken Chowmein              |       180 |
|                           | Egg Chowmein                  |       130 |
|                           | Mix Chowmein                  |       160 |
|                           | Schezwan Chowmein             |       130 |
|                           | Veg Fried Rice                |       140 |
|                           | Paneer Fried Rice             |       130 |
|                           | Chicken Fried Rice            |       180 |
|                           | Egg Fried Rice                |       160 |
|                           | Mix Fried Rice                |       160 |
|                           | Mushroom Fried Rice           |       150 |
|                           | Paneer Chilli                 |       200 |
|                           | Mushroom Chilli               |       220 |
|                           | Potato Chilli                 |       140 |
|                           | Baby Corn Chilli              |       200 |
|                           | Chicken Chilli                |       220 |
|                           | Paneer Manchurian             |       200 |
|                           | Chicken Manchurian            |       220 |
| **Indian Veg**            | Infinito Special Paneer       |       300 |
|                           | Paneer Lajawab                |       280 |
|                           | Paneer Do Pyaza               | 210 / 130 |
|                           | Paneer Butter Masala          | 220 / 130 |
|                           | Paneer Kadhai                 |       220 |
|                           | Paneer Handi                  | 230 / 140 |
|                           | Paneer Lapeta                 |       320 |
|                           | Paneer Kasha                  |       290 |
|                           | Paneer Kalaji                 |       320 |
|                           | Shahi Paneer                  |       290 |
|                           | Kaju Paneer                   |       280 |
|                           | Paneer Masala                 |       190 |
|                           | Palak Paneer                  |       220 |
|                           | Matar Paneer                  |       190 |
|                           | Paneer Punjabi                |       290 |
|                           | Shahi Paneer Brown            |       280 |
|                           | Paneer Mushroom Masala        |       270 |
|                           | Paneer Mushroom Butter Masala |       220 |
|                           | Paneer Kolhapuri              |       230 |
|                           | Paneer Lababdar               |       230 |
|                           | Mushroom Do Pyaza             |       220 |
|                           | Mushroom Butter Masala        |       220 |
|                           | Mushroom Masala               |       220 |
|                           | Mushroom Handi                |       230 |
|                           | Mushroom Kadhai               |       230 |
|                           | Mushroom Sufiya               |       280 |
|                           | Palak Mushroom                |       210 |
|                           | Mix Veg                       |       180 |
|                           | Paneer Bhujiya                |       130 |
|                           | Aloo Bhujiya                  |       110 |
|                           | Aloo Jeera                    |       110 |
|                           | Aloo Gobi Bhujiya             |       150 |
| **Indian Non-Veg**        | Chicken Do Pyaza              |       260 |
|                           | Chicken Masala                |       270 |
|                           | Butter Chicken                |       300 |
|                           | Chicken Kadhai                |       260 |
|                           | Chicken Handi                 |       280 |
|                           | Chicken Diwani Handi          |       300 |
|                           | Chicken Dehati (F/H)          | 450 / 250 |
|                           | Chicken Kadhi                 |       260 |
|                           | Chicken Stew                  |       270 |
|                           | Chicken Bhuna                 |       280 |
|                           | Chicken Kasha                 |       260 |
|                           | Chicken Lababdar              |       290 |
|                           | Chicken Laziz                 |       290 |
|                           | Chicken Tikka Butter Masala   |       320 |
|                           | Chicken Tikka Masala          |       270 |
|                           | Chicken Hashmi Butter Masala  |       330 |
|                           | Chicken Bharta                |       260 |
|                           | Chicken Patiyala              |       290 |
|                           | Chicken Punjabi               |       310 |
|                           | Chicken Mughlai               |       310 |
|                           | Chicken Chatpata              |       270 |
|                           | Murgh Musallam                |       590 |
| **Mutton**                | Mutton Do Pyaza               |       330 |
|                           | Mutton Kadhi                  |       330 |
|                           | Mutton Kadhahi                |       320 |
|                           | Mutton Handi                  |       340 |
|                           | Mutton Bhuna (2 Piece)        |       200 |
|                           | Mutton Rogan Juice            |       320 |
|                           | Mutton Masala                 |       330 |
|                           | Mutton Dehati                 |       330 |
| **Egg**                   | Anda Kadhi (4 Pic)            |       160 |
|                           | Anda Do Pyaza (4 Pic)         |       170 |
|                           | Anda Masala                   |       170 |
|                           | Anda Kadahi (4 Pic)           |       180 |
|                           | Anda Handi (4 Pic)            |       170 |
|                           | Anda Butter Masala (4 Pic)    |       170 |
|                           | Anda Bhurji (4 Pic)           |       100 |
| **Dal**                   | Dal Fry                       |        90 |
|                           | Plain Dal                     |        90 |
|                           | Dal Tadka                     |       100 |
|                           | Dal Mughlai                   |       140 |
|                           | Jeera Dal                     |        80 |
|                           | Dal Butter Tadka              |       110 |
| **Tandoori Roti**         | Plain Roti                    |        12 |
|                           | Butter Roti                   |        15 |
|                           | Butter Naan                   |        40 |
|                           | Plain Naan                    |        35 |
|                           | Stuffed Naan                  |        70 |
|                           | Paneer Stuffed Naan           |        70 |
|                           | Stuffed Kulcha                |        70 |
|                           | Kashmiri Naan                 |       100 |
|                           | Garlic Naan                   |        80 |
|                           | Missi Roti                    |        60 |
|                           | Paneer Paratha                |        70 |
|                           | Onion Kulcha                  |        60 |
|                           | Aloo Paratha                  |        60 |
|                           | Lachha Paratha                |        50 |
|                           | Onion Paratha                 |        50 |
| **Biryani / Kofta**       | Veg Biryani                   |       180 |
|                           | Paneer Biryani                |       220 |
|                           | Chicken Biryani               |       230 |
|                           | Anda Biryani                  |       190 |
|                           | Mushroom Biryani              |       220 |
|                           | Chicken Hyderabadi Biryani    |       240 |
|                           | Mutton Biryani                |       260 |
|                           | Veg Kofta                     |       220 |
|                           | Paneer Kofta                  |       230 |
|                           | Malai Kofta                   |       250 |
| **Rice**                  | Plain Rice                    |        90 |
|                           | Jeera Rice                    |       100 |
|                           | Lemon Rice                    |       110 |
|                           | Veg Pulao                     |       150 |
|                           | Matar Pulao                   |       150 |
|                           | Navratan Pulao                |       200 |
| **Raita**                 | Veg Raita                     |       100 |
|                           | Onion Raita                   |        80 |
|                           | Boondi Raita                  |        80 |
| **Papad**                 | Papad Dry                     |        15 |
|                           | Papad Fry                     |        15 |
|                           | Papad Masala                  |        50 |
| **Salad**                 | Green Salad                   |        50 |
|                           | Onion Salad                   |        60 |
|                           | Fruit Salad                   |       120 |
| **Desserts**              | Pastry                        |        60 |
|                           | Ice Cream                     |        50 |
`;

async function run() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@nirvanacafe.com',
    password: 'S3cur3Nirv@na2026',
  });
  if (authError) {
    console.error('❌ Failed to authenticate:', authError.message);
    process.exit(1);
  }
  console.log('✅ Authenticated as owner:', authData.user.email);

  console.log('🔄 Starting menu seed process from Markdown...');

  const { error: delItemsErr } = await supabase.from('menu_items').delete().eq('restaurant_id', RESTAURANT_ID);
  if (delItemsErr) throw delItemsErr;
  console.log('✅ Existing menu items deleted.');

  const { error: delCatsErr } = await supabase.from('categories').delete().eq('restaurant_id', RESTAURANT_ID);
  if (delCatsErr) throw delCatsErr;
  console.log('✅ Existing categories deleted.');

  const lines = markdownTable.split('\n');
  let currentCategoryName = '';
  
  const categoryMap = new Map();
  const menuItems = [];
  
  let catSortOrder = 1;

  // Icons mapping
  const iconMap = {
    'Mocktails / Beverages': 'glass-water',
    'Veg Soup': 'soup',
    'Non-Veg Soup': 'soup',
    'Kabab': 'meat',
    'Starter': 'flame',
    'South Indian': 'leaf',
    'Uttapam': 'leaf',
    'Snacks': 'cookie',
    'Chinese': 'utensils',
    'Indian Veg': 'leaf',
    'Indian Non-Veg': 'beef',
    'Mutton': 'beef',
    'Egg': 'egg',
    'Dal': 'soup',
    'Tandoori Roti': 'pizza',
    'Biryani / Kofta': 'rice',
    'Rice': 'rice',
    'Raita': 'droplets',
    'Papad': 'cookie',
    'Salad': 'leaf',
    'Desserts': 'cake-slice'
  };

  let itemSortOrder = 1;

  for (const line of lines) {
    if (!line.includes('|') || line.includes('---') || line.includes('Category |')) continue;
    
    let [empty, catCol, itemCol, priceCol] = line.split('|').map(s => s.trim());
    if (!itemCol) continue;
    
    if (catCol) {
      currentCategoryName = catCol.replace(/\*\*/g, '').trim();
      if (!categoryMap.has(currentCategoryName)) {
        const catId = uuid();
        categoryMap.set(currentCategoryName, {
          id: catId,
          restaurant_id: RESTAURANT_ID,
          name: currentCategoryName,
          slug: generateSlug(currentCategoryName),
          sort_order: catSortOrder++,
          icon: iconMap[currentCategoryName] || 'utensils',
          is_active: true
        });
        itemSortOrder = 1;
      }
    }

    const itemName = itemCol;
    let fullPrice = null;
    let halfPrice = null;
    let hasHalfPrice = false;

    if (priceCol.includes('/')) {
      const [full, half] = priceCol.split('/').map(p => parseFloat(p.trim()));
      fullPrice = full;
      halfPrice = half;
      hasHalfPrice = true;
    } else {
      fullPrice = parseFloat(priceCol.replace(/[^0-9.]/g, ''));
    }

    const nameLower = itemName.toLowerCase();
    const isVeg = !(nameLower.includes('chicken') || nameLower.includes('mutton') || nameLower.includes('egg') || nameLower.includes('anda'));

    menuItems.push({
      id: uuid(),
      restaurant_id: RESTAURANT_ID,
      category_id: categoryMap.get(currentCategoryName).id,
      name: itemName,
      description: '',
      is_veg: isVeg,
      has_half_price: hasHalfPrice,
      full_price: fullPrice,
      half_price: halfPrice,
      preparation_time_minutes: 15,
      is_available: true,
      sort_order: itemSortOrder++,
      is_chef_special: false
    });
  }

  const categoryArray = Array.from(categoryMap.values());
  const { error: catErr } = await supabase.from('categories').insert(categoryArray);
  if (catErr) {
    console.error('❌ Failed to insert categories:', catErr.message);
    process.exit(1);
  }
  console.log(`✅ ${categoryArray.length} categories inserted.`);

  const batchSize = 50;
  for (let i = 0; i < menuItems.length; i += batchSize) {
    const batch = menuItems.slice(i, i + batchSize);
    const { error: itemErr } = await supabase.from('menu_items').insert(batch);
    if (itemErr) {
      console.error(`❌ Failed to insert menu items batch ${i / batchSize + 1}:`, itemErr.message);
      process.exit(1);
    }
    console.log(`  ✅ Batch ${i / batchSize + 1}: ${batch.length} items inserted`);
  }

  console.log(`🎉 Done! Total: ${categoryArray.length} categories, ${menuItems.length} menu items seeded.`);
}

run().catch(console.error);
