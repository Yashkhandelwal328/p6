import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Utensils, AlertCircle, Store, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (rememberMe) {
      localStorage.setItem('rememberEmail', email);
    } else {
      localStorage.removeItem('rememberEmail');
    }

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError);
      setLoading(false);
    } else {
      navigate('/owner/dashboard');
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (resetError) throw resetError;
      setForgotSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }

  // Load remembered email
  if (!email && typeof window !== 'undefined') {
    const saved = localStorage.getItem('rememberEmail');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nirvana-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-coffee-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to home */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-nirvana-300 transition-colors mb-6 animate-fade-in">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="text-center mb-8 animate-fade-in-down">

          <h1 className="font-serif text-3xl text-gradient-gold mb-1">Restaurant Owner</h1>
          <p className="text-sm text-ink-400">Sign in to your dashboard</p>
        </div>

        {forgotMode ? (
          <div className="glass-dark border border-nirvana-400/20 rounded-2xl p-8 space-y-5 animate-fade-in-up">
            {forgotSent ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-green-400" />
                </div>
                <h2 className="font-serif text-xl text-ink-100">Check Your Email</h2>
                <p className="text-sm text-ink-400">We've sent a password reset link to {forgotEmail}</p>
                <button onClick={() => { setForgotMode(false); setForgotSent(false); }} className="btn-outline-gold w-full">
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <h2 className="font-serif text-xl text-ink-100 mb-1">Forgot Password</h2>
                  <p className="text-sm text-ink-400">Enter your email to receive a reset link</p>
                </div>
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm text-ink-300 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                    <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="owner@nirvana.com" className="input-luxury w-full pl-12" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-gold w-full">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button type="button" onClick={() => setForgotMode(false)} className="text-sm text-nirvana-400 hover:text-nirvana-300 transition-colors w-full text-center">
                  Back to Login
                </button>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-dark border border-nirvana-400/20 rounded-2xl p-8 space-y-5 animate-fade-in-up">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@nirvana.com" className="input-luxury w-full pl-12" autoComplete="email" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="input-luxury w-full pl-12 pr-12" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-200 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-ink-300 cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="accent-nirvana-400 w-4 h-4 rounded" />
                Remember Me
              </label>
              <button type="button" onClick={() => setForgotMode(true)} className="text-sm text-nirvana-400 hover:text-nirvana-300 transition-colors">
                Forgot Password?
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full">
              {loading ? 'Signing in...' : 'Login to Dashboard'}
            </button>

            <div className="text-center pt-2 space-y-1">
              <p className="text-xs text-ink-500">
                Demo: owner@nirvana.com / Nirvana@123
              </p>
              <p className="text-xs text-ink-500">
                New restaurant? <Link to="/register" className="text-nirvana-400 hover:text-nirvana-300 transition-colors">Register here</Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
