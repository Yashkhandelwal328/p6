export interface ThemePreset {
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  font_family: string;
  button_style: 'rounded' | 'pill' | 'square';
  border_radius: string;
  dark_mode: boolean;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'Modern Black',
    primary_color: '#111111',
    secondary_color: '#333333',
    accent_color: '#ffffff',
    background_color: '#000000',
    font_family: 'Inter',
    button_style: 'pill',
    border_radius: '1rem',
    dark_mode: true,
  },
  {
    name: 'Elegant Gold',
    primary_color: '#c9a227',
    secondary_color: '#a1821f',
    accent_color: '#ffffff',
    background_color: '#1a1407',
    font_family: 'Playfair Display',
    button_style: 'rounded',
    border_radius: '0.5rem',
    dark_mode: true,
  },
  {
    name: 'Ocean Blue',
    primary_color: '#0077b6',
    secondary_color: '#0096c7',
    accent_color: '#48cae4',
    background_color: '#f8f9fa',
    font_family: 'Roboto',
    button_style: 'rounded',
    border_radius: '0.75rem',
    dark_mode: false,
  },
  {
    name: 'Forest Green',
    primary_color: '#2d6a4f',
    secondary_color: '#40916c',
    accent_color: '#74c69d',
    background_color: '#f1f8f5',
    font_family: 'Lora',
    button_style: 'square',
    border_radius: '0',
    dark_mode: false,
  },
  {
    name: 'Minimal White',
    primary_color: '#000000',
    secondary_color: '#333333',
    accent_color: '#666666',
    background_color: '#ffffff',
    font_family: 'Inter',
    button_style: 'rounded',
    border_radius: '0.375rem',
    dark_mode: false,
  },
  {
    name: 'Luxury Purple',
    primary_color: '#5a189a',
    secondary_color: '#7b2cbf',
    accent_color: '#9d4edd',
    background_color: '#0f0518',
    font_family: 'Cinzel',
    button_style: 'pill',
    border_radius: '1.5rem',
    dark_mode: true,
  },
  {
    name: 'Warm Orange',
    primary_color: '#e85d04',
    secondary_color: '#f48c06',
    accent_color: '#faa307',
    background_color: '#fff9f2',
    font_family: 'Outfit',
    button_style: 'rounded',
    border_radius: '0.5rem',
    dark_mode: false,
  },
  {
    name: 'Coffee Brown',
    primary_color: '#4a3b32',
    secondary_color: '#735d4f',
    accent_color: '#bda591',
    background_color: '#1f1814',
    font_family: 'Merriweather',
    button_style: 'rounded',
    border_radius: '0.25rem',
    dark_mode: true,
  },
];
