import { useEffect, useState } from 'react';
import { 
  Search, ExternalLink, MoreVertical, LogIn, 
  Ban, CheckCircle, RefreshCw, Edit, Trash2, Store
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function SuperAdminRestaurants() {
  const { setImpersonatedRestaurantId } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadRestaurants();
  }, []);

  async function loadRestaurants() {
    setLoading(true);
    // Fetch restaurants and join with subscriptions and staff (owner)
    const { data: rests } = await supabase
      .from('restaurants')
      .select('*, subscriptions(plan, status), staff(name, email, phone, role)')
      .order('created_at', { ascending: false });

    if (rests) {
      setRestaurants(rests.map(r => {
        const owner = r.staff?.find((s: any) => s.role === 'owner') || r.staff?.[0];
        const sub = r.subscriptions?.[0];
        return {
          ...r,
          owner_name: owner?.name || 'Unknown',
          owner_email: owner?.email || 'N/A',
          owner_phone: owner?.phone || 'N/A',
          plan: sub?.plan || 'None',
          sub_status: sub?.status || 'N/A'
        };
      }));
    }
    setLoading(false);
  }

  const handleImpersonate = (restaurantId: string) => {
    setImpersonatedRestaurantId(restaurantId);
    navigate('/owner/dashboard');
  };

  const handleSuspend = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'published' : 'suspended';
    await supabase.from('restaurants').update({ website_status: newStatus }).eq('id', id);
    loadRestaurants();
  };

  const filtered = restaurants.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.owner_name.toLowerCase().includes(search.toLowerCase()) ||
    r.owner_email.toLowerCase().includes(search.toLowerCase()) ||
    (r.subdomain && r.subdomain.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl sm:text-3xl text-theme-primary mb-1">Restaurants</h1>
          <p className="text-sm text-theme-secondary">Manage all tenants on the platform.</p>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary" />
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-luxury pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-theme-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-theme-border text-sm text-theme-secondary bg-primary/5">
                <th className="py-4 px-6 font-medium">Restaurant</th>
                <th className="py-4 px-6 font-medium">Owner</th>
                <th className="py-4 px-6 font-medium">Plan</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium">Joined</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-theme-secondary">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-theme-secondary">
                    No restaurants found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="hover:bg-primary/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 overflow-hidden border border-theme-border">
                          {r.logo_url ? (
                            <img src={r.logo_url} alt={r.name} className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-5 h-5 text-theme-secondary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-theme-primary">{r.name}</p>
                          <a href={`/${r.subdomain}`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                            /{r.subdomain} <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-theme-primary text-sm">{r.owner_name}</p>
                      <p className="text-xs text-theme-secondary">{r.owner_email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        r.plan === 'enterprise' ? 'bg-gradient-gold text-ink-950 shadow-sm' :
                        r.plan === 'pro' ? 'bg-purple-500/10 text-purple-600' :
                        'bg-blue-500/10 text-blue-600'
                      }`}>
                        {r.plan}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        r.website_status === 'published' ? 'bg-green-500/10 text-green-600' :
                        r.website_status === 'suspended' ? 'bg-red-500/10 text-red-600' :
                        'bg-yellow-500/10 text-yellow-600'
                      }`}>
                        {r.website_status === 'published' ? <CheckCircle className="w-3.5 h-3.5" /> : 
                         r.website_status === 'suspended' ? <Ban className="w-3.5 h-3.5" /> : 
                         <RefreshCw className="w-3.5 h-3.5" />}
                        {r.website_status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-theme-secondary">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleImpersonate(r.id)}
                          className="p-2 text-theme-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors tooltip-trigger"
                          title="Impersonate (Login As)"
                        >
                          <LogIn className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleSuspend(r.id, r.website_status)}
                          className={`p-2 rounded-lg transition-colors tooltip-trigger ${
                            r.website_status === 'suspended' 
                              ? 'text-green-500 hover:bg-green-500/10' 
                              : 'text-red-500 hover:bg-red-500/10'
                          }`}
                          title={r.website_status === 'suspended' ? 'Activate' : 'Suspend'}
                        >
                          {r.website_status === 'suspended' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
