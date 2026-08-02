-- Add kitchen_message column to orders for restaurant-to-customer messaging
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS kitchen_message TEXT;
