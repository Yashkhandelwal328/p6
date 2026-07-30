-- Add a unique constraint to the image_url column in menu_items
ALTER TABLE menu_items ADD CONSTRAINT unique_image_url UNIQUE (image_url);
