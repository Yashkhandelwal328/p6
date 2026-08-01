-- 1. Subscriptions Table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'trial')),
  current_period_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (restaurant_id)
);

-- Trigger to update 'updated_at' on subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscriptions Policies
CREATE POLICY "Super admins can manage all subscriptions"
  ON subscriptions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
      AND staff.role = 'super_admin'
    )
  );

CREATE POLICY "Owners can view their own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM staff
      WHERE staff.user_id = auth.uid()
      AND staff.role = 'owner'
    )
  );

-- 2. Modify Restaurants Table for Branding & Domain
ALTER TABLE restaurants
  ADD COLUMN subdomain TEXT UNIQUE,
  ADD COLUMN custom_domain TEXT UNIQUE,
  ADD COLUMN banner_url TEXT,
  ADD COLUMN primary_color TEXT DEFAULT '#2F4156',
  ADD COLUMN secondary_color TEXT DEFAULT '#567C8D',
  ADD COLUMN accent_color TEXT DEFAULT '#C8D9E6',
  ADD COLUMN background_color TEXT DEFAULT '#F5EFEB',
  ADD COLUMN button_style TEXT DEFAULT 'rounded' CHECK (button_style IN ('rounded', 'pill', 'square')),
  ADD COLUMN border_radius TEXT DEFAULT '0.5rem',
  ADD COLUMN font_family TEXT DEFAULT 'Inter';

-- 3. Super Admin adjustments to staff and RLS
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Modify core policies to allow super_admin access
CREATE POLICY "Super admins can view all restaurants"
  ON restaurants FOR SELECT
  TO authenticated
  USING (is_super_admin());

CREATE POLICY "Super admins can update all restaurants"
  ON restaurants FOR UPDATE
  TO authenticated
  USING (is_super_admin());

CREATE POLICY "Super admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (is_super_admin());

CREATE POLICY "Super admins can view all staff"
  ON staff FOR SELECT
  TO authenticated
  USING (is_super_admin());

CREATE POLICY "Super admins can view all customers"
  ON customers FOR SELECT
  TO authenticated
  USING (is_super_admin());

CREATE POLICY "Super admins can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (is_super_admin());
