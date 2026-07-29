import { useEffect, useState, useCallback } from 'react';
import { BellRing, Droplets, Receipt, Hand, CheckCircle2, Clock, Utensils, Table2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatTime, timeAgo } from '@/lib/format';
import type { Order, TableRequest, Table, RequestType } from '@/types';

const REQUEST_ICONS: Record<RequestType, typeof BellRing> = {
  call_waiter: Hand,
  water: Droplets,
  bill: Receipt,
  custom: BellRing,
};

const REQUEST_LABELS: Record<RequestType, string> = {
  call_waiter: 'Call Waiter',
  water: 'Water Request',
  bill: 'Bill Request',
  custom: 'Custom Request',
};

export function WaiterDashboard() {
  const { restaurantId } = useAuth();
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<TableRequest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ready' | 'requests' | 'tables'>('ready');

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('waiter-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'table_requests', filter: `restaurant_id=eq.${restaurantId}` }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables', filter: `restaurant_id=eq.${restaurantId}` }, () => loadData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [restaurantId]);

  async function loadData() {
    const [ordersRes, reqRes, tablesRes] = await Promise.all([
      supabase.from('orders').select('*').eq('restaurant_id', restaurantId).eq('status', 'ready').order('created_at', { ascending: false }),
      supabase.from('table_requests').select('*').eq('restaurant_id', restaurantId).in('status', ['pending', 'acknowledged']).order('created_at', { ascending: false }),
      supabase.from('tables').select('*').eq('restaurant_id', restaurantId).order('table_number'),
    ]);

    setReadyOrders(ordersRes.data ?? []);
    setRequests(reqRes.data ?? []);
    setTables(tablesRes.data ?? []);
    setLoading(false);
  }

  const updateOrderStatus = useCallback(async (orderId: string, status: 'served' | 'completed') => {
    const updates: Record<string, string | null> = { status };
    if (status === 'served') updates.served_at = new Date().toISOString();
    if (status === 'completed') updates.completed_at = new Date().toISOString();
    await supabase.from('orders').update(updates).eq('id', orderId);
  }, []);

  const updateRequestStatus = useCallback(async (requestId: string, status: 'acknowledged' | 'completed') => {
    await supabase.from('table_requests').update({ status }).eq('id', requestId);
  }, []);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const acknowledgedRequests = requests.filter(r => r.status === 'acknowledged');

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
        <h1 className="font-serif text-2xl sm:text-3xl text-gradient-gold mb-1 flex items-center gap-2">
          <BellRing className="w-7 h-7" /> Waiter Dashboard
        </h1>
        <p className="text-sm text-ink-400">Ready orders, service requests, and table status</p>
      </div>

      {/* Tab Cards */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTab('ready')}
          className={`card-luxury p-4 text-left transition-all ${activeTab === 'ready' ? 'border-nirvana-400/40 shadow-gold' : ''}`}
        >
          <div className="flex items-center justify-between mb-1">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-serif text-ink-100">{readyOrders.length}</span>
          </div>
          <p className="text-xs text-ink-400">Ready to Serve</p>
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`card-luxury p-4 text-left transition-all ${activeTab === 'requests' ? 'border-nirvana-400/40 shadow-gold' : ''}`}
        >
          <div className="flex items-center justify-between mb-1">
            <Hand className="w-5 h-5 text-amber-400" />
            <span className="text-2xl font-serif text-ink-100">{pendingRequests.length}</span>
          </div>
          <p className="text-xs text-ink-400">Service Requests</p>
        </button>
        <button
          onClick={() => setActiveTab('tables')}
          className={`card-luxury p-4 text-left transition-all ${activeTab === 'tables' ? 'border-nirvana-400/40 shadow-gold' : ''}`}
        >
          <div className="flex items-center justify-between mb-1">
            <Table2 className="w-5 h-5 text-nirvana-400" />
            <span className="text-2xl font-serif text-ink-100">{tables.filter(t => t.status === 'occupied').length}</span>
          </div>
          <p className="text-xs text-ink-400">Tables Occupied</p>
        </button>
      </div>

      {/* Ready Orders */}
      {activeTab === 'ready' && (
        <div>
          <h3 className="font-serif text-lg text-nirvana-300 mb-4">Orders Ready to Serve</h3>
          {readyOrders.length === 0 ? (
            <div className="card-luxury p-12 text-center">
              <Utensils className="w-12 h-12 text-ink-600 mx-auto mb-3" />
              <p className="text-ink-400">No orders ready to serve</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readyOrders.map((order) => (
                <div key={order.id} className="card-luxury p-4 animate-fade-in-up">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-serif text-lg text-nirvana-300">{order.order_number}</p>
                      <p className="text-xs text-ink-400">Table {order.table_number} · {order.items_count} items</p>
                    </div>
                    <span className="badge bg-green-500/15 text-green-400 border-green-500/30">Ready</span>
                  </div>
                  <p className="text-xs text-ink-400 mb-3">Ready since {order.ready_at ? timeAgo(order.ready_at) : '—'}</p>
                  <button onClick={() => updateOrderStatus(order.id, 'served')} className="btn-gold w-full !py-2 text-sm">
                    Mark as Served
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Service Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {pendingRequests.length > 0 && (
            <div>
              <h3 className="font-serif text-lg text-amber-400 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" /> Pending Requests
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingRequests.map((req) => {
                  const Icon = REQUEST_ICONS[req.request_type];
                  return (
                    <div key={req.id} className="card-luxury p-4 border-amber-500/20 animate-fade-in-up">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-amber-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-ink-100">{REQUEST_LABELS[req.request_type]}</p>
                            <p className="text-xs text-ink-400">Table {req.table_number} · {timeAgo(req.created_at)}</p>
                          </div>
                        </div>
                      </div>
                      {req.note && (
                        <p className="text-xs text-ink-400 mb-3 glass rounded-lg p-2">{req.note}</p>
                      )}
                      <button onClick={() => updateRequestStatus(req.id, 'acknowledged')} className="btn-gold w-full !py-2 text-sm">
                        Acknowledge
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {acknowledgedRequests.length > 0 && (
            <div>
              <h3 className="font-serif text-lg text-nirvana-300 mb-4">In Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {acknowledgedRequests.map((req) => {
                  const Icon = REQUEST_ICONS[req.request_type];
                  return (
                    <div key={req.id} className="card-luxury p-4 animate-fade-in-up">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-nirvana-400/15 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-nirvana-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink-100">{REQUEST_LABELS[req.request_type]}</p>
                          <p className="text-xs text-ink-400">Table {req.table_number}</p>
                        </div>
                      </div>
                      <button onClick={() => updateRequestStatus(req.id, 'completed')} className="btn-outline-gold w-full !py-2 text-sm">
                        Mark Completed
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {requests.length === 0 && (
            <div className="card-luxury p-12 text-center">
              <BellRing className="w-12 h-12 text-ink-600 mx-auto mb-3" />
              <p className="text-ink-400">No service requests</p>
            </div>
          )}
        </div>
      )}

      {/* Table Status */}
      {activeTab === 'tables' && (
        <div>
          <h3 className="font-serif text-lg text-nirvana-300 mb-4">Table Status Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {tables.map((table) => {
              const statusColor = table.status === 'available' ? 'bg-green-500/15 text-green-400 border-green-500/30'
                : table.status === 'occupied' ? 'bg-red-500/15 text-red-400 border-red-500/30'
                : table.status === 'reserved' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-ink-500/15 text-ink-400 border-ink-500/30';

              return (
                <div key={table.id} className="card-luxury p-4 text-center">
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center border ${statusColor}`}>
                    <Table2 className="w-6 h-6" />
                  </div>
                  <p className="font-serif text-lg text-ink-100">{table.name ?? `Table ${table.table_number}`}</p>
                  <p className="text-xs text-ink-400 mb-2">Seats {table.capacity}</p>
                  <span className={`badge capitalize ${statusColor}`}>{table.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
