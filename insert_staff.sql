INSERT INTO public.staff (id, restaurant_id, email, name, role, pin)
SELECT id, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin@nirvanacafe.com', 'Restaurant Owner', 'owner', '1234'
FROM auth.users
WHERE email = 'admin@nirvanacafe.com'
ON CONFLICT (id) DO NOTHING;
