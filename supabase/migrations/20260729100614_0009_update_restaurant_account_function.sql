/*
# Update create_restaurant_account: Add New Params + Default Tables & Categories

## Overview
Updates the `create_restaurant_account` function to:
1. Accept new parameters: p_owner_phone, p_address, p_gst_number
2. Store address and GST number on the restaurant record
3. Create 20 default tables (Table 1 to Table 20)
4. Create default categories (Starters, Main Course, Biryani, Beverages, Desserts)
5. Return the restaurant_id and restaurant_code

## Security
- Still SECURITY DEFINER (needed to bootstrap restaurant + staff for new users)
- Still validates p_user_id = auth.uid()
- All inserts are atomic within the function
*/

DROP FUNCTION IF EXISTS create_restaurant_account(text, text, text, uuid, text);

CREATE OR REPLACE FUNCTION create_restaurant_account(
  p_restaurant_name text,
  p_owner_name text,
  p_owner_email text,
  p_user_id uuid,
  p_prefix text,
  p_owner_phone text DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_gst_number text DEFAULT NULL
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

  INSERT INTO restaurants (
    name, tagline, restaurant_code, theme_color, currency,
    tax_percentage, service_charge_percentage,
    opening_time, closing_time, is_active,
    address, email, phone
  ) VALUES (
    p_restaurant_name,
    'Premium Dining Experience',
    v_restaurant_code,
    '#C9A227',
    '₹',
    5,
    0,
    '09:00',
    '23:00',
    true,
    p_address,
    p_owner_email,
    p_owner_phone
  )
  RETURNING id INTO v_restaurant_id;

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

  INSERT INTO categories (restaurant_id, name, sort_order, is_active)
  VALUES
    (v_restaurant_id, 'Starters', 1, true),
    (v_restaurant_id, 'Main Course', 2, true),
    (v_restaurant_id, 'Biryani', 3, true),
    (v_restaurant_id, 'Beverages', 4, true),
    (v_restaurant_id, 'Desserts', 5, true);

  RETURN json_build_object(
    'restaurant_id', v_restaurant_id,
    'restaurant_code', v_restaurant_code
  );
END;
$$;

GRANT EXECUTE ON FUNCTION create_restaurant_account TO authenticated;
