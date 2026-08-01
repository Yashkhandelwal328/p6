-- Premium Leads Table
CREATE TABLE IF NOT EXISTS public.premium_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- RLS for premium_leads
ALTER TABLE public.premium_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can view premium_leads" 
    ON public.premium_leads FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE staff.id = auth.uid() 
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
            WHERE staff.id = auth.uid() 
            AND staff.role = 'super_admin'
        )
    );

CREATE POLICY "Super admin can delete premium_leads" 
    ON public.premium_leads FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE staff.id = auth.uid() 
            AND staff.role = 'super_admin'
        )
    );

-- Create a trigger to auto-assign super_admin role to yashkhandeelwa@gmail.com
CREATE OR REPLACE FUNCTION public.handle_super_admin_assignment()
RETURNS trigger AS $$
BEGIN
  IF NEW.email = 'yashkhandeelwa@gmail.com' THEN
    -- Update existing staff record if it was just created, or insert a new one
    INSERT INTO public.staff (id, restaurant_id, role, name, email, phone, pin, is_active)
    VALUES (
      NEW.id,
      NULL,
      'super_admin',
      'Super Admin',
      NEW.email,
      '0000000000',
      '0000',
      true
    ) ON CONFLICT (id) DO UPDATE SET role = 'super_admin', restaurant_id = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_super_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_super_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_super_admin_assignment();
