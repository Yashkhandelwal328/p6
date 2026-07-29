COPY (SELECT row_to_json(t) FROM (SELECT * FROM public.staff WHERE email = 'owner@nirvana.com') t) TO STDOUT;
