-- Add delivery columns to orders table
ALTER TABLE orders 
  ALTER COLUMN table_id DROP NOT NULL,
  ALTER COLUMN table_number DROP NOT NULL,
  ADD COLUMN order_type text DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'delivery', 'takeaway')),
  ADD COLUMN delivery_address text,
  ADD COLUMN delivery_latitude numeric(10,8),
  ADD COLUMN delivery_longitude numeric(11,8);

-- Add delivery settings to restaurants table
ALTER TABLE restaurants
  ADD COLUMN min_delivery_amount numeric(12,2) DEFAULT 200,
  ADD COLUMN max_delivery_radius_km numeric(5,2) DEFAULT 5.0,
  ADD COLUMN restaurant_latitude numeric(10,8),
  ADD COLUMN restaurant_longitude numeric(11,8);

-- Update the default restaurant with some dummy coordinates (e.g. Mumbai)
UPDATE restaurants 
SET 
  restaurant_latitude = 19.0760, 
  restaurant_longitude = 72.8777
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
