import { useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Store, User, Mail, Lock, Phone, MapPin, 
  ChevronRight, ChevronLeft, Upload, Check, 
  Palette, Clock, Globe, Plus, Trash2, Layout,
  Coffee, Utensils
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { THEME_PRESETS, type ThemePreset } from '@/lib/theme-presets';

interface Category {
  id: string;
  name: string;
  sort_order: number;
}

interface MenuItem {
  id: string;
  category_name: string;
  name: string;
  description: string;
  price: number;
  is_veg: boolean;
  preparation_time: number;
  image_url: string | null;
  image_file?: File;
}

export function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth User ID (created in Step 1)
  const [userId, setUserId] = useState<string | null>(null);

  // Form Data State
  const [formData, setFormData] = useState({
    // Step 1: Account
    ownerName: '',
    email: '',
    password: '',
    phone: '',

    // Step 2: Restaurant Info
    restaurantName: '',
    tagline: '',
    cuisineType: '',
    description: '',
    address: '',
    contactNumber: '',
    supportEmail: '',
    instagram: '',
    facebook: '',
    website: '',

    // Files (not submitted directly in json)
    logoFile: null as File | null,
    bannerFile: null as File | null,
    logoUrl: '',
    bannerUrl: '',

    // Step 3: Business Details
    openingTime: '09:00',
    closingTime: '23:00',
    deliveryAvailable: true,
    dineInAvailable: true,
    takeawayAvailable: true,
    deliveryRadius: 5.0,
    preparationTime: 15,
    currency: '₹',
    taxPercentage: 5,

    // Step 4: Website Theme
    primaryColor: THEME_PRESETS[0].primary_color,
    secondaryColor: THEME_PRESETS[0].secondary_color,
    accentColor: THEME_PRESETS[0].accent_color,
    backgroundColor: THEME_PRESETS[0].background_color,
    fontFamily: THEME_PRESETS[0].font_family,
    borderRadius: THEME_PRESETS[0].border_radius,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Helpers
  const update = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const applyPreset = (preset: ThemePreset) => {
    setFormData(prev => ({
      ...prev,
      primaryColor: preset.primary_color,
      secondaryColor: preset.secondary_color,
      accentColor: preset.accent_color,
      backgroundColor: preset.background_color,
      fontFamily: preset.font_family,
      borderRadius: preset.border_radius,
    }));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('menu-images').upload(fileName, file);
    if (error) throw error;
    const { data: publicData } = supabase.storage.from('menu-images').getPublicUrl(fileName);
    return publicData.publicUrl;
  };

  // Step 1: Create Auth User
  const handleStep1 = async () => {
    setError(null);
    if (!formData.ownerName || !formData.email || !formData.password || !formData.phone) {
      setError('Please fill in all account fields');
      return;
    }
    setLoading(true);
    try {
      if (!userId) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { full_name: formData.ownerName } }
        });
        if (signUpError) throw signUpError;
        if (!data.user) throw new Error('Failed to create account');
        setUserId(data.user.id);
      }
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  // Step Validation Handlers
  const handleStep2 = () => {
    if (!formData.restaurantName || !formData.cuisineType || !formData.address || !formData.description) {
      setError('Please fill in all required restaurant information');
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleStep3 = () => {
    setError(null);
    setStep(4);
  };

  const handleStep4 = () => {
    setError(null);
    setStep(5);
  };

  const handleStep5 = () => {
    if (categories.length < 3) {
      setError('Please add at least 3 menu categories');
      return;
    }
    if (menuItems.length < 3) {
      setError('Please add at least 3 menu items');
      return;
    }
    setError(null);
    setStep(6);
  };

  // Final Submit
  const handleFinalSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Upload Images
      let logoUrl = '';
      let bannerUrl = '';
      if (formData.logoFile) logoUrl = await uploadImage(formData.logoFile);
      if (formData.bannerFile) bannerUrl = await uploadImage(formData.bannerFile);

      // Upload Menu Item Images
      const itemsWithUrls = await Promise.all(menuItems.map(async (item) => {
        let url = item.image_url;
        if (item.image_file) {
          url = await uploadImage(item.image_file);
        }
        return { ...item, image_url: url };
      }));

      // 2. Prepare Payload
      const plan = new URLSearchParams(location.search).get('plan') || 'starter';
      const payload = {
        user_id: userId,
        plan,
        restaurant_name: formData.restaurantName,
        owner_name: formData.ownerName,
        owner_email: formData.email,
        phone: formData.phone,
        tagline: formData.tagline,
        cuisine_type: formData.cuisineType,
        description: formData.description,
        address: formData.address,
        contact_number: formData.contactNumber || formData.phone,
        support_email: formData.supportEmail || formData.email,
        logo_url: logoUrl,
        banner_url: bannerUrl,
        social_links: {
          instagram: formData.instagram,
          facebook: formData.facebook,
          website: formData.website
        },
        opening_time: formData.openingTime,
        closing_time: formData.closingTime,
        delivery_available: formData.deliveryAvailable,
        dine_in_available: formData.dineInAvailable,
        takeaway_available: formData.takeawayAvailable,
        delivery_radius: formData.deliveryRadius,
        preparation_time: formData.preparationTime,
        currency: formData.currency,
        tax_percentage: formData.taxPercentage,
        primary_color: formData.primaryColor,
        secondary_color: formData.secondaryColor,
        accent_color: formData.accentColor,
        background_color: formData.backgroundColor,
        font_family: formData.fontFamily,
        border_radius: formData.borderRadius,
        categories: categories.map(c => ({ name: c.name, sort_order: c.sort_order })),
        menu_items: itemsWithUrls.map(i => ({
          name: i.name,
          category_name: i.category_name,
          description: i.description,
          price: i.price,
          is_veg: i.is_veg,
          preparation_time: i.preparation_time,
          image_url: i.image_url
        }))
      };

      // 3. Call RPC
      const { data, error: rpcError } = await supabase.rpc('create_restaurant_wizard', { p_payload: payload });
      if (rpcError) throw rpcError;

      // Success! Sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      if (signInError) throw signInError;

      navigate('/owner');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create restaurant platform. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <header className="bg-surface shadow-sm border-b border-theme-border p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-theme-primary font-bold font-serif text-xl">
            <Layout className="w-6 h-6" /> Platform Setup
          </Link>
          <div className="text-theme-secondary text-sm flex items-center gap-2">
            Step {step} of 6
          </div>
        </div>
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mt-4 h-2 bg-secondary/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-shake">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">!</span>
            </div>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="card-luxury p-6 sm:p-8 relative overflow-hidden">
          {/* Step 1: Account */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-serif text-theme-primary font-bold mb-2">Create your account</h2>
                <p className="text-theme-secondary">Let's start by securing your owner credentials.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-theme-primary mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-secondary" />
                    <input type="text" value={formData.ownerName} onChange={e => update('ownerName', e.target.value)} className="input-luxury w-full pl-12" placeholder="John Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-theme-primary mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-secondary" />
                    <input type="email" value={formData.email} onChange={e => update('email', e.target.value)} className="input-luxury w-full pl-12" placeholder="owner@restaurant.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-theme-primary mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-secondary" />
                    <input type="password" value={formData.password} onChange={e => update('password', e.target.value)} className="input-luxury w-full pl-12" placeholder="••••••••" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-theme-primary mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-secondary" />
                    <input type="tel" value={formData.phone} onChange={e => update('phone', e.target.value)} className="input-luxury w-full pl-12" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button onClick={handleStep1} disabled={loading} className="btn-primary flex items-center gap-2">
                  {loading ? 'Processing...' : 'Continue'} <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Restaurant Info */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in-right">
              <div>
                <h2 className="text-2xl font-serif text-theme-primary font-bold mb-2">Restaurant Identity</h2>
                <p className="text-theme-secondary">Tell us about your restaurant to personalize your website.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-theme-primary mb-2">Restaurant Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-secondary" />
                    <input type="text" value={formData.restaurantName} onChange={e => update('restaurantName', e.target.value)} className="input-luxury w-full pl-12" placeholder="e.g. Luigi's Trattoria" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-theme-primary mb-2">Tagline</label>
                  <input type="text" value={formData.tagline} onChange={e => update('tagline', e.target.value)} className="input-luxury w-full" placeholder="e.g. Authentic Italian Dining" />
                </div>
                <div>
                  <label className="block text-sm text-theme-primary mb-2">Cuisine Type <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.cuisineType} onChange={e => update('cuisineType', e.target.value)} className="input-luxury w-full" placeholder="e.g. Italian, Mexican, Fusion" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-theme-primary mb-2">Description <span className="text-red-500">*</span></label>
                  <textarea value={formData.description} onChange={e => update('description', e.target.value)} className="input-luxury w-full" rows={3} placeholder="Tell your customers about your restaurant's story..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-theme-primary mb-2">Complete Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3 w-5 h-5 text-theme-secondary" />
                    <textarea value={formData.address} onChange={e => update('address', e.target.value)} className="input-luxury w-full pl-12" rows={2} placeholder="123 Food Street, Culinary District..." />
                  </div>
                </div>
                
                {/* Images */}
                <div className="card-luxury p-4 border border-theme-border">
                  <label className="block text-sm text-theme-primary mb-2 font-medium">Restaurant Logo</label>
                  <input type="file" accept="image/*" onChange={e => e.target.files && update('logoFile', e.target.files[0])} className="text-sm text-theme-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 w-full" />
                </div>
                <div className="card-luxury p-4 border border-theme-border">
                  <label className="block text-sm text-theme-primary mb-2 font-medium">Hero Banner Image</label>
                  <input type="file" accept="image/*" onChange={e => e.target.files && update('bannerFile', e.target.files[0])} className="text-sm text-theme-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 w-full" />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="btn-outline-primary flex items-center gap-2"><ChevronLeft className="w-5 h-5" /> Back</button>
                <button onClick={handleStep2} className="btn-primary flex items-center gap-2">Continue <ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
          )}

          {/* Step 3: Business Details */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in-right">
              <div>
                <h2 className="text-2xl font-serif text-theme-primary font-bold mb-2">Business Settings</h2>
                <p className="text-theme-secondary">Configure how your operations will work.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-theme-primary border-b border-theme-border pb-2">Operating Hours</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-theme-primary mb-2">Opening Time</label>
                      <input type="time" value={formData.openingTime} onChange={e => update('openingTime', e.target.value)} className="input-luxury w-full" />
                    </div>
                    <div>
                      <label className="block text-sm text-theme-primary mb-2">Closing Time</label>
                      <input type="time" value={formData.closingTime} onChange={e => update('closingTime', e.target.value)} className="input-luxury w-full" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-theme-primary border-b border-theme-border pb-2">Services Offered</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-theme-border bg-secondary/5 cursor-pointer hover:bg-secondary/10 transition-colors">
                      <input type="checkbox" checked={formData.dineInAvailable} onChange={e => update('dineInAvailable', e.target.checked)} className="form-checkbox rounded text-primary bg-background border-theme-border focus:ring-primary/50 h-5 w-5" />
                      <span className="text-theme-primary text-sm">Dine-In Available (QR Menu)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-theme-border bg-secondary/5 cursor-pointer hover:bg-secondary/10 transition-colors">
                      <input type="checkbox" checked={formData.takeawayAvailable} onChange={e => update('takeawayAvailable', e.target.checked)} className="form-checkbox rounded text-primary bg-background border-theme-border focus:ring-primary/50 h-5 w-5" />
                      <span className="text-theme-primary text-sm">Takeaway Available</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-theme-border bg-secondary/5 cursor-pointer hover:bg-secondary/10 transition-colors">
                      <input type="checkbox" checked={formData.deliveryAvailable} onChange={e => update('deliveryAvailable', e.target.checked)} className="form-checkbox rounded text-primary bg-background border-theme-border focus:ring-primary/50 h-5 w-5" />
                      <span className="text-theme-primary text-sm">Delivery Available</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium text-theme-primary border-b border-theme-border pb-2">Additional Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-theme-primary mb-2">Delivery Radius (km)</label>
                      <input type="number" step="0.5" value={formData.deliveryRadius} onChange={e => update('deliveryRadius', parseFloat(e.target.value))} className="input-luxury w-full" />
                    </div>
                    <div>
                      <label className="block text-sm text-theme-primary mb-2">Avg. Prep Time (mins)</label>
                      <input type="number" value={formData.preparationTime} onChange={e => update('preparationTime', parseInt(e.target.value))} className="input-luxury w-full" />
                    </div>
                    <div>
                      <label className="block text-sm text-theme-primary mb-2">Tax Percentage (%)</label>
                      <input type="number" step="0.1" value={formData.taxPercentage} onChange={e => update('taxPercentage', parseFloat(e.target.value))} className="input-luxury w-full" />
                    </div>
                  </div>
                </div>

              </div>
              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(2)} className="btn-outline-primary flex items-center gap-2"><ChevronLeft className="w-5 h-5" /> Back</button>
                <button onClick={handleStep3} className="btn-primary flex items-center gap-2">Continue <ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
          )}

          {/* Step 4: Website Theme */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in-right">
              <div>
                <h2 className="text-2xl font-serif text-theme-primary font-bold mb-2">Website Theme</h2>
                <p className="text-theme-secondary">Choose a professional preset or customize everything to match your brand.</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-theme-primary mb-3 uppercase tracking-wider">Designer Presets</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className={`relative p-4 rounded-xl border flex flex-col gap-3 items-start transition-all ${
                        formData.primaryColor === preset.primary_color && formData.backgroundColor === preset.background_color
                          ? 'border-primary bg-primary/10'
                          : 'border-theme-border hover:border-theme-primary bg-secondary/5'
                      }`}
                    >
                      <div className="flex gap-1 w-full h-8 rounded-md overflow-hidden">
                        <div className="flex-1" style={{ backgroundColor: preset.primary_color }} />
                        <div className="flex-1" style={{ backgroundColor: preset.background_color }} />
                        <div className="flex-1" style={{ backgroundColor: preset.accent_color }} />
                      </div>
                      <span className="text-sm font-medium text-theme-primary">{preset.name}</span>
                      {formData.primaryColor === preset.primary_color && formData.backgroundColor === preset.background_color && (
                        <div className="absolute top-2 right-2 text-primary">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-theme-border" style={{ backgroundColor: formData.backgroundColor }}>
                <h3 className="text-lg font-medium mb-4" style={{ color: formData.primaryColor, fontFamily: formData.fontFamily }}>Theme Preview</h3>
                <div className="flex gap-4 items-center">
                  <button 
                    style={{ 
                      backgroundColor: formData.primaryColor, 
                      color: '#fff',
                      fontFamily: formData.fontFamily,
                      borderRadius: formData.borderRadius
                    }} 
                    className="px-6 py-2.5 font-medium shadow-lg"
                  >
                    Primary Button
                  </button>
                  <div className="flex gap-2">
                    <span className="w-8 h-8 rounded-full" style={{ backgroundColor: formData.primaryColor }} />
                    <span className="w-8 h-8 rounded-full" style={{ backgroundColor: formData.secondaryColor }} />
                    <span className="w-8 h-8 rounded-full" style={{ backgroundColor: formData.accentColor }} />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(3)} className="btn-outline-primary flex items-center gap-2"><ChevronLeft className="w-5 h-5" /> Back</button>
                <button onClick={handleStep4} className="btn-primary flex items-center gap-2">Continue <ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
          )}

          {/* Step 5: Menu Setup */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in-right">
              <div>
                <h2 className="text-2xl font-serif text-theme-primary font-bold mb-2">Menu Setup</h2>
                <p className="text-theme-secondary">Add at least 3 categories and 3 menu items to get started.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Categories */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-theme-primary">Categories ({categories.length}/3)</h3>
                  </div>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-theme-border">
                        <span className="text-sm text-theme-primary">{cat.name}</span>
                        <button onClick={() => setCategories(categories.filter(c => c.id !== cat.id))} className="text-red-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const input = (e.target as any).categoryName;
                    if (input.value.trim()) {
                      setCategories([...categories, { id: Date.now().toString(), name: input.value.trim(), sort_order: categories.length + 1 }]);
                      input.value = '';
                    }
                  }} className="flex gap-2">
                    <input name="categoryName" type="text" placeholder="e.g. Starters" className="input-luxury flex-1 text-sm" />
                    <button type="submit" className="btn-primary !px-3 !py-2"><Plus className="w-4 h-4" /></button>
                  </form>
                </div>

                {/* Menu Items */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-theme-primary">Menu Items ({menuItems.length}/3)</h3>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-luxury pr-2">
                    {menuItems.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-secondary/10 border border-theme-border">
                        <div className="w-16 h-16 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.image_file ? (
                            <img src={URL.createObjectURL(item.image_file)} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            <Coffee className="w-6 h-6 text-theme-secondary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-theme-primary truncate">{item.name}</h4>
                            <button onClick={() => setMenuItems(menuItems.filter(i => i.id !== item.id))} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                          <p className="text-xs text-theme-secondary">{item.category_name} • {item.is_veg ? 'Veg' : 'Non-Veg'}</p>
                          <p className="text-sm font-semibold text-primary mt-1">{formData.currency}{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as any;
                    if (!form.cat.value || !form.name.value || !form.price.value) return;
                    setMenuItems([...menuItems, {
                      id: Date.now().toString(),
                      category_name: form.cat.value,
                      name: form.name.value,
                      description: form.desc.value,
                      price: parseFloat(form.price.value),
                      is_veg: form.is_veg.checked,
                      preparation_time: parseInt(form.prep.value) || 15,
                      image_url: null,
                      image_file: form.image.files[0]
                    }]);
                    form.reset();
                  }} className="card-luxury p-4 border border-theme-border space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <select name="cat" required className="input-luxury w-full text-sm">
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                      <input name="name" required type="text" placeholder="Item Name" className="input-luxury w-full text-sm" />
                      <input name="price" required type="number" step="0.01" placeholder="Price" className="input-luxury w-full text-sm" />
                      <input name="prep" type="number" placeholder="Prep Mins" className="input-luxury w-full text-sm" />
                      <div className="col-span-2">
                        <input name="desc" type="text" placeholder="Description" className="input-luxury w-full text-sm" />
                      </div>
                      <div className="col-span-2 flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input name="is_veg" type="checkbox" className="form-checkbox text-green-500 rounded bg-background border-theme-border" />
                          <span className="text-sm text-theme-primary">Is Vegetarian</span>
                        </label>
                        <input name="image" type="file" accept="image/*" className="text-xs text-theme-secondary file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-primary file:text-primary-foreground" />
                      </div>
                    </div>
                    <button type="submit" className="w-full btn-outline-primary !py-2 text-sm flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Item</button>
                  </form>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-theme-border">
                <button onClick={() => setStep(4)} className="btn-outline-primary flex items-center gap-2"><ChevronLeft className="w-5 h-5" /> Back</button>
                <button onClick={handleStep5} className="btn-primary flex items-center gap-2">Continue <ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <div className="space-y-6 animate-fade-in-right">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-serif text-theme-primary font-bold mb-2">Ready to Launch</h2>
                <p className="text-theme-secondary max-w-md mx-auto">Your SaaS platform instance is completely configured and ready to go live.</p>
              </div>

              <div className="card-luxury p-6 border border-theme-border" style={{ backgroundColor: formData.backgroundColor }}>
                <div className="text-center mb-6">
                  <h3 className="text-2xl mb-1" style={{ color: formData.primaryColor, fontFamily: formData.fontFamily }}>{formData.restaurantName}</h3>
                  <p className="text-sm opacity-80" style={{ color: formData.secondaryColor }}>{formData.tagline}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="p-4 rounded-xl border border-theme-border text-center bg-secondary/5">
                    <p className="text-xs uppercase tracking-wider mb-1 opacity-70" style={{ color: formData.primaryColor }}>Categories</p>
                    <p className="text-xl font-bold" style={{ color: formData.primaryColor }}>{categories.length}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-theme-border text-center bg-secondary/5">
                    <p className="text-xs uppercase tracking-wider mb-1 opacity-70" style={{ color: formData.primaryColor }}>Menu Items</p>
                    <p className="text-xl font-bold" style={{ color: formData.primaryColor }}>{menuItems.length}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-theme-border">
                <button onClick={() => setStep(5)} disabled={loading} className="btn-outline-primary flex items-center gap-2"><ChevronLeft className="w-5 h-5" /> Edit Menu</button>
                <button onClick={handleFinalSubmit} disabled={loading} className="btn-primary shadow-lg flex items-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Launching...
                    </>
                  ) : (
                    <>Launch Restaurant <Globe className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
