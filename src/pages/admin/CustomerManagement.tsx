import { useEffect, useState } from 'react';
import { Search, Users, Phone, ShoppingBag, DollarSign, X, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import type { Customer, Order } from '@/types';

export function CustomerManagement() {
  const { restaurantId } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<{ customer: Customer; orders: Order[] } | null>(null);

  useEffect(() => { loadData(); }, [restaurantId]);

  async function loadData() {
    const { data } = await supabase.from('customers').select('*').eq('restaurant_id', restaurantId).order('created_at', { ascending: false });
    setCustomers(data ?? []);
    setLoading(false);
  }

  async function viewCustomer(customer: Customer) {
    const { data: orders } = await supabase.from('orders').select('*').eq('customer_id', customer.id).order('created_at', { ascending: false });
    setSelectedCustomer({ customer, orders: orders ?? [] });
  }

  const filtered = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
  });

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
        <h1 className="font-serif text-2xl sm:text-3xl text-ink-950 mb-1">Customer Management</h1>
        <p className="text-sm text-ink-600">{customers.length} customers</p>
      </div>

      <div className="card-luxury p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-600" />
          <input
            type="text"
            placeholder="Search by name, Phone, or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-luxury w-full pl-12"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card-luxury p-12 text-center">
          <Users className="w-12 h-12 text-ink-600 mx-auto mb-3" />
          <p className="text-ink-600">No customers found</p>
        </div>
      ) : (
        <div className="card-luxury overflow-hidden">
          <div className="overflow-x-auto scrollbar-luxury">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-600 border-b border-white/5">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Total Orders</th>
                  <th className="px-4 py-3 font-medium">Total Spent</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-ink-200">{customer.name ?? 'Guest'}</td>
                    <td className="px-4 py-3 text-ink-200">{customer.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-200">{customer.email ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-200">{customer.total_orders}</td>
                    <td className="px-4 py-3 text-nirvana-300">{formatCurrency(customer.total_spent)}</td>
                    <td className="px-4 py-3 text-ink-600">{formatDate(customer.created_at)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => viewCustomer(customer)} className="w-8 h-8 flex items-center justify-center glass rounded-lg hover:bg-nirvana-400/10">
                        <Eye className="w-4 h-4 text-nirvana-300" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedCustomer(null)}>
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg glass-dark border border-nirvana-400/20 rounded-2xl p-6 max-h-[90vh] overflow-y-auto scrollbar-luxury animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-ink-950">Customer Details</h3>
              <button onClick={() => setSelectedCustomer(null)} className="w-9 h-9 flex items-center justify-center glass rounded-lg hover:bg-white/10">
                <X className="w-5 h-5 text-ink-300" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="glass rounded-xl p-3 text-center">
                <ShoppingBag className="w-5 h-5 text-nirvana-400 mx-auto mb-1" />
                <p className="text-lg font-serif text-ink-100">{selectedCustomer.customer.total_orders}</p>
                <p className="text-xs text-ink-600">Orders</p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <DollarSign className="w-5 h-5 text-nirvana-400 mx-auto mb-1" />
                <p className="text-lg font-serif text-ink-100">{formatCurrency(selectedCustomer.customer.total_spent)}</p>
                <p className="text-xs text-ink-600">Spent</p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <Phone className="w-5 h-5 text-nirvana-400 mx-auto mb-1" />
                <p className="text-sm text-ink-200">{selectedCustomer.customer.phone ?? '—'}</p>
                <p className="text-xs text-ink-600">Phone</p>
              </div>
            </div>

            <h4 className="font-serif text-base text-nirvana-300 mb-3">Order History</h4>
            {selectedCustomer.orders.length === 0 ? (
              <p className="text-sm text-ink-600 py-4 text-center">No orders yet</p>
            ) : (
              <div className="space-y-2">
                {selectedCustomer.orders.map((order) => (
                  <div key={order.id} className="glass rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-ink-100">{order.order_number}</p>
                      <p className="text-xs text-ink-600">Table {order.table_number} · {formatDateTime(order.created_at)}</p>
                    </div>
                    <span className="text-sm text-nirvana-300">{formatCurrency(order.total_amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
