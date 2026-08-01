import { useNavigate } from 'react-router-dom';
import { Utensils, Store, ArrowRight, ShoppingBag, ChefHat, QrCode, BarChart3, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: ShoppingBag, title: 'Digital Menu & Ordering', desc: 'QR-code ordering with live menu updates and payments.' },
    { icon: ChefHat, title: 'Kitchen & Waiter Displays', desc: 'Real-time order tickets for your kitchen and floor staff.' },
    { icon: QrCode, title: 'Instant Website', desc: 'Get a fully branded, customizable website instantly.' },
    { icon: BarChart3, title: 'Advanced Analytics', desc: 'Track revenue, bestsellers, and peak hours effortlessly.' },
  ];

  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/mo',
      features: ['Basic Dashboard', '50 Menu Items', 'QR Menu', 'Delivery Orders'],
      buttonText: 'Start Free Trial',
      highlight: false
    },
    {
      name: 'Pro',
      price: '$79',
      period: '/mo',
      features: ['Unlimited Menu', 'Coupons & Analytics', 'Staff Accounts', 'Custom Theme', 'Custom Domain'],
      buttonText: 'Get Pro',
      highlight: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: ['Multi Branch', 'API Access', 'Priority Support', 'Advanced Analytics'],
      buttonText: 'Contact Sales',
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-background text-primary font-sans relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-surface">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl leading-tight">GourmetSaaS</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="text-secondary hover:text-primary font-medium transition-colors">
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="btn-primary py-2.5 px-5 text-sm"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/30 text-primary mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-semibold">The All-in-One Restaurant Platform</span>
        </div>

        <h2 className="text-5xl sm:text-7xl font-bold mb-6 tracking-tight text-primary">
          Launch your restaurant<br />
          <span className="text-secondary">in minutes.</span>
        </h2>
        <p className="text-lg sm:text-xl text-primary/70 max-w-2xl mx-auto mb-10">
          Everything you need to run your restaurant, cafe, or cloud kitchen. Sign up, customize your brand, and start accepting orders instantly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/register')}
            className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
          >
            Start Your Free Trial <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-surface py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Everything you need to succeed</h2>
            <p className="text-primary/70 max-w-2xl mx-auto">Our platform handles the technical heavy lifting so you can focus on making great food.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="p-6 rounded-2xl bg-background border border-accent/30 hover:border-secondary/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-primary">{f.title}</h3>
                  <p className="text-sm text-primary/70">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-primary mb-4">Simple, transparent pricing</h2>
          <p className="text-primary/70 max-w-2xl mx-auto">Choose the perfect plan for your restaurant's needs.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className={`p-8 rounded-3xl ${plan.highlight ? 'bg-primary text-surface shadow-2xl scale-105' : 'bg-surface text-primary border border-accent/50'}`}>
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className={plan.highlight ? 'text-surface/70' : 'text-primary/60'}>{plan.period}</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map(feat => (
                  <li key={feat} className="flex items-center gap-3">
                    <CheckCircle2 className={`w-5 h-5 ${plan.highlight ? 'text-accent' : 'text-secondary'}`} />
                    <span className="text-sm font-medium">{feat}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/register')}
                className={`w-full py-3 rounded-xl font-bold transition-colors ${plan.highlight ? 'bg-surface text-primary hover:bg-accent' : 'btn-primary'}`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-surface py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Utensils className="w-5 h-5 text-accent" />
            <span className="font-bold text-lg">GourmetSaaS</span>
          </div>
          <p className="text-sm text-surface/60">© 2026 GourmetSaaS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
