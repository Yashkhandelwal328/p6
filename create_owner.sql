DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_rest_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@nirvanacafe.com',
    crypt('S3cur3Nirv@na2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Owner"}',
    now(),
    now(),
    'authenticated',
    '',
    '',
    '',
    ''
  );

  -- Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    v_user_id,
    format('{"sub":"%s","email":"%s"}', v_user_id::text, 'admin@nirvanacafe.com')::jsonb,
    'email',
    now(),
    now(),
    now()
  );

  -- Insert into public.staff
  INSERT INTO public.staff (
    id,
    restaurant_id,
    email,
    name,
    role,
    pin
  )
  VALUES (
    v_user_id,
    v_rest_id,
    'admin@nirvanacafe.com',
    'Restaurant Owner',
    'owner',
    '1234'
  );
END $$;
