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
      price: '₹2,999',
      period: '/ 3 Months',
      features: [
        '1 Restaurant Account',
        '15 QR Codes',
        '15 Tables',
        'Up to 130 Menu Items',
        'Unlimited Orders',
        'Owner, Kitchen & Waiter Dashboards',
        'Basic Analytics & Reports',
        'Email Support'
      ],
      buttonText: 'Buy Now',
      highlight: false,
      theme: 'border-ink-800 bg-ink-900/50 hover:border-nirvana-400/30 text-ink-100'
    },
    {
      name: 'Professional',
      price: '₹3,999',
      period: '/ 3 Months',
      badge: 'Most Popular',
      features: [
        'Everything in Starter',
        'Unlimited QR Codes & Tables',
        'Unlimited Menu Items',
        'Unlimited Staff',
        'Advanced Analytics & Export PDF/Excel',
        'Customer Feedback',
        'Premium Dashboard & Custom Branding',
        'Priority Support & Auto Backups'
      ],
      buttonText: 'Buy Now',
      highlight: true,
      theme: 'border-nirvana-400/50 bg-gradient-to-b from-coffee-950 to-ink-950 text-nirvana-50 shadow-gold'
    },
    {
      name: 'Enterprise',
      price: '₹11,499',
      period: '/ Year',
      badge: 'Best Value',
      savings: 'Save ₹4,497/year compared to Pro',
      features: [
        'Everything in Professional',
        'Unlimited Everything',
        'Premium Updates',
        'Advanced Reports & Business Analytics',
        'Dedicated Support',
        'Early Access to New Features'
      ],
      buttonText: 'Buy Now',
      highlight: false,
      theme: 'border-ink-800 bg-ink-900/50 hover:border-nirvana-400/30 text-ink-100'
    }
  ];

  const compareFeatures = [
    { feature: 'Restaurant Accounts', starter: '1', pro: '1', enterprise: 'Unlimited' },
    { feature: 'QR Codes & Tables', starter: '15', pro: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Menu Items', starter: '130', pro: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Orders', starter: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Staff Accounts', starter: 'Basic', pro: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Analytics', starter: 'Basic', pro: 'Advanced', enterprise: 'Business Analytics' },
    { feature: 'Custom Branding', starter: '-', pro: 'Yes', enterprise: 'Yes + White Label' },
    { feature: 'Support', starter: 'Email', pro: 'Priority', enterprise: 'Dedicated' },
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
      <section className="py-24 bg-ink-950 font-serif relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-nirvana-400/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient-gold mb-4">Invest in Excellence</h2>
            <p className="text-ink-300 max-w-2xl mx-auto font-sans">Choose a plan that fits your culinary ambition. Premium tools for premium experiences.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-24">
            {plans.map((plan) => (
              <div 
                key={plan.name} 
                className={`relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 flex flex-col h-full ${plan.theme}`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-gold text-ink-950 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap font-sans uppercase tracking-wider">
                      {plan.badge}
                    </span>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                
                <div className="mb-4">
                  <span className="text-4xl md:text-5xl font-bold text-nirvana-300 tracking-tight">{plan.price}</span>
                  <span className="text-ink-400 font-sans ml-2">{plan.period}</span>
                </div>
                
                {plan.savings && (
                  <div className="mb-6 inline-block bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full font-sans font-medium">
                    {plan.savings}
                  </div>
                )}
                
                <div className="w-full h-px bg-gradient-to-r from-transparent via-nirvana-400/20 to-transparent my-6" />
                
                <ul className="space-y-4 mb-8 flex-1 font-sans">
                  {plan.features.map(feat => (
                    <li key={feat} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-nirvana-400 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => navigate('/register')}
                  className={`w-full py-4 rounded-xl font-bold font-sans uppercase tracking-widest text-sm transition-all duration-300 ${
                    plan.highlight 
                      ? 'bg-gradient-gold text-ink-950 shadow-gold hover:opacity-90' 
                      : 'bg-ink-800 text-nirvana-100 hover:bg-ink-700 hover:text-nirvana-300 border border-ink-700'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
          
          {/* Feature Comparison Table */}
          <div className="max-w-4xl mx-auto mt-16 font-sans">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-center text-nirvana-300 mb-10">Compare Features</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-ink-800 text-ink-300">
                    <th className="py-4 px-6 font-medium">Features</th>
                    <th className="py-4 px-6 font-medium">Starter</th>
                    <th className="py-4 px-6 font-bold text-nirvana-400">Professional</th>
                    <th className="py-4 px-6 font-medium">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-800/50 text-sm">
                  {compareFeatures.map((row, idx) => (
                    <tr key={idx} className="hover:bg-ink-900/30 transition-colors">
                      <td className="py-4 px-6 text-ink-100">{row.feature}</td>
                      <td className="py-4 px-6 text-ink-400">{row.starter}</td>
                      <td className="py-4 px-6 text-nirvana-300 font-medium">{row.pro}</td>
                      <td className="py-4 px-6 text-ink-400">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
