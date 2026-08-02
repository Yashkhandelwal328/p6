import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, FolderTree, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Category } from '@/types';

export function CategoryManagement() {
  const { restaurantId } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  useEffect(() => { loadData(); }, [restaurantId]);

  async function loadData() {
    const { data } = await supabase.from('categories').select('*').eq('restaurant_id', restaurantId).order('sort_order');
    setCategories(data ?? []);
    setLoading(false);
  }

  const handleSave = useCallback(async (formData: Partial<Category>) => {
    if (editingCat) {
      await supabase.from('categories').update(formData).eq('id', editingCat.id);
    } else {
      await supabase.from('categories').insert({ ...formData, restaurant_id: restaurantId });
    }
    setShowForm(false);
    setEditingCat(null);
    loadData();
  }, [editingCat, restaurantId]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this category? Menu items in this category will remain but become uncategorized.')) return;
    await supabase.from('categories').delete().eq('id', id);
    loadData();
  }, []);

  const toggleActive = useCallback(async (cat: Category) => {
    await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id);
    loadData();
  }, []);

  const topLevel = categories.filter((c) => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order);
  const getChildren = (parentId: string) => categories.filter((c) => c.parent_id === parentId).sort((a, b) => a.sort_order - b.sort_order);

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
          <h1 className="font-serif text-2xl sm:text-3xl text-ink-950 mb-1">Category Management</h1>
          <p className="text-sm text-ink-600">{topLevel.length} categories with sub-categories</p>
        </div>
        <button onClick={() => { setEditingCat(null); setShowForm(true); }} className="btn-gold flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </div>

      <div className="space-y-3">
        {topLevel.map((cat) => (
          <div key={cat.id} className="card-luxury p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl glass-gold flex items-center justify-center">
                  <FolderTree className="w-5 h-5 text-nirvana-400" />
                </div>
                <div>
                  <p className="font-serif text-base text-ink-100">{cat.name}</p>
                  <p className="text-xs text-ink-600">/{cat.slug} · Order {cat.sort_order}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${cat.is_active ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-ink-500/15 text-ink-600 border-ink-500/30'}`}>
                  {cat.is_active ? 'Active' : 'Inactive'}
                </span>
                <button onClick={() => { setEditingCat(cat); setShowForm(true); }} className="w-8 h-8 flex items-center justify-center glass rounded-lg hover:bg-nirvana-400/10">
                  <Edit2 className="w-4 h-4 text-nirvana-300" />
                </button>
                <button onClick={() => toggleActive(cat)} className="btn-outline-gold !py-1.5 !px-3 text-xs">
                  {cat.is_active ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => handleDelete(cat.id)} className="w-8 h-8 flex items-center justify-center glass rounded-lg hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            {getChildren(cat.id).length > 0 && (
              <div className="mt-3 pl-13 space-y-2 border-l border-white/5 pl-4">
                {getChildren(cat.id).map((child) => (
                  <div key={child.id} className="flex items-center justify-between glass rounded-lg p-2.5">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-ink-500" />
                      <span className="text-sm text-ink-200">{child.name}</span>
                      <span className="text-xs text-ink-600">/{child.slug}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingCat(child); setShowForm(true); }} className="w-7 h-7 flex items-center justify-center glass rounded hover:bg-nirvana-400/10">
                        <Edit2 className="w-3.5 h-3.5 text-nirvana-300" />
                      </button>
                      <button onClick={() => handleDelete(child.id)} className="w-7 h-7 flex items-center justify-center glass rounded hover:bg-red-500/10">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <CategoryForm
          category={editingCat}
          categories={topLevel}
          onClose={() => { setShowForm(false); setEditingCat(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function CategoryForm({ category, categories, onClose, onSave }: {
  category: Category | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: Partial<Category>) => void;
}) {
  const [formData, setFormData] = useState({
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    parent_id: category?.parent_id ?? '',
    sort_order: category?.sort_order ?? 0,
    icon: category?.icon ?? '',
    is_active: category?.is_active ?? true,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...formData,
      parent_id: formData.parent_id || null,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" />
      <form onSubmit={handleSubmit} className="relative w-full max-w-md glass-dark border border-nirvana-400/20 rounded-2xl p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-xl text-ink-950">{category ? 'Edit Category' : 'Add Category'}</h3>
          <button type="button" onClick={onClose} className="w-9 h-9 flex items-center justify-center glass rounded-lg hover:bg-white/10">
            <X className="w-5 h-5 text-ink-300" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-ink-300 mb-1.5">Name</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-luxury w-full" />
          </div>
          <div>
            <label className="block text-sm text-ink-300 mb-1.5">Slug (URL-friendly name)</label>
            <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="auto-generated from name" className="input-luxury w-full" />
          </div>
          <div>
            <label className="block text-sm text-ink-300 mb-1.5">Parent Category (leave empty for top-level)</label>
            <select value={formData.parent_id} onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })} className="input-luxury w-full">
              <option value="">None (Top-level)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Sort Order</label>
              <input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })} className="input-luxury w-full" />
            </div>
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Icon Name</label>
              <input type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="lucide icon name" className="input-luxury w-full" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-300 cursor-pointer">
            <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="accent-nirvana-400" />
            Active
          </label>
        </div>
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="btn-outline-gold flex-1">Cancel</button>
          <button type="submit" className="btn-gold flex-1">{category ? 'Save' : 'Add'}</button>
        </div>
      </form>
    </div>
  );
}
