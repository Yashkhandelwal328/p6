/*
# Create Restaurant Account Function (SECURITY DEFINER)

## Overview
This function is called by new restaurant owners during signup. It atomically creates:
1. A new restaurant record with a unique restaurant_code (e.g., NIR-0001)
2. A staff record linking the authenticated user to the new restaurant with the 'owner' role

## Why SECURITY DEFINER?
The new user has just signed up but has no staff record yet, so
`get_user_restaurant_id()` returns NULL and the RLS INSERT policies on
`restaurants` and `staff` would reject the insert. This function runs with
elevated privileges to bootstrap the restaurant and staff record, then the
normal RLS policies take over for all subsequent operations.

## Parameters
- p_restaurant_name: The restaurant's display name
- p_owner_name: The owner's full name
- p_owner_email: The owner's email (must match the auth user's email)
- p_user_id: The auth user's UUID
- p_prefix: A 3-letter prefix for the restaurant code (derived from restaurant name)

## Returns
- The new restaurant's UUID and restaurant_code as JSON

## Security
- The function validates that p_user_id matches auth.uid() to prevent impersonation
- The restaurant_code is generated sequentially (PREFIX-NNNN) with a unique constraint
- The staff record is created with role='owner' and is_active=true
*/
CREATE OR REPLACE FUNCTION create_restaurant_account(
  p_restaurant_name text,
  p_owner_name text,
  p_owner_email text,
  p_user_id uuid,
  p_prefix text
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
BEGIN
  -- Validate that the caller is the authenticated user
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'User ID mismatch: you can only create an account for yourself';
  END IF;

  -- Clean the prefix (3 uppercase letters)
  v_prefix_clean := upper(substr(regexp_replace(p_prefix, '[^A-Za-z]', '', 'g'), 1, 3));
  IF length(v_prefix_clean) < 3 THEN
    v_prefix_clean := rpad(v_prefix_clean, 3, 'X');
  END IF;

  -- Find the next available code number for this prefix
  SELECT COALESCE(max(
    cast(substr(restaurant_code, 6) as int)
  ), 0) + 1
  INTO v_code_number
  FROM restaurants
  WHERE restaurant_code LIKE v_prefix_clean || '-%';

  v_restaurant_code := v_prefix_clean || '-' || lpad(v_code_number::text, 4, '0');

  -- Create the restaurant
  INSERT INTO restaurants (
    name, tagline, restaurant_code, theme_color, currency,
    tax_percentage, service_charge_percentage,
    opening_time, closing_time, is_active
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
    true
  )
  RETURNING id INTO v_restaurant_id;

  -- Create the owner staff record
  INSERT INTO staff (
    restaurant_id, user_id, name, email, role, is_active
  ) VALUES (
    v_restaurant_id,
    p_user_id,
    p_owner_name,
    p_owner_email,
    'owner',
    true
  );

  RETURN json_build_object(
    'restaurant_id', v_restaurant_id,
    'restaurant_code', v_restaurant_code
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION create_restaurant_account TO authenticated;
