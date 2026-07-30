import { useNavigate } from 'react-router-dom';
import { Utensils, Store, ArrowRight, ShoppingBag, ChefHat, QrCode, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: ShoppingBag, title: 'Digital Menu', desc: 'QR-code ordering with live menu updates' },
    { icon: ChefHat, title: 'Kitchen Display', desc: 'Real-time order tickets for your kitchen staff' },
    { icon: QrCode, title: 'QR Code Generator', desc: 'Generate table-specific QR codes instantly' },
    { icon: BarChart3, title: 'Analytics & Reports', desc: 'Track revenue, bestsellers, and peak hours' },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nirvana-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-coffee-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white overflow-hidden shadow-gold">
            <img src="/logo.jpeg" alt="Red Chilli Logo" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <h1 className="font-serif text-xl text-gradient-gold leading-tight">Red Chilli</h1>
            <p className="text-xs text-ink-400">Restaurant SaaS Platform</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="btn-outline-gold !py-2.5 !px-5 text-sm flex items-center gap-2"
        >
          <Store className="w-4 h-4" /> Owner Login
        </button>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-gold mb-6 animate-fade-in-down">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-nirvana-300 font-medium">Complete Restaurant Management System</span>
        </div>

        <h2 className="font-serif text-4xl sm:text-6xl text-gradient-gold mb-4 animate-fade-in-up">
          Run Your Restaurant<br />Like Never Before
        </h2>
        <p className="text-ink-300 text-base sm:text-lg max-w-2xl mx-auto mb-10 animate-fade-in">
          From QR-code ordering to kitchen display, staff management, and real-time analytics —
          everything you need to manage your restaurant in one elegant platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <button
            onClick={() => navigate('/order')}
            className="btn-gold w-full sm:w-auto flex items-center justify-center gap-2 text-base !py-4 !px-8 bg-gradient-to-r from-orange-500 to-amber-500 border-none text-white hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]"
          >
            <Utensils className="w-5 h-5" /> Order Now
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="card-luxury p-5 text-center animate-fade-in-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-xl glass-gold flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-nirvana-400" />
                </div>
                <h3 className="font-serif text-base text-ink-100 mb-1">{f.title}</h3>
                <p className="text-xs text-ink-400">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>



      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 text-center">
        <p className="text-xs text-ink-500">Red Chilli Restaurant SaaS — Multi-tenant, secure, production-ready.</p>
      </footer>
    </div>
  );
}
