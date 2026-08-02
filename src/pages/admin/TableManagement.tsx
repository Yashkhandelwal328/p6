import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Table2, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Table, TableStatus } from '@/types';

const STATUS_COLORS: Record<TableStatus, string> = {
  available: 'bg-green-500/15 text-green-400 border-green-500/30',
  occupied: 'bg-red-500/15 text-red-400 border-red-500/30',
  reserved: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  cleaning: 'bg-ink-500/15 text-ink-600 border-ink-500/30',
};

export function TableManagement() {
  const { restaurantId } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  useEffect(() => { loadData(); }, [restaurantId]);

  async function loadData() {
    const { data } = await supabase.from('tables').select('*').eq('restaurant_id', restaurantId).order('table_number');
    setTables(data ?? []);
    setLoading(false);
  }

  const handleSave = useCallback(async (formData: Partial<Table>) => {
    if (editingTable) {
      await supabase.from('tables').update(formData).eq('id', editingTable.id);
    } else {
      const tableNum = formData.table_number as number;
      const qrToken = `nirvana-tbl-${String(tableNum).padStart(3, '0')}-${Math.random().toString(36).substring(2, 10)}`;
      await supabase.from('tables').insert({ ...formData, restaurant_id: restaurantId, qr_token: qrToken });
    }
    setShowForm(false);
    setEditingTable(null);
    loadData();
  }, [editingTable, restaurantId]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this table?')) return;
    await supabase.from('tables').delete().eq('id', id);
    loadData();
  }, []);

  const updateStatus = useCallback(async (table: Table, status: TableStatus) => {
    await supabase.from('tables').update({ status }).eq('id', table.id);
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
          <h1 className="font-serif text-2xl sm:text-3xl text-ink-950 mb-1">Table Management</h1>
          <p className="text-sm text-ink-600">{tables.length} tables · {tables.filter(t => t.status === 'occupied').length} occupied</p>
        </div>
        <button onClick={() => { setEditingTable(null); setShowForm(true); }} className="btn-gold flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Table
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map((table) => (
          <div key={table.id} className="card-luxury p-4 text-center">
            <div className={`w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center border ${STATUS_COLORS[table.status]}`}>
              <Table2 className="w-7 h-7" />
            </div>
            <p className="font-serif text-lg text-ink-100">{table.name ?? `Table ${table.table_number}`}</p>
            <p className="text-xs text-ink-600 mb-2 flex items-center justify-center gap-1">
              <Users className="w-3 h-3" /> {table.capacity} seats
            </p>
            <select
              value={table.status}
              onChange={(e) => updateStatus(table, e.target.value as TableStatus)}
              className={`text-xs px-2 py-1 rounded-full border ${STATUS_COLORS[table.status]} bg-transparent capitalize cursor-pointer`}
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="cleaning">Cleaning</option>
            </select>
            <div className="flex gap-1 mt-3 justify-center">
              <button onClick={() => { setEditingTable(table); setShowForm(true); }} className="w-7 h-7 flex items-center justify-center glass rounded hover:bg-nirvana-400/10">
                <Edit2 className="w-3.5 h-3.5 text-nirvana-300" />
              </button>
              <button onClick={() => handleDelete(table.id)} className="w-7 h-7 flex items-center justify-center glass rounded hover:bg-red-500/10">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <TableForm
          table={editingTable}
          onClose={() => { setShowForm(false); setEditingTable(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function TableForm({ table, onClose, onSave }: {
  table: Table | null;
  onClose: () => void;
  onSave: (data: Partial<Table>) => void;
}) {
  const [formData, setFormData] = useState({
    table_number: table?.table_number ?? '',
    name: table?.name ?? '',
    capacity: table?.capacity ?? 4,
    status: table?.status ?? 'available',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      table_number: Number(formData.table_number),
      name: formData.name || `Table ${formData.table_number}`,
      capacity: Number(formData.capacity),
      status: formData.status as TableStatus,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" />
      <form onSubmit={handleSubmit} className="relative w-full max-w-md glass-dark border border-nirvana-400/20 rounded-2xl p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-xl text-ink-950">{table ? 'Edit Table' : 'Add Table'}</h3>
          <button type="button" onClick={onClose} className="w-9 h-9 flex items-center justify-center glass rounded-lg hover:bg-white/10">
            <X className="w-5 h-5 text-ink-300" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-ink-300 mb-1.5">Table Number</label>
            <input type="number" required min="1" value={formData.table_number} onChange={(e) => setFormData({ ...formData, table_number: e.target.value })} className="input-luxury w-full" />
          </div>
          <div>
            <label className="block text-sm text-ink-300 mb-1.5">Name (optional)</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Table 1" className="input-luxury w-full" />
          </div>
          <div>
            <label className="block text-sm text-ink-300 mb-1.5">Capacity (seats)</label>
            <input type="number" min="1" max="20" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })} className="input-luxury w-full" />
          </div>
          <div>
            <label className="block text-sm text-ink-300 mb-1.5">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as TableStatus })} className="input-luxury w-full">
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="cleaning">Cleaning</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="btn-outline-gold flex-1">Cancel</button>
          <button type="submit" className="btn-gold flex-1">{table ? 'Save' : 'Add'}</button>
        </div>
      </form>
    </div>
  );
}
