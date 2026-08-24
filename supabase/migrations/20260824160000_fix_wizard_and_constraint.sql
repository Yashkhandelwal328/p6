-- Fix wizard and constraints

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all check constraints on restaurants
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'restaurants'::regclass 
          AND contype = 'c'
    ) LOOP
        EXECUTE 'ALTER TABLE restaurants DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- Add back necessary constraints
ALTER TABLE restaurants
  ADD CONSTRAINT restaurants_website_status_check CHECK (website_status IN ('draft', 'published', 'maintenance', 'suspended', 'pending'));

-- Re-create the wizard function with merged logic
CREATE OR REPLACE FUNCTION generate_unique_slug(base_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_slug text;
  v_final_slug text;
  v_counter int := 1;
BEGIN
  v_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  
  IF v_slug = '' THEN
    v_slug := 'restaurant';
  END IF;

  v_final_slug := v_slug;

  WHILE 
    v_final_slug IN ('login', 'register', 'forgot-password', 'pricing', 'features', 'about', 'contact', 'owner', 'sup', 'api', 'assets', 'settings', 'profile') 
    OR EXISTS (SELECT 1 FROM restaurants WHERE subdomain = v_final_slug) 
  LOOP
    v_counter := v_counter + 1;
    v_final_slug := v_slug || '-' || v_counter::text;
  END LOOP;

  RETURN v_final_slug;
END;
$$;

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

  v_subdomain := generate_unique_slug(v_restaurant_name);

  -- Insert Restaurant
  INSERT INTO restaurants (
    name, tagline, description, cuisine_type, restaurant_code, currency,
    tax_percentage, opening_time, closing_time, is_active, website_status,
    address, email, phone, subdomain, logo_url, banner_url,
    social_links, delivery_available, dine_in_available, takeaway_available,
    delivery_radius_km, preparation_time_minutes, dark_mode,
    primary_color, secondary_color, accent_color, background_color,
    font_family, button_style, border_radius
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
    false, -- is_active starts false
    'pending', -- START AS PENDING
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
    COALESCE(p_payload->>'border_radius', '0.5rem')
  ) RETURNING id INTO v_restaurant_id;

  -- Insert Subscription
  INSERT INTO subscriptions (restaurant_id, plan, status)
  VALUES (v_restaurant_id, COALESCE(p_payload->>'plan', 'starter'), 'pending_approval');

  -- Update auth user metadata
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || 
      jsonb_build_object(
        'restaurant_id', v_restaurant_id, 
        'role', 'owner',
        'full_name', v_owner_name
      )
  WHERE id = v_user_id;

  -- Create Staff record for Owner
  INSERT INTO staff (
    restaurant_id, user_id, role, name, email, phone, is_active
  ) VALUES (
    v_restaurant_id, v_user_id, 'owner', v_owner_name, v_owner_email, p_payload->>'phone', true
  );

  -- Insert default tables
  FOR v_i IN 1..20 LOOP
    INSERT INTO tables (restaurant_id, table_number, capacity, status)
    VALUES (v_restaurant_id, v_i, 4, 'available');
  END LOOP;

  -- Create initial categories & items
  v_categories := p_payload->'categories';
  v_menu_items := p_payload->'menu_items';

  IF v_categories IS NOT NULL AND jsonb_typeof(v_categories) = 'array' AND jsonb_array_length(v_categories) > 0 THEN
    FOR v_cat IN SELECT * FROM jsonb_array_elements(v_categories) LOOP
      v_cat_idx := v_cat_idx + 1;
      INSERT INTO categories (restaurant_id, name, slug, sort_order, is_active)
      VALUES (
        v_restaurant_id, 
        v_cat->>'name', 
        lower(regexp_replace(v_cat->>'name', '[^A-Za-z0-9]', '-', 'g')) || '-' || v_cat_idx::text, 
        COALESCE((v_cat->>'sort_order')::int, v_cat_idx), 
        true
      )
      RETURNING id INTO v_cat_id;
      
      -- Insert items for this category
      IF v_menu_items IS NOT NULL AND jsonb_typeof(v_menu_items) = 'array' AND jsonb_array_length(v_menu_items) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(v_menu_items) LOOP
          IF v_item->>'category_name' = v_cat->>'name' THEN
            INSERT INTO menu_items (
              restaurant_id, category_id, name, description, 
              full_price, is_veg, preparation_time_minutes, image_url, is_available
            ) VALUES (
              v_restaurant_id, v_cat_id, v_item->>'name', v_item->>'description', 
              (v_item->>'price')::numeric, (v_item->>'is_veg')::boolean, 
              (v_item->>'preparation_time')::int, v_item->>'image_url', true
            );
          END IF;
        END LOOP;
      END IF;
    END LOOP;
  END IF;

  RETURN json_build_object('success', true, 'restaurant_id', v_restaurant_id, 'slug', v_subdomain);
END;
$$;
