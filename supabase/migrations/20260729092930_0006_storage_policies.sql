/*
# Storage Bucket Policies for Menu Images

## Overview
Creates public read policies and authenticated write policies for the `menu-images` storage bucket
so restaurant owners can upload food images for their menu items.

## Policies
- Public read: anyone can view menu images (anon + authenticated)
- Authenticated upload: only logged-in staff can upload
- Authenticated update: only logged-in staff can update
- Authenticated delete: only logged-in staff can delete
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "public_read_menu_images" ON storage.objects;
DROP POLICY IF EXISTS "auth_upload_menu_images" ON storage.objects;
DROP POLICY IF EXISTS "auth_update_menu_images" ON storage.objects;
DROP POLICY IF EXISTS "auth_delete_menu_images" ON storage.objects;

-- Public read
CREATE POLICY "public_read_menu_images" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'menu-images');

-- Authenticated insert
CREATE POLICY "auth_upload_menu_images" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'menu-images');

-- Authenticated update
CREATE POLICY "auth_update_menu_images" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'menu-images') WITH CHECK (bucket_id = 'menu-images');

-- Authenticated delete
CREATE POLICY "auth_delete_menu_images" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'menu-images');
