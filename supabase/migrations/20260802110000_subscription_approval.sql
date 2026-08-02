-- 1. Modify Subscriptions Table Constraints
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all check constraints on subscriptions
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'subscriptions'::regclass 
          AND contype = 'c'
    ) LOOP
        EXECUTE 'ALTER TABLE subscriptions DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_plan_check CHECK (plan IN ('starter', 'pro', 'enterprise', 'free_trial')),
  ADD CONSTRAINT subscriptions_status_check CHECK (status IN ('active', 'past_due', 'cancelled', 'trial', 'pending_approval', 'rejected'));

-- 2. Modify Restaurants Table Constraints
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all check constraints on restaurants that relate to website_status
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'restaurants'::regclass 
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ILIKE '%website_status%'
    ) LOOP
        EXECUTE 'ALTER TABLE restaurants DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

ALTER TABLE restaurants
  ADD CONSTRAINT restaurants_website_status_check CHECK (website_status IN ('draft', 'published', 'maintenance', 'suspended', 'pending'));

-- 3. Create subscription_leads Table
CREATE TABLE IF NOT EXISTS subscription_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name text NOT NULL,
  restaurant_name text NOT NULL,
  phone_number text NOT NULL,
  email text NOT NULL,
  preferred_call_time text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscription_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage subscription_leads"
  ON subscription_leads FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
      AND staff.role = 'super_admin'
    )
  );

CREATE POLICY "Owners can insert their own leads"
  ON subscription_leads FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Publicly insertable during onboarding
