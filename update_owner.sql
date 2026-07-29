UPDATE auth.users 
SET encrypted_password = crypt('Nirvana@123', gen_salt('bf'))
WHERE email = 'owner@nirvana.com';
