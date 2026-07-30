ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS is_open boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS payment_qr_url text;
