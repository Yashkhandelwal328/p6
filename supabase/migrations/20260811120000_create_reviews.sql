-- Reviews table for customer feedback
-- Reviews are per-restaurant and visible to super admin

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'website' CHECK (source IN ('website', 'owner_dashboard', 'order_page')),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can insert reviews (customers are anonymous/not authenticated)
DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Authenticated users can read reviews
DROP POLICY IF EXISTS "auth_select_reviews" ON reviews;
CREATE POLICY "auth_select_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

-- Authenticated users can update reviews (e.g., mark as read)
DROP POLICY IF EXISTS "auth_update_reviews" ON reviews;
CREATE POLICY "auth_update_reviews" ON reviews FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Authenticated users can delete reviews
DROP POLICY IF EXISTS "auth_delete_reviews" ON reviews;
CREATE POLICY "auth_delete_reviews" ON reviews FOR DELETE
  TO authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_read ON reviews(is_read);
