import { useEffect, useState, useRef } from 'react';
import { Settings, Save, Check, Upload, Hash, Palette, Power } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import type { Restaurant } from '@/types';
import { THEME_PRESETS } from '@/lib/theme-presets';
import { PublicRestaurantPage } from '@/pages/customer/PublicRestaurantPage';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

export function RestaurantSettings() {
  const { restaurantId } = useAuth();
  const { previewTheme, refreshTheme } = useTheme();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    currency: '₹',
    tax_percentage: 5,
    service_charge_percentage: 0,
    opening_time: '09:00',
    closing_time: '23:59',
    logo_url: '',
    theme_color: '#C9A227',
    min_delivery_amount: 200,
    max_delivery_radius_km: 5.0,
    restaurant_latitude: 19.0760,
    restaurant_longitude: 72.8777,
    is_active: true,
    payment_qr_url: '',
    primary_color: '#2F4156',
    secondary_color: '#567C8D',
    accent_color: '#C8D9E6',
    background_color: '#F5EFEB',
    subdomain: '',
    website_status: 'draft' as any,
    font_family: 'Inter',
    border_radius: '0.5rem',
  });

  useEffect(() => {
    if (restaurantId) loadData();
  }, [restaurantId]);

  useEffect(() => {
    if (!loading) {
      previewTheme({
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        accent_color: formData.accent_color,
        background_color: formData.background_color,
        border_radius: formData.border_radius,
        font_family: formData.font_family,
        name: formData.name,
        logo_url: formData.logo_url,
      });
    }
  }, [
    formData.primary_color,
    formData.secondary_color,
    formData.accent_color,
    formData.background_color,
    formData.border_radius,
    formData.font_family,
    formData.name,
    formData.logo_url,
    loading
  ]);

  async function loadData() {
    if (!restaurantId) return;
    const { data } = await supabase.from('restaurants').select('*').eq('id', restaurantId).maybeSingle();
    if (data) {
      setRestaurant(data);
      setFormData({
        name: data.name,
        tagline: data.tagline,
        description: data.description ?? '',
        address: data.address ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        currency: data.currency,
        tax_percentage: data.tax_percentage,
        service_charge_percentage: data.service_charge_percentage,
        opening_time: data.opening_time,
        closing_time: data.closing_time,
        logo_url: data.logo_url ?? '',
        theme_color: data.theme_color ?? '#C9A227',
        min_delivery_amount: data.min_delivery_amount ?? 200,
        max_delivery_radius_km: data.max_delivery_radius_km ?? 5.0,
        restaurant_latitude: data.restaurant_latitude ?? 19.0760,
        restaurant_longitude: data.restaurant_longitude ?? 72.8777,
        is_active: data.is_active ?? true,
        payment_qr_url: data.payment_qr_url ?? '',
        primary_color: data.primary_color ?? '#2F4156',
        secondary_color: data.secondary_color ?? '#567C8D',
        accent_color: data.accent_color ?? '#C8D9E6',
        background_color: data.background_color ?? '#F5EFEB',
        subdomain: data.subdomain ?? '',
        website_status: data.website_status ?? 'draft',
        font_family: data.font_family ?? 'Inter',
        border_radius: data.border_radius ?? '0.5rem',
      });
    }
    setLoading(false);
  }

  async function handleLogoUpload(file: File) {
    if (!restaurantId) return;
    setUploadingLogo(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${ext}`;
      const filePath = `${restaurantId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);

      if (urlData.publicUrl) {
        setFormData((prev) => ({ ...prev, logo_url: urlData.publicUrl }));
        await supabase.from('restaurants').update({ logo_url: urlData.publicUrl }).eq('id', restaurantId);
      }
    } catch (err) {
      alert(`Failed to upload logo: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleQrUpload(file: File) {
    if (!restaurantId) return;
    setUploadingQr(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `qr-${Date.now()}.${ext}`;
      const filePath = `${restaurantId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);

      if (urlData.publicUrl) {
        setFormData((prev) => ({ ...prev, payment_qr_url: urlData.publicUrl }));
        await supabase.from('restaurants').update({ payment_qr_url: urlData.publicUrl }).eq('id', restaurantId);
      }
    } catch (err) {
      alert(`Failed to upload QR code: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUploadingQr(false);
    }
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          restaurant_latitude: Number(position.coords.latitude.toFixed(8)),
          restaurant_longitude: Number(position.coords.longitude.toFixed(8)),
        }));
        setGettingLocation(false);
      },
      () => {
        alert('Unable to retrieve your location. Please ensure you have granted location permissions.');
        setGettingLocation(false);
      }
    );
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurantId) return;
    setSaving(true);
    await supabase.from('restaurants').update({
      name: formData.name,
      tagline: formData.tagline,
      description: formData.description,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      currency: formData.currency,
      tax_percentage: Number(formData.tax_percentage),
      service_charge_percentage: Number(formData.service_charge_percentage),
      opening_time: formData.opening_time,
      closing_time: formData.closing_time,
      logo_url: formData.logo_url || null,
      theme_color: formData.theme_color,
      min_delivery_amount: Number(formData.min_delivery_amount),
      max_delivery_radius_km: Number(formData.max_delivery_radius_km),
      restaurant_latitude: Number(formData.restaurant_latitude) || null,
      restaurant_longitude: Number(formData.restaurant_longitude) || null,
      is_active: formData.is_active,
      payment_qr_url: formData.payment_qr_url || null,
      primary_color: formData.primary_color,
      secondary_color: formData.secondary_color,
      accent_color: formData.accent_color,
      background_color: formData.background_color,
      subdomain: formData.subdomain,
      website_status: formData.website_status,
      font_family: formData.font_family,
      border_radius: formData.border_radius,
    }).eq('id', restaurantId);
    
    await refreshTheme();
    
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-2 border-nirvana-400/30 border-t-nirvana-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-gradient-gold mb-1 flex items-center gap-2">
            <Settings className="w-7 h-7" /> Restaurant Settings
          </h1>
          <p className="text-sm text-ink-400">Configure your restaurant details and preferences</p>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Restaurant ID Card */}
      <div className="card-luxury p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl glass-gold flex items-center justify-center">
            <Hash className="w-7 h-7 text-nirvana-400" />
          </div>
          <div>
            <p className="text-xs text-ink-400 mb-1">Restaurant ID</p>
            <p className="font-serif text-2xl text-gradient-gold">{restaurant?.restaurant_code ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Settings & Preview Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Left Column: Form Settings */}
        <div className="space-y-6">
          {/* Logo & Theme */}
          <div className="card-luxury p-6">
            <h3 className="font-serif text-lg text-theme-primary mb-4">Branding</h3>
            <div className="space-y-6">
              {/* Professional Presets */}
              <div>
                <label className="block text-sm text-theme-secondary mb-2">Professional Presets</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          primary_color: preset.primary_color,
                          secondary_color: preset.secondary_color,
                          accent_color: preset.accent_color,
                          background_color: preset.background_color,
                          font_family: preset.font_family,
                          border_radius: preset.border_radius,
                        }));
                      }}
                      className="px-3 py-2 text-xs rounded-xl border border-theme-border hover:border-primary transition-all text-left flex items-center justify-between"
                      style={{ backgroundColor: preset.background_color, color: preset.primary_color }}
                    >
                      <span className="font-medium truncate">{preset.name}</span>
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: preset.accent_color }} />
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Logo Upload */}
              <div>
            <label className="block text-sm text-ink-300 mb-2">Restaurant Logo</label>
            {formData.logo_url ? (
              <div className="relative rounded-xl overflow-hidden h-28 group">
                <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain bg-ink-900" />
                <div className="absolute inset-0 bg-ink-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-gold !py-1.5 !px-3 text-xs flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" /> Replace
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
                className="w-full h-28 rounded-xl border border-dashed border-nirvana-400/30 hover:border-nirvana-400/50 hover:bg-nirvana-400/5 transition-all flex flex-col items-center justify-center gap-2"
              >
                {uploadingLogo ? (
                  <div className="w-6 h-6 border-2 border-nirvana-400/30 border-t-nirvana-400 rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-nirvana-400" />
                    <span className="text-xs text-ink-400">Upload logo</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoUpload(file);
              }}
            />
          </div>

          {/* Theme Colors */}
          <div className="sm:col-span-2 space-y-4">
            <label className="block text-sm text-ink-300 mb-2 flex items-center gap-1">
              <Palette className="w-4 h-4" /> Branding Colors
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-ink-400 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={formData.primary_color} onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0" />
                  <input type="text" value={formData.primary_color} onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })} className="input-luxury w-full flex-1 text-sm py-1.5" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-ink-400 mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={formData.secondary_color} onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0" />
                  <input type="text" value={formData.secondary_color} onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })} className="input-luxury w-full flex-1 text-sm py-1.5" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-ink-400 mb-1">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={formData.accent_color} onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0" />
                  <input type="text" value={formData.accent_color} onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })} className="input-luxury w-full flex-1 text-sm py-1.5" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-ink-400 mb-1">Background</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={formData.background_color} onChange={(e) => setFormData({ ...formData, background_color: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0" />
                  <input type="text" value={formData.background_color} onChange={(e) => setFormData({ ...formData, background_color: e.target.value })} className="input-luxury w-full flex-1 text-sm py-1.5" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
               <div>
                  <label className="block text-sm text-ink-300 mb-1.5">Font Family</label>
                  <select value={formData.font_family} onChange={(e) => setFormData({ ...formData, font_family: e.target.value })} className="input-luxury w-full">
                    <option value="Inter">Inter (Modern Sans)</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Playfair Display">Playfair Display (Serif)</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm text-ink-300 mb-1.5">Border Radius</label>
                  <select value={formData.border_radius} onChange={(e) => setFormData({ ...formData, border_radius: e.target.value })} className="input-luxury w-full">
                    <option value="0rem">Square</option>
                    <option value="0.25rem">Slightly Rounded</option>
                    <option value="0.5rem">Rounded</option>
                    <option value="1rem">Extra Rounded</option>
                    <option value="9999px">Pill</option>
                  </select>
               </div>
            </div>
          </div>
        </div>
      </div>
      <form onSubmit={handleSave} className="card-luxury p-6 space-y-6">
        <div>
          <h3 className="font-serif text-lg text-nirvana-300 mb-4">General Information & Status</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 border-b border-white/5 pb-4">
            <div>
              <label className="block text-sm text-ink-300 mb-1.5 font-medium text-gold-400">Website Status</label>
              <select 
                value={formData.website_status || 'draft'} 
                onChange={(e) => setFormData({ ...formData, website_status: e.target.value as any })} 
                className="input-luxury w-full border-gold-500/50"
              >
                <option value="draft">Draft (Private, Coming Soon)</option>
                <option value="published">Published (Public)</option>
                <option value="maintenance">Maintenance Mode</option>
                <option value="suspended" disabled>Suspended (Contact Support)</option>
              </select>
              <p className="text-xs text-ink-500 mt-1">Controls if customers can view your website.</p>
            </div>
            <div>
              <label className="block text-sm text-ink-300 mb-1.5 font-medium text-gold-400">Public URL Slug</label>
              <div className="flex items-center">
                <span className="bg-ink-900 border border-white/10 border-r-0 rounded-l-lg px-3 py-2.5 text-sm text-ink-400">
                  {window.location.host}/
                </span>
                <input 
                  type="text" 
                  value={formData.subdomain || ''} 
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} 
                  className="input-luxury w-full rounded-l-none" 
                  placeholder="pizza-palace"
                />
              </div>
              <p className="text-xs text-ink-500 mt-1">Changing this will break old links!</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Restaurant Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-luxury w-full" />
            </div>
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Tagline</label>
              <input type="text" value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} className="input-luxury w-full" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm text-ink-300 mb-1.5">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="input-luxury w-full resize-none" />
          </div>
        </div>

        <div>
          <h3 className="font-serif text-lg text-nirvana-300 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-luxury w-full" />
            </div>
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-luxury w-full" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm text-ink-300 mb-1.5">Address</label>
            <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} className="input-luxury w-full resize-none" />
          </div>
        </div>

        <div>
          <h3 className="font-serif text-lg text-nirvana-300 mb-4">Billing & Tax</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Currency Symbol</label>
              <input type="text" maxLength={3} value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className="input-luxury w-full" />
            </div>
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Tax (%)</label>
              <input type="number" step="0.01" min="0" max="100" value={formData.tax_percentage} onChange={(e) => setFormData({ ...formData, tax_percentage: Number(e.target.value) })} className="input-luxury w-full" />
            </div>
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Service Charge (%)</label>
              <input type="number" step="0.01" min="0" max="100" value={formData.service_charge_percentage} onChange={(e) => setFormData({ ...formData, service_charge_percentage: Number(e.target.value) })} className="input-luxury w-full" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-lg text-nirvana-300 mb-4">Delivery Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Min Delivery Amount ({formData.currency})</label>
              <input type="number" step="1" min="0" value={formData.min_delivery_amount} onChange={(e) => setFormData({ ...formData, min_delivery_amount: Number(e.target.value) })} className="input-luxury w-full" />
            </div>
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Max Delivery Radius (km)</label>
              <input type="number" step="0.1" min="0" value={formData.max_delivery_radius_km} onChange={(e) => setFormData({ ...formData, max_delivery_radius_km: Number(e.target.value) })} className="input-luxury w-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Restaurant Latitude</label>
              <input type="number" step="any" value={formData.restaurant_latitude || ''} onChange={(e) => setFormData({ ...formData, restaurant_latitude: Number(e.target.value) })} className="input-luxury w-full" />
            </div>
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Restaurant Longitude</label>
              <input type="number" step="any" value={formData.restaurant_longitude || ''} onChange={(e) => setFormData({ ...formData, restaurant_longitude: Number(e.target.value) })} className="input-luxury w-full" />
            </div>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={gettingLocation}
              className="btn-outline-gold !py-2 !px-4 text-sm flex items-center gap-2"
            >
              {gettingLocation ? (
                <div className="w-4 h-4 border-2 border-nirvana-400/30 border-t-nirvana-400 rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              )}
              {gettingLocation ? 'Locating...' : 'Use My Current Location'}
            </button>
          </div>
        </div>



        <div>
          <h3 className="font-serif text-lg text-nirvana-300 mb-4">Payment Settings</h3>
          <div className="card-luxury p-6 border border-white/5 bg-ink-950/30">
            <label className="block text-sm text-ink-300 mb-2">Payment QR Code (for online payments)</label>
            <p className="text-xs text-ink-400 mb-4">Upload your UPI or Bank QR code so customers can pay online.</p>
            {formData.payment_qr_url ? (
              <div className="relative rounded-xl overflow-hidden h-40 w-40 group border border-white/10">
                <img src={formData.payment_qr_url} alt="Payment QR" className="w-full h-full object-contain bg-ink-900" />
                <div className="absolute inset-0 bg-ink-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button type="button" onClick={() => qrInputRef.current?.click()} className="btn-gold !py-1.5 !px-3 text-xs flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" /> Replace
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => qrInputRef.current?.click()}
                disabled={uploadingQr}
                className="w-40 h-40 rounded-xl border border-dashed border-nirvana-400/30 hover:border-nirvana-400/50 hover:bg-nirvana-400/5 transition-all flex flex-col items-center justify-center gap-2"
              >
                {uploadingQr ? (
                  <div className="w-6 h-6 border-2 border-nirvana-400/30 border-t-nirvana-400 rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-nirvana-400" />
                    <span className="text-xs text-ink-400">Upload QR</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={qrInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleQrUpload(file);
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-400 animate-fade-in">
              <Check className="w-4 h-4" /> Saved successfully
            </span>
          )}
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
      </div>

      {/* Right Column: Live Preview */}
      <div className="hidden xl:block h-[calc(100vh-100px)] sticky top-6">
        <div className="card-luxury h-full flex flex-col overflow-hidden">
          <div className="p-4 border-b border-theme-border flex justify-between items-center bg-surface z-10 relative">
            <h3 className="font-serif text-lg text-theme-primary">Live Website Preview</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setPreviewMode('mobile')} 
                className={`p-2 rounded-lg transition-colors ${previewMode === 'mobile' ? 'bg-primary text-primary-foreground' : 'hover:bg-surface text-theme-secondary'}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPreviewMode('tablet')} 
                className={`p-2 rounded-lg transition-colors ${previewMode === 'tablet' ? 'bg-primary text-primary-foreground' : 'hover:bg-surface text-theme-secondary'}`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPreviewMode('desktop')} 
                className={`p-2 rounded-lg transition-colors ${previewMode === 'desktop' ? 'bg-primary text-primary-foreground' : 'hover:bg-surface text-theme-secondary'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-ink-950/20 flex items-center justify-center p-4 overflow-hidden relative">
            <div 
              className={`bg-background border border-theme-border shadow-2xl rounded-2xl overflow-hidden transition-all duration-500 transform origin-top`}
              style={{ 
                width: previewMode === 'mobile' ? '375px' : previewMode === 'tablet' ? '768px' : '100%',
                height: previewMode === 'mobile' ? '812px' : previewMode === 'tablet' ? '1024px' : '100%',
                maxHeight: '100%',
                transform: previewMode === 'desktop' ? 'scale(0.8)' : previewMode === 'tablet' ? 'scale(0.6)' : 'scale(0.7)'
              }}
            >
              <div className="w-full h-full overflow-y-auto pointer-events-none scrollbar-luxury">
                <PublicRestaurantPage previewData={formData} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      </div>
    </div>
  );
}
