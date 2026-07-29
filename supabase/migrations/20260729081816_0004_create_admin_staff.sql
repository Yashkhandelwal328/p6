/*
# Create Admin Staff Record

## Overview
Links the demo admin auth user (admin@nirvana.com) to the staff table as an "admin" role
for the default Nirvana restaurant.

## Data Inserted
- `staff` record: user_id = f1a2b3c4-d5e6-7890-abcd-ef1234567890, role = 'admin', name = 'Nirvana Admin'
*/

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
