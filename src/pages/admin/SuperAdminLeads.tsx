import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PhoneCall, Calendar, Mail, Store, Clock, ExternalLink, RefreshCw } from 'lucide-react';

export function SuperAdminLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    setLoading(true);
    const { data } = await supabase
      .from('premium_leads')
      .select('*, restaurants(subdomain)')
      .order('created_at', { ascending: false });
    
    if (data) setLeads(data);
    setLoading(false);
  }

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('premium_leads').update({ status: newStatus }).eq('id', id);
    loadLeads();
  };

  const filtered = statusFilter === 'all' ? leads : leads.filter(l => l.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'contacted': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'meeting_scheduled': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'converted': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const formatStatus = (s: string) => s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl sm:text-3xl text-theme-primary mb-1">Premium Leads</h1>
          <p className="text-sm text-theme-secondary">Manage onboarding callbacks for Premium & Enterprise plans.</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-luxury text-sm !py-2"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="meeting_scheduled">Meeting Scheduled</option>
            <option value="converted">Converted</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={loadLeads} className="btn-outline-primary !p-2">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-2xl border border-theme-border">
            <PhoneCall className="w-12 h-12 text-theme-secondary mx-auto mb-3 opacity-50" />
            <p className="text-theme-secondary">No premium leads found.</p>
          </div>
        ) : (
          filtered.map(lead => (
            <div key={lead.id} className="bg-surface p-5 md:p-6 rounded-2xl border border-theme-border shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
              
              <div className="flex-1 space-y-3 w-full">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-theme-primary flex items-center gap-2">
                      {lead.owner_name} 
                      <span className="text-sm font-normal text-theme-secondary">({lead.business_name})</span>
                    </h3>
                    {lead.restaurants?.subdomain && (
                      <a href={`/${lead.restaurants.subdomain}`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                        /{lead.restaurants.subdomain} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(lead.status)}`}>
                    {formatStatus(lead.status)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-theme-secondary">
                  <p className="flex items-center gap-2"><PhoneCall className="w-4 h-4 text-primary" /> {lead.phone_number}</p>
                  {lead.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> {lead.email}</p>}
                  <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Preferred: {lead.preferred_call_time || 'Anytime'}</p>
                  <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Submitted: {new Date(lead.created_at).toLocaleString()}</p>
                </div>

                {lead.notes && (
                  <div className="mt-3 p-3 bg-secondary/5 rounded-xl border border-theme-border text-sm text-theme-primary">
                    <span className="font-medium">Notes:</span> {lead.notes}
                  </div>
                )}
              </div>

              <div className="w-full md:w-48 flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-theme-border pt-4 md:pt-0 md:pl-6">
                <p className="text-xs font-medium text-theme-secondary mb-1">Update Status:</p>
                <select 
                  value={lead.status}
                  onChange={(e) => updateStatus(lead.id, e.target.value)}
                  className="input-luxury text-sm w-full"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="meeting_scheduled">Meeting Scheduled</option>
                  <option value="converted">Converted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
