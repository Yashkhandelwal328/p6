INSERT INTO public.staff (id, restaurant_id, email, name, role, pin)
SELECT id, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'owner@nirvana.com', 'Restaurant Owner', 'owner', '1234'
FROM auth.users
WHERE email = 'owner@nirvana.com'
ON CONFLICT (id) DO NOTHING;
