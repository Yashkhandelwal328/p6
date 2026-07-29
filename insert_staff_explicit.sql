DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'owner@nirvana.com' LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.staff (id, restaurant_id, user_id, name, email, role, is_active, pin)
    VALUES (
      gen_random_uuid(),
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      v_user_id,
      'Restaurant Owner',
      'owner@nirvana.com',
      'owner',
      true,
      '1234'
    )
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id;
  END IF;
END $$;
