SELECT json_agg(t) FROM (SELECT id, user_id, email FROM public.staff WHERE email = 'owner@nirvana.com') t;
