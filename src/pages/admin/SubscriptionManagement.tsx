import { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Subscription } from '@/types';

export function SubscriptionManagement() {
  const { restaurantId } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSub() {
      if (!restaurantId) return;
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .maybeSingle();
      
      if (data) {
        setSubscription(data as Subscription);
      }
      setLoading(false);
    }
    loadSub();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const plans = [
    {
      name: 'starter',
      label: 'Starter',
      price: '$29/mo',
      features: ['Basic Dashboard', '50 Menu Items', 'QR Menu', 'Delivery Orders']
    },
    {
      name: 'pro',
      label: 'Pro',
      price: '$79/mo',
      features: ['Unlimited Menu', 'Coupons & Analytics', 'Staff Accounts', 'Custom Theme', 'Custom Domain']
    },
    {
      name: 'enterprise',
      label: 'Enterprise',
      price: 'Custom',
      features: ['Multi Branch', 'API Access', 'Priority Support', 'Advanced Analytics']
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in p-2 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl sm:text-3xl text-primary mb-1 flex items-center gap-2">
            <CreditCard className="w-7 h-7" /> Subscription & Billing
          </h1>
          <p className="text-sm text-primary/60">Manage your SaaS platform subscription</p>
        </div>
      </div>

      {subscription && (
        <div className="bg-surface border border-accent p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm text-primary/60 mb-1">Current Plan</p>
            <h2 className="text-2xl font-bold text-primary capitalize flex items-center gap-2">
              {subscription.plan} 
              <span className={`text-xs px-2 py-1 rounded-full ${subscription.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {subscription.status}
              </span>
            </h2>
          </div>
          <div>
             <button className="bg-primary text-surface px-4 py-2 rounded-xl text-sm font-medium hover:bg-secondary transition-colors">
               Manage Billing
             </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {plans.map((plan) => (
          <div key={plan.name} className={`p-6 rounded-2xl border ${subscription?.plan === plan.name ? 'border-primary shadow-md' : 'border-accent/50 bg-surface'}`}>
             <h3 className="text-xl font-bold mb-2 text-primary">{plan.label}</h3>
             <div className="text-3xl font-bold text-primary mb-6">{plan.price}</div>
             <ul className="space-y-3 mb-8">
                {plan.features.map(feat => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-primary/70">
                    <CheckCircle2 className="w-4 h-4 text-secondary" /> {feat}
                  </li>
                ))}
             </ul>
             <button 
               disabled={subscription?.plan === plan.name}
               className={`w-full py-2.5 rounded-xl font-medium transition-colors ${
                 subscription?.plan === plan.name 
                   ? 'bg-primary/10 text-primary cursor-not-allowed'
                   : 'bg-primary text-surface hover:bg-secondary'
               }`}
             >
               {subscription?.plan === plan.name ? 'Current Plan' : 'Upgrade'}
             </button>
          </div>
        ))}
      </div>
    </div>
  );
}
