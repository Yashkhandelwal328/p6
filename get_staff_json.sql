COPY (SELECT row_to_json(t) FROM (SELECT * FROM public.staff WHERE email = 'admin@nirvanacafe.com') t) TO STDOUT;
