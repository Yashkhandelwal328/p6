export interface ThemePreset {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  background_style: 'light' | 'dark';
  border_radius: string;
  font_family: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'modern-black',
    name: 'Modern Black',
    primary_color: '#111111',
    secondary_color: '#333333',
    accent_color: '#ffffff',
    background_color: '#000000',
    background_style: 'dark',
    border_radius: '1rem',
    font_family: 'Inter',
  },
  {
    id: 'elegant-gold',
    name: 'Elegant Gold',
    primary_color: '#c9a227',
    secondary_color: '#a1821f',
    accent_color: '#ffffff',
    background_color: '#1a1407',
    background_style: 'dark',
    border_radius: '0.5rem',
    font_family: 'Playfair Display',
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    primary_color: '#0077b6',
    secondary_color: '#0096c7',
    accent_color: '#48cae4',
    background_color: '#f8f9fa',
    background_style: 'light',
    border_radius: '0.75rem',
    font_family: 'Roboto',
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    primary_color: '#2d6a4f',
    secondary_color: '#40916c',
    accent_color: '#74c69d',
    background_color: '#f1f8f5',
    background_style: 'light',
    border_radius: '0rem',
    font_family: 'Lora',
  },
  {
    id: 'minimal-white',
    name: 'Minimal White',
    primary_color: '#000000',
    secondary_color: '#333333',
    accent_color: '#666666',
    background_color: '#ffffff',
    background_style: 'light',
    border_radius: '0.375rem',
    font_family: 'Inter',
  },
  {
    id: 'luxury-purple',
    name: 'Luxury Purple',
    primary_color: '#5a189a',
    secondary_color: '#7b2cbf',
    accent_color: '#9d4edd',
    background_color: '#0f0518',
    background_style: 'dark',
    border_radius: '1.5rem',
    font_family: 'Cinzel',
  },
  {
    id: 'warm-orange',
    name: 'Warm Orange',
    primary_color: '#e85d04',
    secondary_color: '#f48c06',
    accent_color: '#faa307',
    background_color: '#fff9f2',
    background_style: 'light',
    border_radius: '0.5rem',
    font_family: 'Outfit',
  },
  {
    id: 'coffee-brown',
    name: 'Coffee Brown',
    primary_color: '#4a3b32',
    secondary_color: '#735d4f',
    accent_color: '#bda591',
    background_color: '#1f1814',
    background_style: 'dark',
    border_radius: '0.25rem',
    font_family: 'Merriweather',
  }
];

export function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return '#FFFFFF';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#0F172A' : '#FFFFFF';
}

export function adjustColor(hexColor: string, percent: number): string {
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return hexColor;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const adjust = (val: number) => {
    const adjusted = Math.round(val * (1 + percent / 100));
    return Math.min(255, Math.max(0, adjusted)).toString(16).padStart(2, '0');
  };
  return `#${adjust(r)}${adjust(g)}${adjust(b)}`;
}

export function generateThemeVariables(
  primary: string,
  secondary: string,
  accent: string,
  background: string,
  style?: 'light' | 'dark' // Kept parameter to avoid breaking calls, but ignored
) {
  // Enforce strict readability rules by checking actual background luminance
  const hex = background.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) || 255;
  const g = parseInt(hex.substring(2, 4), 16) || 255;
  const b = parseInt(hex.substring(4, 6), 16) || 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // If luminance is low, the background is dark
  const isDark = luminance < 0.5;
  
  // High contrast text colors
  const textPrimary = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#E2E8F0' : '#334155';
  const textMuted = isDark ? '#94A3B8' : '#64748B';
  
  // Clean surfaces - do NOT tint with primary color
  const surface = isDark ? '#1E293B' : '#FFFFFF';
  const card = isDark ? '#0F172A' : '#FFFFFF';
  const border = isDark ? '#334155' : '#E2E8F0';
  
  // Button interactions
  const primaryHover = isDark ? adjustColor(primary, 15) : adjustColor(primary, -15);
  const primaryActive = isDark ? adjustColor(primary, -25) : adjustColor(primary, 10);
  const primaryForeground = getContrastColor(primary);

  return {
    '--tenant-primary': primary,
    '--tenant-primary-hover': primaryHover,
    '--tenant-primary-active': primaryActive,
    '--tenant-primary-foreground': primaryForeground,
    '--tenant-secondary': secondary,
    '--tenant-accent': accent,
    '--tenant-background': background,
    '--tenant-surface': surface,
    '--tenant-card': card,
    '--tenant-text-primary': textPrimary,
    '--tenant-text-secondary': textSecondary,
    '--tenant-text-muted': textMuted,
    '--tenant-border': border,
  };
}
