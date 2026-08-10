UPDATE public.staff
SET user_id = id
WHERE email = 'admin@nirvanacafe.com' AND user_id IS NULL;
