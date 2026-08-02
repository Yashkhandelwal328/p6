import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Clock, CheckCircle2, Phone, Mail, FileText, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function WaitingPage() {
  const { staff } = useAuth();
  const { restaurant } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff || !restaurant) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const form = e.target as HTMLFormElement;
      
      const { error: submitError } = await supabase.from('subscription_leads').insert({
        owner_name: staff.name,
        restaurant_name: restaurant.name,
        phone_number: (form.elements.namedItem('phone') as HTMLInputElement).value,
        email: staff.email || '',
        preferred_call_time: (form.elements.namedItem('time') as HTMLSelectElement).value,
        notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value
      });

      if (submitError) throw submitError;
      setSubmitted(true);
      form.reset();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit callback request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 py-12 animate-fade-in">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-start">
        
        {/* Status Section */}
        <div className="card-luxury p-8 border-nirvana-400/30">
          <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center mb-6 shadow-gold">
            <Clock className="w-8 h-8 text-ink-950" />
          </div>
          
          <h1 className="font-serif text-3xl text-gradient-gold mb-4">
            🎉 Thank you for registering!
          </h1>
          
          <div className="space-y-4 text-ink-300 font-sans leading-relaxed mb-8">
            <p>Your restaurant has been successfully created.</p>
            <p>
              Your selected premium plan is currently <strong className="text-nirvana-300">awaiting approval</strong> from our team.
              We will contact you shortly to complete your subscription and activate your restaurant.
            </p>
            <p className="text-sm text-ink-400 p-4 bg-ink-900/50 rounded-lg border border-ink-800">
              Until then, your dashboard and customer website remain locked.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-serif text-lg text-nirvana-100 mb-4 border-b border-white/10 pb-2">Business Details</h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-ink-400">Restaurant Name</span>
              <span className="text-ink-100 font-medium">{restaurant?.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-ink-400">Owner Name</span>
              <span className="text-ink-100 font-medium">{staff?.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-ink-400">Email Address</span>
              <span className="text-ink-100 font-medium">{staff?.email}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-ink-400">Business Phone</span>
              <span className="text-ink-100 font-medium">{restaurant?.phone || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-3 border-t border-white/5">
              <span className="text-ink-400">Expected Response</span>
              <span className="text-nirvana-300 font-medium">Within 24 Hours</span>
            </div>
          </div>
        </div>

        {/* Callback Form Section */}
        <div className="card-luxury p-8">
          <h2 className="font-serif text-2xl text-nirvana-100 mb-2">Request a Callback</h2>
          <p className="text-ink-400 text-sm mb-6">Need immediate assistance? Let us know the best time to reach you.</p>

          {submitted ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center animate-fade-in-up">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-serif text-green-400 mb-2">Request Received</h3>
              <p className="text-sm text-green-400/80">Our team will call you at your preferred time.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-ink-300 mb-1.5">Direct Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    defaultValue={restaurant?.phone || ''}
                    placeholder="+91 9876543210"
                    className="w-full pl-10 pr-4 py-2.5 bg-ink-900 border border-ink-700 rounded-xl text-ink-100 focus:border-nirvana-400/50 focus:ring-1 focus:ring-nirvana-400/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-300 mb-1.5">Preferred Call Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
                  <select
                    name="time"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-ink-900 border border-ink-700 rounded-xl text-ink-100 focus:border-nirvana-400/50 focus:ring-1 focus:ring-nirvana-400/50 transition-colors appearance-none"
                  >
                    <option value="Anytime">Anytime</option>
                    <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                    <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-300 mb-1.5">Additional Notes (Optional)</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-ink-500" />
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Any specific requirements or questions?"
                    className="w-full pl-10 pr-4 py-2.5 bg-ink-900 border border-ink-700 rounded-xl text-ink-100 focus:border-nirvana-400/50 focus:ring-1 focus:ring-nirvana-400/50 transition-colors resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gold !py-3 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Request
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
            <h4 className="text-sm font-medium text-ink-300 mb-2">Direct Contact</h4>
            <a href="mailto:support@gourmetsaas.com" className="flex items-center gap-2 text-sm text-ink-400 hover:text-nirvana-300 transition-colors">
              <Mail className="w-4 h-4" /> support@gourmetsaas.com
            </a>
            <a href="tel:+919876543210" className="flex items-center gap-2 text-sm text-ink-400 hover:text-nirvana-300 transition-colors">
              <Phone className="w-4 h-4" /> +91 98765 43210
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
