import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { generateThemeVariables } from '@/lib/theme-presets';
import type { Restaurant } from '@/types';

interface ThemeContextType {
  restaurant: Restaurant | null;
  loading: boolean;
  refreshTheme: () => Promise<void>;
  previewTheme: (data: Partial<Restaurant>) => void;
}

const ThemeContext = createContext<ThemeContextType>({ 
  restaurant: null, 
  loading: true,
  refreshTheme: async () => {},
  previewTheme: () => {}
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { restaurantId } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadTenantBranding() {
    setLoading(true);
    const host = window.location.host; 
    const parts = host.split('.');
    
    if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost' && parts[0] !== 'app') {
      const subdomain = parts[0];
      try {
        const { data } = await supabase
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
      try {
        const { data } = await supabase
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

  function applyTheme(data: Partial<Restaurant>) {
    const root = document.documentElement;
    
    // Generate semantic palette based on base colors
    const themeVars = generateThemeVariables(
      data.primary_color || '#2F4156',
      data.secondary_color || '#567C8D',
      data.accent_color || '#C8D9E6',
      data.background_color || '#F5EFEB',
      'light' // Default to light mode for now until added to schema
    );

    // Apply all generated tokens
    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    if (data.border_radius) root.style.setProperty('--tenant-radius', data.border_radius);
    if (data.font_family) root.style.setProperty('--tenant-font', data.font_family);

    if (data.name) document.title = data.name;
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon && data.logo_url) {
      favicon.href = data.logo_url;
    }
  }

  useEffect(() => {
    loadTenantBranding();
  }, [restaurantId]);

  const refreshTheme = async () => {
    await loadTenantBranding();
  };

  const previewTheme = (data: Partial<Restaurant>) => {
    applyTheme(data);
  };

  return (
    <ThemeContext.Provider value={{ restaurant, loading, refreshTheme, previewTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
