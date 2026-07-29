/*
# Add gst_number column to restaurants

1. New Columns
- `restaurants.gst_number` (text, nullable) — optional GST registration number for the restaurant.
*/
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS gst_number text;
