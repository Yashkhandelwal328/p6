UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email = 'owner@nirvana.com';
