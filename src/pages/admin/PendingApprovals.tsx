import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, XCircle, Clock, Trash2, Shield, Eye, MapPin, Building2, User, Phone } from 'lucide-react';
import { timeAgo } from '@/lib/format';

interface PendingRestaurant {
  id: string;
  name: string;
  phone: string;
  website_status: string;
  is_active: boolean;
  created_at: string;
  subscription: {
    id: string;
    plan: string;
    status: string;
  };
  staff: {
    name: string;
    email: string;
  }[];
}

export function PendingApprovals() {
  const [restaurants, setRestaurants] = useState<PendingRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadPending();
  }, []);

  async function loadPending() {
    const { data, error } = await supabase
      .from('restaurants')
      .select(`
        id, name, phone, website_status, is_active, created_at,
        subscription:subscriptions!inner(id, plan, status),
        staff:staff(name, email)
      `)
      .eq('subscriptions.status', 'pending_approval')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading pending approvals:', error);
    } else {
      setRestaurants(data as any);
    }
    setLoading(false);
  }

  async function handleApprove(restaurantId: string) {
    if (!confirm('Are you sure you want to approve and activate this restaurant?')) return;
    setProcessingId(restaurantId);
    
    // 1. Activate Subscription
    await supabase.from('subscriptions')
      .update({ status: 'active' })
      .eq('restaurant_id', restaurantId);

    // 2. Activate Restaurant
    await supabase.from('restaurants')
      .update({ is_active: true, website_status: 'published' })
      .eq('id', restaurantId);

    loadPending();
    setProcessingId(null);
  }

  async function handleReject(restaurantId: string) {
    if (!confirm('Are you sure you want to reject this request?')) return;
    setProcessingId(restaurantId);
    
    await supabase.from('subscriptions')
      .update({ status: 'rejected' })
      .eq('restaurant_id', restaurantId);

    loadPending();
    setProcessingId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-2 border-nirvana-400/30 border-t-nirvana-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl text-gradient-gold mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8" /> Pending Approvals
        </h1>
        <p className="text-ink-400">Review and manage premium plan registrations</p>
      </div>

      {restaurants.length === 0 ? (
        <div className="card-luxury p-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-ink-600 mx-auto mb-4" />
          <h2 className="text-xl font-serif text-ink-300 mb-2">All Caught Up!</h2>
          <p className="text-ink-500">There are no pending subscription approvals at this time.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {restaurants.map(r => {
            const owner = r.staff.find(s => true) || { name: 'Unknown', email: 'Unknown' };
            
            return (
              <div key={r.id} className="card-luxury p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-l-4 border-l-amber-500">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-serif text-xl font-bold text-nirvana-100">{r.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-nirvana-500/20 text-nirvana-300 text-xs font-semibold capitalize border border-nirvana-500/30">
                      {r.subscription.plan} Plan
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeAgo(r.created_at)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-ink-300">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-ink-500" />
                      {owner.name} ({owner.email})
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-ink-500" />
                      {r.phone || 'No phone provided'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-ink-500" />
                      ID: <span className="font-mono text-xs">{r.id.split('-')[0]}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t border-white/5 md:border-0">
                  <button
                    onClick={() => handleApprove(r.id)}
                    disabled={processingId === r.id}
                    className="flex-1 md:flex-none btn-gold !py-2.5 px-6 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(r.id)}
                    disabled={processingId === r.id}
                    className="flex-1 md:flex-none py-2.5 px-6 rounded-xl font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
