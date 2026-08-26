import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
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

  
  const [pricingType, setPricingType] = useState<'single' | 'franchise'>('single');

  const singleRestaurantPlans = [
    {
      name: 'Starter',
      originalPrice: '₹4,999',
      price: '₹2,999',
      period: '3 Months',
      badge: 'Perfect for Small Restaurants',
      savings: 'Save 40%',
      features: [
        '1 Restaurant',
        '15 QR Codes',
        '15 Tables',
        'Up to 130 Menu Items',
        'Unlimited Orders',
        'Owner Dashboard',
        'Kitchen Dashboard',
        'Waiter Dashboard',
        'Customer Ordering Website',
        'QR Menu',
        'Table Management',
        'Menu Management',
        'Order Management',
        'Customer Database',
        'Basic Reports',
        'Basic Analytics',
        'Email Support'
      ],
      buttonText: 'Get Started',
      highlight: false,
      theme: 'border-ink-800 bg-ink-900/50 hover:border-nirvana-400/30 text-ink-100'
    },
    {
      name: 'Professional',
      originalPrice: '₹5,999',
      price: '₹3,999',
      period: '3 Months',
      badge: '⭐ MOST POPULAR',
      savings: 'Save 33%',
      features: [
        'Everything in Starter PLUS',
        'Unlimited QR Codes',
        'Unlimited Tables',
        'Unlimited Menu Items',
        'Unlimited Staff Accounts',
        'Unlimited Categories',
        'Advanced Analytics',
        'Sales Dashboard',
        'Peak Hour Analytics',
        'Customer Insights',
        'Export PDF',
        'Export Excel',
        'Premium Dashboard',
        'Restaurant Branding',
        'Custom Theme',
        'Promotional Banners',
        'Discount Management',
        'QR Customization',
        'Priority Support',
        'Automatic Backups'
      ],
      buttonText: 'Start Growing',
      highlight: true,
      theme: 'border-nirvana-400/50 bg-gradient-to-b from-coffee-950 to-ink-950 text-nirvana-50 shadow-2xl scale-105 z-10'
    },
    {
      name: 'Enterprise',
      originalPrice: '₹14,999',
      price: '₹11,999',
      period: '1 Year',
      badge: '👑 BEST VALUE',
      savings: 'Save 20%',
      features: [
        'Everything in Professional PLUS',
        'Unlimited Everything',
        'Multi-Branch Support',
        'Branch Analytics',
        'Dedicated Account Manager',
        'Premium Support',
        'White Label Branding',
        'Custom Domain Support',
        'API Access',
        'Staff Roles & Permissions',
        'Advanced Reports',
        'Business Intelligence Dashboard',
        'Early Access Features',
        'Premium Updates',
        'Backup & Restore',
        'Business Consultation',
        'Future POS Integration',
        'Future Inventory Management',
        'Future Loyalty Program'
      ],
      buttonText: 'Contact Sales',
      highlight: false,
      theme: 'border-ink-800 bg-ink-900/50 hover:border-nirvana-400/30 text-ink-100'
    }
  ];

  const franchisePlans = [
    {
      name: 'Franchise Starter',
      price: '₹9,999',
      period: '3 Months',
      badge: '',
      savings: '',
      features: [
        'Everything in Enterprise PLUS',
        'Up to 5 Restaurants',
        'Centralized Franchise Dashboard',
        'Individual Restaurant Dashboards',
        'Restaurant-wise Settings',
        'Restaurant-wise Menu Management',
        'Restaurant-wise QR Codes',
        'Restaurant-wise Tables',
        'Restaurant-wise Staff Management',
        'Restaurant-wise Orders',
        'Restaurant-wise Customer Database',
        'Restaurant-wise Analytics',
        'Restaurant-wise Reports',
        'Centralized Franchise Management',
        'Restaurant Onboarding',
        'Restaurant Activation/Deactivation',
      ],
      buttonText: 'Get Started',
      highlight: false,
      theme: 'border-ink-800 bg-ink-900/50 hover:border-nirvana-400/30 text-ink-100'
    },
    {
      name: 'Franchise Growth',
      price: '₹17,999',
      period: '3 Months',
      badge: '⭐ MOST POPULAR',
      savings: '',
      features: [
        'Everything in Enterprise PLUS',
        '5–10 Restaurants',
        'Franchise-wide Sales Dashboard',
        'Restaurant-wise Sales Analytics',
        'Branch Performance Comparison',
        'Revenue Comparison',
        'Order Volume Analytics',
        'Peak Hour Analytics',
        'Customer Insights',
        'Best/Worst Performing Restaurant Reports',
        'Sales Trends',
        'Business Intelligence Dashboard',
        'Advanced Reports',
        'Export PDF',
        'Export Excel',
      ],
      buttonText: 'Start Growing',
      highlight: true,
      theme: 'border-nirvana-400/50 bg-gradient-to-b from-coffee-950 to-ink-950 text-nirvana-50 shadow-2xl scale-105 z-10'
    },
    {
      name: 'Franchise Unlimited',
      price: '₹24,999',
      period: '3 Months',
      badge: '👑 BEST VALUE',
      savings: '',
      features: [
        'Everything in Enterprise PLUS',
        'Unlimited Restaurants',
        'Unlimited Staff Accounts',
        'Staff Roles & Permissions',
        'Owner/Admin Access',
        'Franchise Manager Access',
        'Restaurant Manager Access',
        'Kitchen Staff Access',
        'Waiter Access',
        'Restaurant-level Access Control',
        'Centralized Staff Management',
        'White Label Branding',
        'Custom Domain Support',
        'Dedicated Account Manager',
        'Premium Support',
        'Business Consultation'
      ],
      buttonText: 'Contact Sales',
      highlight: false,
      theme: 'border-ink-800 bg-ink-900/50 hover:border-nirvana-400/30 text-ink-100'
    }
  ];

  const compareFeaturesSingle = [
    { feature: 'Restaurant Website', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Customer Ordering', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'QR Menu', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'QR Codes', starter: '15', pro: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Tables', starter: '15', pro: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Menu Items', starter: '130', pro: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Orders', starter: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Staff', starter: '—', pro: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Analytics', starter: 'Basic', pro: 'Advanced', enterprise: 'Business Intelligence' },
    { feature: 'Reports', starter: 'Basic', pro: 'Advanced', enterprise: 'Advanced' },
    { feature: 'Export PDF', starter: '—', pro: '✓', enterprise: '✓' },
    { feature: 'Export Excel', starter: '—', pro: '✓', enterprise: '✓' },
    { feature: 'Restaurant Branding', starter: '—', pro: '✓', enterprise: '✓' },
    { feature: 'Custom Theme', starter: '—', pro: '✓', enterprise: '✓' },
    { feature: 'Priority Support', starter: '—', pro: '✓', enterprise: 'Premium' },
    { feature: 'Auto Backup', starter: '—', pro: '✓', enterprise: '✓' },
    { feature: 'Multi Branch', starter: '—', pro: '—', enterprise: '✓' },
    { feature: 'Custom Domain', starter: '—', pro: '—', enterprise: '✓' },
    { feature: 'API Access', starter: '—', pro: '—', enterprise: '✓' },
    { feature: 'Dedicated Manager', starter: '—', pro: '—', enterprise: '✓' },
  ];

  const compareFeaturesFranchise = [
    { feature: 'Restaurants', starter: 'Up to 5', pro: '5–10', enterprise: 'Unlimited' },
    { feature: 'Restaurant Website', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Customer Ordering', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'QR Menu', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'QR Codes', starter: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Tables', starter: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Menu Items', starter: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Orders', starter: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Staff Accounts', starter: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Categories', starter: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Centralized Dashboard', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Franchise Dashboard', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Branch Analytics', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Sales Dashboard', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Restaurant Comparison', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Peak Hour Analytics', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Customer Insights', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Business Intelligence', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Advanced Reports', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Export PDF', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Export Excel', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Restaurant Branding', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Custom Theme', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Promotional Banners', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Discount Management', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'QR Customization', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'White Label Branding', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Custom Domain', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Staff Roles & Permissions', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Automatic Backup', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'API Access', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Multi-Branch Management', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Dedicated Account Manager', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Premium Support', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Business Consultation', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Future POS Integration', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Future Inventory Management', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Future Loyalty Program', starter: '✓', pro: '✓', enterprise: '✓' },
  ];


  return (
    <div className="min-h-screen bg-background text-primary font-sans relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Serveraa Logo" className="h-10 w-auto object-contain rounded-xl" />
          <div>
            <h1 className="font-bold text-xl leading-tight">Serveraa</h1>
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
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
          >
            Start Your Free Trial <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/owner/dashboard')}
            className="px-8 py-4 rounded-xl font-bold transition-all active:scale-95 text-lg flex items-center gap-2 bg-background border-2 border-primary/20 text-primary hover:border-primary/50 hover:bg-accent/10"
          >
            Live Demo
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
      <section id="pricing" className="py-24 bg-ink-950 font-serif relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-nirvana-400/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-4">Invest in Excellence</h2>
            <p className="text-ink-300 max-w-2xl mx-auto font-sans mb-8">Choose a plan that fits your culinary ambition. Premium tools for premium experiences.</p>
            
            <div className="inline-flex bg-ink-900 border border-ink-800 rounded-full p-1 font-sans">
              <button
                onClick={() => setPricingType('single')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${pricingType === 'single' ? 'bg-nirvana-400 text-ink-950 shadow-gold' : 'text-ink-300 hover:text-nirvana-100'}`}
              >
                Single Restaurant
              </button>
              <button
                onClick={() => setPricingType('franchise')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${pricingType === 'franchise' ? 'bg-nirvana-400 text-ink-950 shadow-gold' : 'text-ink-300 hover:text-nirvana-100'}`}
              >
                Franchise
              </button>
            </div>
          </div>

          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-24 max-w-7xl mx-auto">
            {(pricingType === 'single' ? singleRestaurantPlans : franchisePlans).map((plan) => (
              <div 
                key={plan.name} 
                className={`relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 flex flex-col h-full ${plan.theme}`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-full text-center">
                    <span className="bg-gradient-gold text-ink-950 text-[11px] sm:text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap font-sans uppercase tracking-wider">
                      {plan.badge}
                    </span>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-4 text-ink-50">{plan.name}</h3>
                
                <div className="mb-2">
                  {plan.originalPrice && (
                    <span className="text-ink-500 font-sans line-through text-lg mr-3">
                      {plan.originalPrice}
                    </span>
                  )}
                </div>
                <div className="mb-3 flex items-baseline flex-wrap gap-2">
                  <span className={`text-4xl md:text-5xl font-bold tracking-tight ${plan.highlight ? 'bg-gradient-gold bg-clip-text text-transparent' : 'text-nirvana-300'}`}>
                    {plan.price}
                  </span>
                  <span className="text-ink-400 font-sans font-medium text-sm">/{plan.period}</span>
                </div>
                
                {plan.savings && (
                  <div className="mb-6">
                    <span className="inline-block bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full font-sans font-medium uppercase tracking-wider">
                      {plan.savings}
                    </span>
                  </div>
                )}
                
                <button 
                  onClick={() => {
                    if (plan.name === 'Enterprise') {
                      window.location.href = 'mailto:sales@serveraa.com';
                    } else {
                      const planId = plan.name.toLowerCase() === 'professional' ? 'pro' : plan.name.toLowerCase();
                      navigate(`/register?plan=${planId}`);
                    }
                  }}
                  className={`w-full py-4 rounded-xl font-bold font-sans uppercase tracking-widest text-sm transition-all duration-300 mb-6 ${
                    plan.highlight 
                      ? 'bg-gradient-gold text-ink-950 shadow-gold hover:opacity-90' 
                      : 'bg-ink-800 text-nirvana-100 hover:bg-ink-700 hover:text-nirvana-300 border border-ink-700'
                  }`}
                >
                  {plan.buttonText}
                </button>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-nirvana-400/20 to-transparent mb-6" />
                
                <ul className="space-y-4 mb-8 flex-1 font-sans">
                  {plan.features.map(feat => (
                    <li key={feat} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${plan.highlight ? 'text-yellow-500' : 'text-nirvana-400'}`} />
                      <span className={`text-sm font-medium leading-tight ${feat.includes('Everything in') ? 'font-bold' : ''}`}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          {/* Feature Comparison Table */}
          <div className="max-w-5xl mx-auto mt-16 font-sans">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-center text-nirvana-300 mb-10">Detailed Comparison</h3>
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  
                  <tr className="border-b border-ink-800 text-ink-300 bg-ink-900/30">
                    <th className="py-5 px-6 font-medium sticky left-0 bg-ink-950 lg:bg-transparent shadow-[4px_0_10px_rgba(0,0,0,0.1)] lg:shadow-none">Features</th>
                    <th className="py-5 px-6 font-medium text-center">{pricingType === 'single' ? 'Starter' : 'Starter'}</th>
                    <th className="py-5 px-6 font-bold bg-gradient-gold bg-clip-text text-transparent text-center">{pricingType === 'single' ? 'Professional' : 'Growth'}</th>
                    <th className="py-5 px-6 font-medium text-center">{pricingType === 'single' ? 'Enterprise' : 'Unlimited'}</th>
                  </tr>

                </thead>
                <tbody className="divide-y divide-ink-800/50 text-sm">
                  {(pricingType === 'single' ? compareFeaturesSingle : compareFeaturesFranchise).map((row, idx) => (
                    <tr key={idx} className="hover:bg-ink-900/30 transition-colors">
                      <td className="py-4 px-6 text-ink-100 font-medium sticky left-0 bg-ink-950 lg:bg-transparent shadow-[4px_0_10px_rgba(0,0,0,0.1)] lg:shadow-none">{row.feature}</td>
                      <td className={`py-4 px-6 text-center ${row.starter === '✓' ? 'text-green-400' : 'text-ink-500'}`}>{row.starter}</td>
                      <td className={`py-4 px-6 text-center font-medium ${row.pro === '✓' ? 'text-green-400' : (row.pro === '—' ? 'text-ink-500' : 'text-nirvana-300')}`}>{row.pro}</td>
                      <td className={`py-4 px-6 text-center ${row.enterprise === '✓' ? 'text-green-400' : 'text-ink-500'}`}>{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Social Proof */}
          <div className="max-w-4xl mx-auto mt-24 mb-12 text-center font-sans">
            <h4 className="text-xl font-bold text-ink-300 mb-8">Trusted by growing restaurants.</h4>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 text-sm font-medium text-ink-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>No hidden charges</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Secure Cloud Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Free Setup Assistance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Premium Support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-surface py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.png" alt="Serveraa Logo" className="h-6 w-auto object-contain rounded-sm" />
            <span className="font-bold text-lg">Serveraa</span>
          </div>
          <p className="text-sm text-surface/60">© 2026 Serveraa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
