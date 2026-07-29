ALTER TABLE restaurants 
ADD COLUMN is_open boolean DEFAULT true,
ADD COLUMN payment_qr_url text;
