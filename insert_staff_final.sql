INSERT INTO public.staff (id, restaurant_id, user_id, name, email, role, is_active)
VALUES (
  gen_random_uuid(),
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'd107aa9f-d035-4b69-baa8-5b7517744b82',
  'Restaurant Owner',
  'admin@nirvanacafe.com',
  'owner',
  true
);
