UPDATE public.staff
SET user_id = id
WHERE email = 'owner@nirvana.com' AND user_id IS NULL;
