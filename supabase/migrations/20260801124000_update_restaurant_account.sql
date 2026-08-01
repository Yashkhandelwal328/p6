-- Update create_restaurant_account to handle SaaS subscriptions and subdomain

DROP FUNCTION IF EXISTS create_restaurant_account(text, text, text, uuid, text, text, text, text);

CREATE OR REPLACE FUNCTION create_restaurant_account(
  p_restaurant_name text,
  p_owner_name text,
  p_owner_email text,
  p_user_id uuid,
  p_prefix text,
  p_owner_phone text DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_gst_number text DEFAULT NULL,
  p_plan text DEFAULT 'starter'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_restaurant_id uuid;
  v_restaurant_code text;
  v_code_number int;
  v_prefix_clean text;
  v_subdomain text;
  v_i int;
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'User ID mismatch: you can only create an account for yourself';
  END IF;

  v_prefix_clean := upper(substr(regexp_replace(p_prefix, '[^A-Za-z]', '', 'g'), 1, 3));
  IF length(v_prefix_clean) < 3 THEN
    v_prefix_clean := rpad(v_prefix_clean, 3, 'X');
  END IF;

  SELECT COALESCE(max(cast(substr(restaurant_code, 6) as int)), 0) + 1
  INTO v_code_number
  FROM restaurants
  WHERE restaurant_code LIKE v_prefix_clean || '-%';

  v_restaurant_code := v_prefix_clean || '-' || lpad(v_code_number::text, 4, '0');

  -- Generate a URL-friendly subdomain from the restaurant name
  v_subdomain := lower(regexp_replace(p_restaurant_name, '[^A-Za-z0-9]', '', 'g'));
  -- Ensure uniqueness for subdomain, in a real scenario we'd do a loop or append a number if it exists
  -- For now, if it exists, append the code number
  IF EXISTS (SELECT 1 FROM restaurants WHERE subdomain = v_subdomain) THEN
    v_subdomain := v_subdomain || v_code_number::text;
  END IF;

  INSERT INTO restaurants (
    name, tagline, restaurant_code, theme_color, currency,
    tax_percentage, service_charge_percentage,
    opening_time, closing_time, is_active,
    address, email, phone, subdomain, primary_color, secondary_color, accent_color, background_color
  ) VALUES (
    p_restaurant_name,
    'Premium Dining Experience',
    v_restaurant_code,
    '#2F4156',
    '₹',
    5,
    0,
    '09:00',
    '23:00',
    true,
    p_address,
    p_owner_email,
    p_owner_phone,
    v_subdomain,
    '#2F4156', '#567C8D', '#C8D9E6', '#F5EFEB'
  )
  RETURNING id INTO v_restaurant_id;

  INSERT INTO subscriptions (
    restaurant_id, plan, status
  ) VALUES (
    v_restaurant_id, p_plan, 'active'
  );

  INSERT INTO staff (
    restaurant_id, user_id, name, email, phone, role, is_active
  ) VALUES (
    v_restaurant_id,
    p_user_id,
    p_owner_name,
    p_owner_email,
    p_owner_phone,
    'owner',
    true
  );

  FOR v_i IN 1..20 LOOP
    INSERT INTO tables (restaurant_id, table_number, capacity, status)
    VALUES (v_restaurant_id, v_i, 4, 'available');
  END LOOP;

  INSERT INTO categories (restaurant_id, name, slug, sort_order, is_active)
  VALUES
    (v_restaurant_id, 'Starters', 'starters', 1, true),
    (v_restaurant_id, 'Main Course', 'main-course', 2, true),
    (v_restaurant_id, 'Biryani', 'biryani', 3, true),
    (v_restaurant_id, 'Beverages', 'beverages', 4, true),
    (v_restaurant_id, 'Desserts', 'desserts', 5, true);

  RETURN json_build_object(
    'restaurant_id', v_restaurant_id,
    'restaurant_code', v_restaurant_code,
    'subdomain', v_subdomain
  );
END;
$$;

GRANT EXECUTE ON FUNCTION create_restaurant_account TO authenticated;
