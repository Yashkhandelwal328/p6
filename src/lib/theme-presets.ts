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
    id: 'modern-minimal',
    name: 'Modern Minimal',
    primary_color: '#000000',
    secondary_color: '#F4F4F5',
    accent_color: '#3B82F6',
    background_color: '#F9FAFB',
    background_style: 'light',
    border_radius: '0.5rem',
    font_family: 'Inter',
  },
  {
    id: 'luxury-black-gold',
    name: 'Luxury Black & Gold',
    primary_color: '#D4AF37',
    secondary_color: '#1A1A1A',
    accent_color: '#F3E5AB',
    background_color: '#0A0A0A',
    background_style: 'dark',
    border_radius: '0rem',
    font_family: 'Playfair Display',
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    primary_color: '#0369A1',
    secondary_color: '#E0F2FE',
    accent_color: '#38BDF8',
    background_color: '#F0F9FF',
    background_style: 'light',
    border_radius: '1rem',
    font_family: 'Inter',
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    primary_color: '#15803D',
    secondary_color: '#DCFCE7',
    accent_color: '#4ADE80',
    background_color: '#F0FDF4',
    background_style: 'light',
    border_radius: '0.75rem',
    font_family: 'Inter',
  },
  {
    id: 'coffee-shop',
    name: 'Coffee Shop',
    primary_color: '#78350F',
    secondary_color: '#FEF3C7',
    accent_color: '#F59E0B',
    background_color: '#FFFBEB',
    background_style: 'light',
    border_radius: '0.375rem',
    font_family: 'Cormorant Garamond',
  },
  {
    id: 'japanese-minimal',
    name: 'Japanese Minimal',
    primary_color: '#DC2626',
    secondary_color: '#F5F5F5',
    accent_color: '#EF4444',
    background_color: '#FAFAFA',
    background_style: 'light',
    border_radius: '0rem',
    font_family: 'Inter',
  },
  {
    id: 'italian-restaurant',
    name: 'Italian Restaurant',
    primary_color: '#B91C1C',
    secondary_color: '#FCE7F3',
    accent_color: '#15803D',
    background_color: '#FDF2F8',
    background_style: 'light',
    border_radius: '0.5rem',
    font_family: 'Playfair Display',
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    primary_color: '#7E22CE',
    secondary_color: '#F3E8FF',
    accent_color: '#D8B4FE',
    background_color: '#FAF5FF',
    background_style: 'light',
    border_radius: '1rem',
    font_family: 'Inter',
  },
  {
    id: 'elegant-white',
    name: 'Elegant White',
    primary_color: '#171717',
    secondary_color: '#F5F5F5',
    accent_color: '#A3A3A3',
    background_color: '#FFFFFF',
    background_style: 'light',
    border_radius: '0rem',
    font_family: 'Playfair Display',
  },
  {
    id: 'dark-professional',
    name: 'Dark Professional',
    primary_color: '#3B82F6',
    secondary_color: '#1F2937',
    accent_color: '#60A5FA',
    background_color: '#111827',
    background_style: 'dark',
    border_radius: '0.5rem',
    font_family: 'Inter',
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
  style: 'light' | 'dark'
) {
  // Enforce strict readability rules based on the background style
  const isDark = style === 'dark';
  
  // High contrast text colors
  const textPrimary = isDark ? '#FFFFFF' : '#0F172A';
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
