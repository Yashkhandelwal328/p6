UPDATE auth.users 
SET encrypted_password = crypt('S3cur3Nirv@na2026', gen_salt('bf'))
WHERE email = 'admin@nirvanacafe.com';
