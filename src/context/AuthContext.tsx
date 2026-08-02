import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Staff, StaffRole } from '@/types';

interface AuthContextValue {
  session: Session | null;
  staff: Staff | null;
  restaurantId: string | null;
  role: StaffRole | null;
  loading: boolean;
  isPendingApproval: boolean;
  impersonatedRestaurantId: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setImpersonatedRestaurantId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [impersonatedRestaurantId, setImpersonatedRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        loadStaff(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        (async () => {
          await loadStaff(newSession.user.id);
        })();
      } else {
        setStaff(null);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function loadStaff(userId: string) {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Failed to load staff:', error.message);
    }
    setStaff(data);

    if (data?.restaurant_id) {
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('restaurant_id', data.restaurant_id)
        .maybeSingle();
      
      setIsPendingApproval(subData?.status === 'pending_approval');
    }

    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setStaff(null);
  }

  const restaurantId = staff?.restaurant_id ?? null;
  const role = staff?.role ?? null;
  const activeRestaurantId = role === 'super_admin' && impersonatedRestaurantId 
    ? impersonatedRestaurantId 
    : restaurantId;

  return (
    <AuthContext.Provider value={{ 
      session, 
      staff, 
      restaurantId: activeRestaurantId, 
      role, 
      loading, 
      isPendingApproval,
      impersonatedRestaurantId,
      signIn, 
      signOut,
      setImpersonatedRestaurantId
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
