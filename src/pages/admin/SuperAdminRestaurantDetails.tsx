import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Store, ArrowLeft, ExternalLink } from 'lucide-react';

export function SuperAdminRestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from('restaurants')
        .select('*, subscriptions(plan, status), staff(name, email, phone, role)')
        .eq('id', id)
        .single();
      
      if (data) {
        setRestaurant(data);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) return <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" /></div>;
  if (!restaurant) return <div className="p-8 text-center">Restaurant not found.</div>;

  const owner = restaurant.staff?.find((s: any) => s.role === 'owner') || restaurant.staff?.[0];
  const sub = restaurant.subscriptions?.[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('/sup/restaurants')} className="flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back to Restaurants
      </button>

      <div className="bg-surface p-6 rounded-2xl border border-theme-border shadow-sm flex items-start gap-6">
        <div className="w-24 h-24 rounded-xl bg-secondary/10 flex items-center justify-center overflow-hidden border border-theme-border flex-shrink-0">
          {restaurant.logo_url ? (
            <img src={restaurant.logo_url} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <Store className="w-10 h-10 text-theme-secondary" />
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-theme-primary mb-1">{restaurant.name}</h1>
          <p className="text-theme-secondary mb-4">{restaurant.tagline}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-theme-secondary uppercase tracking-wider mb-1">Owner</p>
              <p className="font-medium text-theme-primary">{owner?.name}</p>
              <p className="text-sm text-theme-secondary">{owner?.email}</p>
            </div>
            <div>
              <p className="text-xs text-theme-secondary uppercase tracking-wider mb-1">Subscription</p>
              <p className="font-medium text-theme-primary capitalize">{sub?.plan || 'None'}</p>
              <p className="text-sm text-theme-secondary capitalize">{sub?.status}</p>
            </div>
            <div>
              <p className="text-xs text-theme-secondary uppercase tracking-wider mb-1">Status</p>
              <p className="font-medium text-theme-primary capitalize">{restaurant.website_status}</p>
              <a href={`/${restaurant.subdomain}`} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                View Website <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
