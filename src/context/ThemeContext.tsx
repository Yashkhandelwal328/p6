import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Restaurant } from '@/types';

interface ThemeContextType {
  restaurant: Restaurant | null;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({ restaurant: null, loading: true });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { restaurantId } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTenantBranding() {
      const host = window.location.host; // e.g., pizzapalace.yourplatform.com or localhost:5173
      
      // Basic check: if it's the main domain (e.g. app.com) or just localhost (no subdomain), don't load a tenant
      // For local testing, we might pass a subdomain like tenant.localhost:5173
      const parts = host.split('.');
      if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost' && parts[0] !== 'app') {
        const subdomain = parts[0];
        
        try {
          const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('subdomain', subdomain)
            .single();

          if (data) {
            setRestaurant(data as Restaurant);
            applyTheme(data);
          }
        } catch (err) {
          console.error("Error loading tenant theme:", err);
        }
      } else if (restaurantId) {
        // Logged into dashboard on main domain
        try {
          const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('id', restaurantId)
            .single();

          if (data) {
            setRestaurant(data as Restaurant);
            applyTheme(data);
          }
        } catch (err) {
          console.error("Error loading dashboard theme:", err);
        }
      }
      setLoading(false);
    }

    function applyTheme(data: any) {
      const root = document.documentElement;
      root.style.setProperty('--tenant-primary', data.primary_color || '#2F4156');
      root.style.setProperty('--tenant-secondary', data.secondary_color || '#567C8D');
      root.style.setProperty('--tenant-accent', data.accent_color || '#C8D9E6');
      root.style.setProperty('--tenant-background', data.background_color || '#F5EFEB');
      if (data.border_radius) {
        root.style.setProperty('--tenant-radius', data.border_radius);
      }
      if (data.font_family) {
        root.style.setProperty('--tenant-font', data.font_family);
      }

      document.title = data.name;
      
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon && data.logo_url) {
        favicon.href = data.logo_url;
      }
    }
    loadTenantBranding();
  }, [restaurantId]);

  return (
    <ThemeContext.Provider value={{ restaurant, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
