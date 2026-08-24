-- Add missing columns to restaurants for wizard onboarding
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS cuisine_type text,
  ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS delivery_available boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS dine_in_available boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS takeaway_available boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS delivery_radius_km numeric(5,2) DEFAULT 5.0,
  ADD COLUMN IF NOT EXISTS min_delivery_amount numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS preparation_time_minutes int DEFAULT 15,
  ADD COLUMN IF NOT EXISTS dark_mode boolean DEFAULT true;

-- Drop old function
DROP FUNCTION IF EXISTS create_restaurant_account(text, text, text, uuid, text, text, text, text);
DROP FUNCTION IF EXISTS create_restaurant_account(text, text, text, uuid, text, text, text, text, text);

-- Create new wizard RPC
CREATE OR REPLACE FUNCTION create_restaurant_wizard(
  p_payload JSONB
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_restaurant_id uuid;
  v_restaurant_code text;
  v_code_number int;
  v_prefix_clean text;
  v_subdomain text;
  v_i int;
  
  -- Extracted data
  v_restaurant_name text;
  v_owner_name text;
  v_owner_email text;
  
  v_categories jsonb;
  v_menu_items jsonb;
  v_cat jsonb;
  v_item jsonb;
  v_cat_id uuid;
  v_cat_idx int := 0;
BEGIN
  v_user_id := (p_payload->>'user_id')::uuid;
  
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'User ID mismatch: you can only create an account for yourself';
  END IF;

  v_restaurant_name := p_payload->>'restaurant_name';
  v_owner_name := p_payload->>'owner_name';
  v_owner_email := p_payload->>'owner_email';

  v_prefix_clean := upper(substr(regexp_replace(v_restaurant_name, '[^A-Za-z]', '', 'g'), 1, 3));
  IF length(v_prefix_clean) < 3 THEN
    v_prefix_clean := rpad(v_prefix_clean, 3, 'X');
  END IF;

  SELECT COALESCE(max(cast(substr(restaurant_code, 6) as int)), 0) + 1
  INTO v_code_number
  FROM restaurants
  WHERE restaurant_code LIKE v_prefix_clean || '-%';

  v_restaurant_code := v_prefix_clean || '-' || lpad(v_code_number::text, 4, '0');

  v_subdomain := lower(regexp_replace(v_restaurant_name, '[^A-Za-z0-9]', '', 'g'));
  IF EXISTS (SELECT 1 FROM restaurants WHERE subdomain = v_subdomain) THEN
    v_subdomain := v_subdomain || v_code_number::text;
  END IF;

  -- Insert Restaurant
  INSERT INTO restaurants (
    name, tagline, description, cuisine_type, restaurant_code, currency,
    tax_percentage, opening_time, closing_time, is_active,
    address, email, phone, subdomain, logo_url, banner_url,
    social_links, delivery_available, dine_in_available, takeaway_available,
    delivery_radius_km, preparation_time_minutes, dark_mode,
    primary_color, secondary_color, accent_color, background_color,
    font_family, button_style, border_radius, website_status
  ) VALUES (
    v_restaurant_name,
    p_payload->>'tagline',
    p_payload->>'description',
    p_payload->>'cuisine_type',
    v_restaurant_code,
    COALESCE(p_payload->>'currency', '₹'),
    COALESCE((p_payload->>'tax_percentage')::numeric, 0),
    COALESCE(p_payload->>'opening_time', '09:00')::time,
    COALESCE(p_payload->>'closing_time', '23:00')::time,
    false, -- is_active
    p_payload->>'address',
    p_payload->>'support_email',
    p_payload->>'contact_number',
    v_subdomain,
    p_payload->>'logo_url',
    p_payload->>'banner_url',
    COALESCE(p_payload->'social_links', '{}'::jsonb),
    COALESCE((p_payload->>'delivery_available')::boolean, true),
    COALESCE((p_payload->>'dine_in_available')::boolean, true),
    COALESCE((p_payload->>'takeaway_available')::boolean, true),
    COALESCE((p_payload->>'delivery_radius')::numeric, 5.0),
    COALESCE((p_payload->>'preparation_time')::int, 15),
    COALESCE((p_payload->>'dark_mode')::boolean, true),
    COALESCE(p_payload->>'primary_color', '#2F4156'),
    COALESCE(p_payload->>'secondary_color', '#567C8D'),
    COALESCE(p_payload->>'accent_color', '#C8D9E6'),
    COALESCE(p_payload->>'background_color', '#F5EFEB'),
    COALESCE(p_payload->>'font_family', 'Inter'),
    COALESCE(p_payload->>'button_style', 'rounded'),
    COALESCE(p_payload->>'border_radius', '0.5rem'),
    'pending' -- website_status
  )
  RETURNING id INTO v_restaurant_id;

  -- Insert Subscription
  INSERT INTO subscriptions (restaurant_id, plan, status)
  VALUES (v_restaurant_id, COALESCE(p_payload->>'plan', 'starter'), 'pending_approval');

  -- Insert Staff
  INSERT INTO staff (restaurant_id, user_id, name, email, phone, role, is_active)
  VALUES (v_restaurant_id, v_user_id, v_owner_name, v_owner_email, p_payload->>'phone', 'owner', true);

  -- Insert default tables
  FOR v_i IN 1..20 LOOP
    INSERT INTO tables (restaurant_id, table_number, capacity, status)
    VALUES (v_restaurant_id, v_i, 4, 'available');
  END LOOP;

  -- Insert Categories and Menu Items
  v_categories := p_payload->'categories';
  v_menu_items := p_payload->'menu_items';

  IF v_categories IS NOT NULL AND jsonb_typeof(v_categories) = 'array' THEN
    FOR v_cat IN SELECT * FROM jsonb_array_elements(v_categories) LOOP
      v_cat_idx := v_cat_idx + 1;
      INSERT INTO categories (restaurant_id, name, slug, sort_order, is_active)
      VALUES (
        v_restaurant_id, 
        v_cat->>'name', 
        lower(regexp_replace(v_cat->>'name', '[^A-Za-z0-9]', '-', 'g')) || '-' || v_cat_idx::text, 
        COALESCE((v_cat->>'sort_order')::int, v_cat_idx), 
        true
      ) RETURNING id INTO v_cat_id;
      
      -- Insert items for this category
      IF v_menu_items IS NOT NULL AND jsonb_typeof(v_menu_items) = 'array' THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(v_menu_items) LOOP
          IF v_item->>'category_name' = v_cat->>'name' THEN
            INSERT INTO menu_items (
              restaurant_id, category_id, name, description,
              full_price, is_veg, preparation_time_minutes,
              image_url, is_available
            ) VALUES (
              v_restaurant_id,
              v_cat_id,
              v_item->>'name',
              v_item->>'description',
              (v_item->>'price')::numeric,
              (v_item->>'is_veg')::boolean,
              (v_item->>'preparation_time')::int,
              v_item->>'image_url',
              true
            );
          END IF;
        END LOOP;
      END IF;
    END LOOP;
  END IF;

  RETURN json_build_object(
    'restaurant_id', v_restaurant_id,
    'restaurant_code', v_restaurant_code,
    'subdomain', v_subdomain
  );
END;
$$;

GRANT EXECUTE ON FUNCTION create_restaurant_wizard TO authenticated;
