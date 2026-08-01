-- ============================================
-- STEP 1: Premium Leads Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.premium_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    owner_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    preferred_call_time TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'meeting_scheduled', 'converted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.premium_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can view premium_leads" 
    ON public.premium_leads FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE staff.user_id = auth.uid() 
            AND staff.role = 'super_admin'
        )
    );

CREATE POLICY "Anyone can insert premium_leads" 
    ON public.premium_leads FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Super admin can update premium_leads" 
    ON public.premium_leads FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE staff.user_id = auth.uid() 
            AND staff.role = 'super_admin'
        )
    );

CREATE POLICY "Super admin can delete premium_leads" 
    ON public.premium_leads FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE staff.user_id = auth.uid() 
            AND staff.role = 'super_admin'
        )
    );

-- ============================================
-- STEP 2: Fix the staff role CHECK constraint
-- Allow super_admin, manager, cashier roles
-- ============================================
ALTER TABLE public.staff DROP CONSTRAINT IF EXISTS staff_role_check;
ALTER TABLE public.staff ADD CONSTRAINT staff_role_check 
    CHECK (role IN ('super_admin', 'owner', 'admin', 'manager', 'cashier', 'chef', 'waiter'));

-- ============================================
-- STEP 3: Allow restaurant_id to be NULL
-- (Super admins don't belong to a specific restaurant)
-- ============================================
ALTER TABLE public.staff ALTER COLUMN restaurant_id DROP NOT NULL;
