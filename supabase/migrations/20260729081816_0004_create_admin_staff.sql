/*
# Create Admin Staff Record

## Overview
Links the demo admin auth user (admin@nirvana.com) to the staff table as an "admin" role
for the default Nirvana restaurant.

## Data Inserted
- `auth.users` record: id = f1a2b3c4-d5e6-7890-abcd-ef1234567890, email = 'admin@nirvana.com'
- `staff` record: user_id = f1a2b3c4-d5e6-7890-abcd-ef1234567890, role = 'admin', name = 'Nirvana Admin'
*/

-- 1. Create the user in auth.users first
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  'f1a2b3c4-d5e6-7890-abcd-ef1234567890',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@nirvana.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 2. Create the staff record linked to the auth user
INSERT INTO staff (restaurant_id, user_id, name, email, role, is_active)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'f1a2b3c4-d5e6-7890-abcd-ef1234567890',
  'Nirvana Admin',
  'admin@nirvana.com',
  'admin',
  true
)
ON CONFLICT (restaurant_id, email) DO NOTHING;

