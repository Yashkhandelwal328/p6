import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, UserCog, Mail, Phone, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Staff, StaffRole } from '@/types';

const ROLE_COLORS: Record<StaffRole, string> = {
  super_admin: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  owner: 'bg-nirvana-400/15 text-nirvana-300 border-nirvana-400/30',
  manager: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  cashier: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  chef: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  waiter: 'bg-green-500/15 text-green-400 border-green-500/30',
};

export function StaffManagement() {
  const { restaurantId } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  useEffect(() => { loadData(); }, [restaurantId]);

  async function loadData() {
    const { data } = await supabase.from('staff').select('*').eq('restaurant_id', restaurantId).order('created_at');
    setStaff(data ?? []);
    setLoading(false);
  }

  const handleSave = useCallback(async (formData: { name: string; email: string; phone: string; role: StaffRole; is_active: boolean; password?: string }) => {
    if (editingStaff) {
      await supabase.from('staff').update({
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        is_active: formData.is_active,
      }).eq('id', editingStaff.id);
    } else {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password || 'nirvana123',
      });

      if (authError) {
        alert(`Failed to create auth account: ${authError.message}`);
        return;
      }

      if (authData.user) {
        await supabase.from('staff').insert({
          restaurant_id: restaurantId,
          user_id: authData.user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          is_active: formData.is_active,
        });
      }
    }
    setShowForm(false);
    setEditingStaff(null);
    loadData();
  }, [editingStaff, restaurantId]);

  const handleDelete = useCallback(async (s: Staff) => {
    if (!confirm(`Remove ${s.name} from staff?`)) return;
    await supabase.from('staff').delete().eq('id', s.id);
    loadData();
  }, []);

  const toggleActive = useCallback(async (s: Staff) => {
    await supabase.from('staff').update({ is_active: !s.is_active }).eq('id', s.id);
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-2 border-nirvana-400/30 border-t-nirvana-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink-950 mb-1 flex items-center gap-2">
            <UserCog className="w-7 h-7" /> Staff Management
          </h1>
          <p className="text-sm text-ink-600">{staff.length} staff members</p>
        </div>
        <button onClick={() => { setEditingStaff(null); setShowForm(true); }} className="btn-gold flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Staff
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((s) => (
          <div key={s.id} className="card-luxury p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-full bg-nirvana-400/15 flex items-center justify-center">
                <span className="text-nirvana-300 font-serif text-lg">{s.name.charAt(0).toUpperCase()}</span>
              </div>
              <span className={`badge capitalize ${ROLE_COLORS[s.role]}`}>
                <Shield className="w-3 h-3" /> {s.role.replace('_', ' ')}
              </span>
            </div>
            <h3 className="font-serif text-lg text-ink-950 mb-1">{s.name}</h3>
            <div className="space-y-1 mb-3">
              <p className="text-xs text-ink-600 flex items-center gap-1"><Mail className="w-3 h-3" /> {s.email}</p>
              {s.phone && <p className="text-xs text-ink-600 flex items-center gap-1"><Phone className="w-3 h-3" /> {s.phone}</p>}
            </div>
            <div className="flex items-center justify-between">
              <span className={`badge ${s.is_active ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-ink-500/15 text-ink-600 border-ink-500/30'}`}>
                {s.is_active ? 'Active' : 'Inactive'}
              </span>
              <div className="flex gap-1">
                <button onClick={() => { setEditingStaff(s); setShowForm(true); }} className="w-7 h-7 flex items-center justify-center glass rounded hover:bg-nirvana-400/10">
                  <Edit2 className="w-3.5 h-3.5 text-nirvana-300" />
                </button>
                <button onClick={() => toggleActive(s)} className="btn-outline-gold !py-1 !px-2 text-xs">
                  {s.is_active ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => handleDelete(s)} className="w-7 h-7 flex items-center justify-center glass rounded hover:bg-red-500/10">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <StaffForm
          staff={editingStaff}
          onClose={() => { setShowForm(false); setEditingStaff(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function StaffForm({ staff, onClose, onSave }: {
  staff: Staff | null;
  onClose: () => void;
  onSave: (data: { name: string; email: string; phone: string; role: StaffRole; is_active: boolean; password?: string }) => void;
}) {
  const [formData, setFormData] = useState({
    name: staff?.name ?? '',
    email: staff?.email ?? '',
    phone: staff?.phone ?? '',
    role: staff?.role ?? 'waiter',
    is_active: staff?.is_active ?? true,
    password: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(formData);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" />
      <form onSubmit={handleSubmit} className="relative w-full max-w-md glass-dark border border-nirvana-400/20 rounded-2xl p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-xl text-ink-950">{staff ? 'Edit Staff' : 'Add Staff Member'}</h3>
          <button type="button" onClick={onClose} className="w-9 h-9 flex items-center justify-center glass rounded-lg hover:bg-white/10">
            <X className="w-5 h-5 text-ink-700" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-ink-700 mb-1.5">Name</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-luxury w-full" />
          </div>
          <div>
            <label className="block text-sm text-ink-700 mb-1.5">Email</label>
            <input type="email" required disabled={!!staff} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-luxury w-full disabled:opacity-50" />
          </div>
          {!staff && (
            <div>
              <label className="block text-sm text-ink-700 mb-1.5">Password (default: nirvana123)</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="nirvana123" className="input-luxury w-full" />
            </div>
          )}
          <div>
            <label className="block text-sm text-ink-700 mb-1.5">Phone</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-luxury w-full" />
          </div>
          <div>
            <label className="block text-sm text-ink-700 mb-1.5">Role</label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })} className="input-luxury w-full">
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
              <option value="chef">Chef</option>
              <option value="waiter">Waiter</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
            <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="accent-nirvana-400" />
            Active
          </label>
        </div>
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="btn-outline-gold flex-1">Cancel</button>
          <button type="submit" className="btn-gold flex-1">{staff ? 'Save' : 'Add Staff'}</button>
        </div>
      </form>
    </div>
  );
}
