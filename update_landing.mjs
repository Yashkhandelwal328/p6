import fs from 'fs';
let content = fs.readFileSync('src/pages/LandingPage.tsx', 'utf-8');

// Add useState import
content = content.replace(
  "import { useNavigate } from 'react-router-dom';",
  "import { useNavigate } from 'react-router-dom';\nimport { useState } from 'react';"
);

// Add the franchise plans data inside the component (or outside)
const FRANCHISE_PLANS_DATA = `
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
`;

content = content.replace(/const plans = \[[\s\S]*?\];\n\n  const compareFeatures = \[[\s\S]*?\];/, FRANCHISE_PLANS_DATA);

const toggleUI = `
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-4">Invest in Excellence</h2>
            <p className="text-ink-300 max-w-2xl mx-auto font-sans mb-8">Choose a plan that fits your culinary ambition. Premium tools for premium experiences.</p>
            
            <div className="inline-flex bg-ink-900 border border-ink-800 rounded-full p-1 font-sans">
              <button
                onClick={() => setPricingType('single')}
                className={\`px-6 py-2 rounded-full text-sm font-bold transition-all \${pricingType === 'single' ? 'bg-nirvana-400 text-ink-950 shadow-gold' : 'text-ink-300 hover:text-nirvana-100'}\`}
              >
                Single Restaurant
              </button>
              <button
                onClick={() => setPricingType('franchise')}
                className={\`px-6 py-2 rounded-full text-sm font-bold transition-all \${pricingType === 'franchise' ? 'bg-nirvana-400 text-ink-950 shadow-gold' : 'text-ink-300 hover:text-nirvana-100'}\`}
              >
                Franchise
              </button>
            </div>
          </div>
`;

content = content.replace(
  /<div className="text-center mb-16">\s*<h2 className="text-4xl md:text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-4">Invest in Excellence<\/h2>\s*<p className="text-ink-300 max-w-2xl mx-auto font-sans">Choose a plan that fits your culinary ambition\. Premium tools for premium experiences\.<\/p>\s*<\/div>/,
  toggleUI
);

// Update maps
content = content.replace(/plans\.map/g, "(pricingType === 'single' ? singleRestaurantPlans : franchisePlans).map");

content = content.replace(/compareFeatures\.map/g, "(pricingType === 'single' ? compareFeaturesSingle : compareFeaturesFranchise).map");

// Also update the table headers for Franchise (it has Starter, Franchise Growth, Franchise Unlimited - we'll just keep the labels generic or dynamic)
const tableHeader = `
                  <tr className="border-b border-ink-800 text-ink-300 bg-ink-900/30">
                    <th className="py-5 px-6 font-medium sticky left-0 bg-ink-950 lg:bg-transparent shadow-[4px_0_10px_rgba(0,0,0,0.1)] lg:shadow-none">Features</th>
                    <th className="py-5 px-6 font-medium text-center">{pricingType === 'single' ? 'Starter' : 'Starter'}</th>
                    <th className="py-5 px-6 font-bold bg-gradient-gold bg-clip-text text-transparent text-center">{pricingType === 'single' ? 'Professional' : 'Growth'}</th>
                    <th className="py-5 px-6 font-medium text-center">{pricingType === 'single' ? 'Enterprise' : 'Unlimited'}</th>
                  </tr>
`;

content = content.replace(
  /<tr className="border-b border-ink-800 text-ink-300 bg-ink-900\/30">[\s\S]*?<\/tr>/,
  tableHeader
);

fs.writeFileSync('src/pages/LandingPage.tsx', content, 'utf-8');
