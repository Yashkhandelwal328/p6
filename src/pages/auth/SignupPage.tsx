import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Utensils, AlertCircle, Store, User, Phone, MapPin, FileText, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    gstNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create the auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.ownerName } },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Failed to create account.');

      const userId = authData.user.id;

      // 2. Generate prefix from restaurant name
      const prefix = formData.restaurantName
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 3)
        .padEnd(3, 'X');

      // 3. Call the SECURITY DEFINER function to create restaurant + staff + tables + categories
      const { error: rpcError } = await supabase.rpc('create_restaurant_account', {
        p_restaurant_name: formData.restaurantName,
        p_owner_name: formData.ownerName,
        p_owner_email: formData.email,
        p_user_id: userId,
        p_prefix: prefix,
        p_owner_phone: formData.phone || null,
        p_address: formData.address || null,
        p_gst_number: formData.gstNumber || null,
      });

      if (rpcError) throw rpcError;

      // 4. Sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      navigate('/owner/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const update = (key: string, value: string) => setFormData({ ...formData, [key]: value });

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nirvana-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-coffee-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-nirvana-300 transition-colors mb-6 animate-fade-in">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="text-center mb-8 animate-fade-in-down">
            <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden flex items-center justify-center shadow-gold mx-auto mb-4">
              <img src="/logo.jpeg" alt="The infinoto Cafe & Restaurant Logo" className="w-full h-full object-contain p-1" />
            </div>
          <h1 className="font-serif text-3xl text-gradient-gold mb-1">Register Your Restaurant</h1>
          <p className="text-sm text-ink-400">Get started in minutes — it's free to try</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-dark border border-nirvana-400/20 rounded-2xl p-6 sm:p-8 space-y-4 animate-fade-in-up">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-ink-300 mb-1.5">Restaurant Name *</label>
            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
              <input type="text" required value={formData.restaurantName} onChange={(e) => update('restaurantName', e.target.value)} placeholder="e.g. The infinoto Cafe & Restaurant" className="input-luxury w-full pl-12" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-ink-300 mb-1.5">Owner Name *</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
              <input type="text" required value={formData.ownerName} onChange={(e) => update('ownerName', e.target.value)} placeholder="e.g. The infinoto Cafe & Restaurant Owner" className="input-luxury w-full pl-12" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Email *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                <input type="email" required value={formData.email} onChange={(e) => update('email', e.target.value)} placeholder="owner@nirvana.com" className="input-luxury w-full pl-12" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Mobile Number *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                <input type="tel" required value={formData.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 98765 43210" className="input-luxury w-full pl-12" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                <input type={showPassword ? 'text' : 'password'} required minLength={8} value={formData.password} onChange={(e) => update('password', e.target.value)} placeholder="Min 8 characters" className="input-luxury w-full pl-12 pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-200 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                <input type={showPassword ? 'text' : 'password'} required minLength={8} value={formData.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Re-enter password" className="input-luxury w-full pl-12" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-ink-300 mb-1.5">Restaurant Address *</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-5 h-5 text-ink-400" />
              <textarea required value={formData.address} onChange={(e) => update('address', e.target.value)} placeholder="Full restaurant address" rows={2} className="input-luxury w-full pl-12 resize-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-ink-300 mb-1.5">GST Number <span className="text-ink-500">(Optional)</span></label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
              <input type="text" value={formData.gstNumber} onChange={(e) => update('gstNumber', e.target.value)} placeholder="e.g. 27ABCDE1234F1Z5" className="input-luxury w-full pl-12" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full !py-4 text-base">
            {loading ? 'Creating your restaurant...' : 'Create Restaurant Account'}
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-ink-500">
              Already have an account? <Link to="/login" className="text-nirvana-400 hover:text-nirvana-300 transition-colors">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
