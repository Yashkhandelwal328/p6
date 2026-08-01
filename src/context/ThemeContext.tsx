import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Restaurant } from '@/types';
import { generateThemeVariables } from '@/lib/theme-presets';

interface ThemeContextType {
  restaurant: Restaurant | null;
  loading: boolean;
  error: string | null;
  isCustomDomain: boolean;
  slug: string | null;
  refreshTheme: () => Promise<void>;
  previewTheme: (data: Partial<Restaurant>) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  restaurant: null,
  loading: true,
  error: null,
  isCustomDomain: false,
  slug: null,
  refreshTheme: async () => {},
  previewTheme: () => {}
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const location = useLocation();

  const loadTenant = async () => {
    setLoading(true);
    setError(null);
    try {
      const host = window.location.host;
      const path = location.pathname;

      let tenantSlug = null;
      let isCustom = false;

      const pathParts = path.split('/').filter(Boolean);
      
      const reservedPaths = [
        'login', 'register', 'forgot-password', 'pricing', 'features', 
        'about', 'contact', 'owner', 'sup', 'api', 'assets', 'settings', 'profile'
      ];

      const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
      const isMainDomain = host.includes('infinito.com') || host.includes('platform.com') || host.includes('yourdomain') || host.includes('vercel.app'); // Fallbacks
      
      // We assume if it's not the main app domain and not localhost, it's a custom domain
      // However, for local dev, we might be on localhost. So we check the path.
      if (!isLocalhost && !isMainDomain && host.split('.').length > 1) {
        // Simple custom domain heuristic: if it's not our main saas domain, it's custom.
        isCustom = true;
        setIsCustomDomain(true);
        // We'll leave custom domain fetching commented out until DB has custom_domain column
        // const { data } = await supabase.from('restaurants').select('*').eq('custom_domain', host).single();
      } else if (pathParts.length > 0 && !reservedPaths.includes(pathParts[0])) {
        tenantSlug = pathParts[0];
        setSlug(tenantSlug);
      }

      if (tenantSlug) {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('subdomain', tenantSlug)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          setError('not_found');
          setRestaurant(null);
        } else {
          setRestaurant(data as Restaurant);
          applyTheme(data);
        }
      } else {
        setRestaurant(null);
      }
    } catch (err: any) {
      console.error('Failed to load tenant:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenant();
  }, [location.pathname]);

  function applyTheme(data: Partial<Restaurant>) {
    const root = document.documentElement;
    const themeVars = generateThemeVariables(
      data.primary_color || '#2F4156',
      data.secondary_color || '#567C8D',
      data.accent_color || '#C8D9E6',
      data.background_color || '#F5EFEB',
      'light'
    );

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

  return (
    <ThemeContext.Provider value={{ 
      restaurant, 
      loading, 
      error, 
      isCustomDomain, 
      slug, 
      refreshTheme: loadTenant,
      previewTheme: applyTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
