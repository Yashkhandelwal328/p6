import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, X, Utensils, Leaf, Flame, Star, Clock, ChefHat, ArrowUp, ArrowDown, Upload, ImageOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/format';
import type { MenuItem, Category } from '@/types';
import { suggestImage } from '@/lib/suggestImage';

export function MenuManagement() {
  const { restaurantId } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (restaurantId) loadData();
  }, [restaurantId]);

  async function loadData() {
    if (!restaurantId) return;
    const [itemsRes, catRes] = await Promise.all([
      supabase.from('menu_items').select('*').eq('restaurant_id', restaurantId).order('sort_order'),
      supabase.from('categories').select('*').eq('restaurant_id', restaurantId).order('sort_order'),
    ]);
    setItems(itemsRes.data ?? []);
    setCategories(catRes.data ?? []);
    setLoading(false);
  }

  const filteredItems = items.filter((item) => {
    if (filterCategory !== 'all' && item.category_id !== filterCategory) return false;
    if (searchQuery.trim()) return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });

  const handleSave = useCallback(async (formData: Partial<MenuItem>) => {
    if (editingItem) {
      await supabase.from('menu_items').update(formData).eq('id', editingItem.id);
    } else {
      await supabase.from('menu_items').insert({ ...formData, restaurant_id: restaurantId });
    }
    setShowForm(false);
    setEditingItem(null);
    loadData();
  }, [editingItem, restaurantId]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this menu item? This cannot be undone.')) return;
    await supabase.from('menu_items').delete().eq('id', id);
    loadData();
  }, []);

  const toggleAvailability = useCallback(async (item: MenuItem) => {
    await supabase.from('menu_items').update({ is_available: !item.is_available }).eq('id', item.id);
    loadData();
  }, []);

  const toggleBestseller = useCallback(async (item: MenuItem) => {
    await supabase.from('menu_items').update({ is_bestseller: !item.is_bestseller }).eq('id', item.id);
    loadData();
  }, []);

  const toggleChefSpecial = useCallback(async (item: MenuItem) => {
    await supabase.from('menu_items').update({ is_chef_special: !item.is_chef_special }).eq('id', item.id);
    loadData();
  }, []);

  const moveItem = useCallback(async (item: MenuItem, direction: 'up' | 'down') => {
    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((i) => i.id === item.id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sorted.length - 1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const swapItem = sorted[swapIdx];
    await Promise.all([
      supabase.from('menu_items').update({ sort_order: swapItem.sort_order }).eq('id', item.id),
      supabase.from('menu_items').update({ sort_order: item.sort_order }).eq('id', swapItem.id),
    ]);
    loadData();
  }, [items]);

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
          <h1 className="font-serif text-2xl sm:text-3xl text-ink-950 mb-1">Menu Management</h1>
          <p className="text-sm text-ink-600">{items.length} items across {categories.length} categories</p>
        </div>
        <button onClick={() => { setEditingItem(null); setShowForm(true); }} className="btn-gold flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Item
        </button>
      </div>

      <div className="card-luxury p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-600" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-luxury w-full pl-12"
          />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input-luxury !w-auto">
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item, idx) => {
          const cat = categories.find((c) => c.id === item.category_id);
          return (
            <div key={item.id} className={`card-luxury overflow-hidden ${!item.is_available ? 'opacity-60' : ''}`}>
              <div className="relative h-32 overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-ink-800 flex items-center justify-center">
                    <Utensils className="w-10 h-10 text-ink-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className={`badge ${item.is_veg ? 'bg-green-500/90 text-white border-green-400' : 'bg-red-500/90 text-white border-red-400'}`}>
                    {item.is_veg ? <Leaf className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                  </span>
                  {item.is_bestseller && (
                    <span className="badge bg-nirvana-400/90 text-ink-950 border-nirvana-300" title="Bestseller">
                      <Star className="w-3 h-3 fill-current" />
                    </span>
                  )}
                  {item.is_chef_special && (
                    <span className="badge bg-amber-500/90 text-ink-950 border-amber-400" title="Chef's Special">
                      <ChefHat className="w-3 h-3" />
                    </span>
                  )}
                </div>
                {!item.is_available && (
                  <div className="absolute inset-0 bg-ink-950/60 flex items-center justify-center">
                    <span className="badge bg-red-500/90 text-white border-red-400">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-serif text-base text-ink-950">{item.name}</h3>
                  <div className="flex gap-0.5">
                    <button onClick={() => moveItem(item, 'up')} className="w-6 h-6 flex items-center justify-center glass rounded hover:bg-nirvana-400/10" title="Move up">
                      <ArrowUp className="w-3 h-3 text-nirvana-300" />
                    </button>
                    <button onClick={() => moveItem(item, 'down')} className="w-6 h-6 flex items-center justify-center glass rounded hover:bg-nirvana-400/10" title="Move down">
                      <ArrowDown className="w-3 h-3 text-ink-800" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-ink-700 mb-2">{cat?.name ?? 'Uncategorized'}</p>
                <p className="text-sm text-ink-800 line-clamp-2 leading-relaxed mb-2">{item.description}</p>
                <div className="flex items-center gap-2 text-xs text-ink-700 mb-3">
                  <Clock className="w-3 h-3" /> {item.preparation_time_minutes} min
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    {item.has_half_price && item.half_price ? (
                      <p className="text-sm font-semibold text-ink-950">
                        {formatCurrency(item.half_price)} / {formatCurrency(item.full_price)}
                      </p>
                    ) : (
                      <p className="text-sm font-semibold text-ink-950">{formatCurrency(item.full_price)}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => { setEditingItem(item); setShowForm(true); }} className="flex-1 btn-outline-gold !py-2 text-sm flex items-center justify-center gap-1 min-w-[60px]">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => toggleAvailability(item)} className="btn-outline-gold !py-2 !px-2.5 text-xs" title={item.is_available ? 'Mark unavailable' : 'Mark available'}>
                    {item.is_available ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => toggleBestseller(item)} className={`btn-outline-gold !py-2 !px-2.5 text-xs ${item.is_bestseller ? 'border-nirvana-400/50 text-nirvana-900' : ''}`} title="Toggle Bestseller">
                    <Star className={`w-3.5 h-3.5 ${item.is_bestseller ? 'fill-current' : ''}`} />
                  </button>
                  <button onClick={() => toggleChefSpecial(item)} className={`btn-outline-gold !py-2 !px-2.5 text-xs ${item.is_chef_special ? 'border-amber-400/50 text-amber-900' : ''}`} title="Toggle Chef's Special">
                    <ChefHat className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="btn-outline-gold !py-2 !px-2.5 text-sm border-red-500/30 text-red-700 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <MenuForm
          item={editingItem}
          categories={categories}
          restaurantId={restaurantId}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function MenuForm({ item, categories, restaurantId, onClose, onSave }: {
  item: MenuItem | null;
  categories: Category[];
  restaurantId: string | null;
  onClose: () => void;
  onSave: (data: Partial<MenuItem>) => void;
}) {
  const [formData, setFormData] = useState({
    name: item?.name ?? '',
    description: item?.description ?? '',
    image_url: item?.image_url ?? '',
    category_id: item?.category_id ?? categories[0]?.id ?? '',
    is_veg: item?.is_veg ?? true,
    has_half_price: item?.has_half_price ?? false,
    half_price: item?.half_price ?? '',
    full_price: item?.full_price ?? '',
    preparation_time_minutes: item?.preparation_time_minutes ?? 15,
    is_available: item?.is_available ?? true,
    is_bestseller: item?.is_bestseller ?? false,
    is_chef_special: item?.is_chef_special ?? false,
    sort_order: item?.sort_order ?? 0,
  });
  const [uploading, setUploading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item && formData.name !== item.name && formData.name.length > 2) {
      const timer = setTimeout(() => {
        handleSuggestImage();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData.name, item]);

  async function handleImageUpload(file: File) {
    if (!restaurantId) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `menu-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `${restaurantId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);

      if (urlData.publicUrl) {
        setFormData((prev) => ({ ...prev, image_url: urlData.publicUrl }));
      }
    } catch (err) {
      alert(`Failed to upload image: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    setFormData((prev) => ({ ...prev, image_url: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setImageError('');
    
    // Check if the image URL is already in use
    if (formData.image_url) {
      const { data, error } = await supabase
        .from('menu_items')
        .select('id')
        .eq('image_url', formData.image_url)
        .neq('id', item?.id || '00000000-0000-0000-0000-000000000000')
        .limit(1);
        
      if (data && data.length > 0) {
        setImageError('This image is already used by another menu item. Please choose a different image.');
        return;
      }
    }

    onSave({
      ...formData,
      half_price: formData.half_price ? Number(formData.half_price) : null,
      full_price: Number(formData.full_price),
    });
  }

  async function handleSuggestImage() {
    if (!formData.name) return;
    setSuggesting(true);
    setImageError('');
    try {
      const url = await suggestImage(formData.name);
      if (url) {
        setFormData((prev) => ({ ...prev, image_url: url }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSuggesting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" />
      <form onSubmit={handleSubmit} className="relative w-full max-w-lg glass-dark border border-nirvana-400/20 rounded-2xl p-6 max-h-[90vh] overflow-y-auto scrollbar-luxury animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-xl text-white">{item ? 'Edit Item' : 'Add Menu Item'}</h3>
          <button type="button" onClick={onClose} className="w-9 h-9 flex items-center justify-center glass rounded-lg hover:bg-white/10">
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Name</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-luxury w-full" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="input-luxury w-full resize-none" />
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Food Image</label>
            {formData.image_url ? (
              <div className="relative rounded-xl overflow-hidden h-32 group">
                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-ink-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-gold !py-1.5 !px-3 text-xs flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" /> Replace
                  </button>
                  <button type="button" onClick={removeImage} className="btn-outline-gold text-white !py-1.5 !px-3 text-xs border-red-500/30 text-red-400 flex items-center gap-1">
                    <ImageOff className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 p-4 rounded-xl border border-dashed border-nirvana-400/30 hover:border-nirvana-400/50 hover:bg-nirvana-400/5 transition-all flex flex-col items-center justify-center gap-2"
                >
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-nirvana-400/30 border-t-nirvana-400 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm text-gray-400">Click to upload image</span>
                    </>
                  )}
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
            <div className="flex gap-2 mt-2">
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => {
                  setFormData({ ...formData, image_url: e.target.value });
                  setImageError('');
                }}
                placeholder="Or paste image URL..."
                className="input-luxury flex-1 text-xs"
              />
              <button
                type="button"
                onClick={handleSuggestImage}
                disabled={suggesting || !formData.name}
                className="btn-outline-gold text-white !py-2 !px-3 text-xs whitespace-nowrap flex items-center gap-1"
              >
                {suggesting ? (
                  <div className="w-3.5 h-3.5 border-2 border-nirvana-400/30 border-t-nirvana-400 rounded-full animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                Suggest
              </button>
            </div>
            {imageError && (
              <p className="text-red-400 text-xs mt-2">{imageError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Category</label>
            <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="input-luxury w-full">
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Full Price (₹)</label>
              <input type="number" required step="0.01" value={formData.full_price} onChange={(e) => setFormData({ ...formData, full_price: e.target.value })} className="input-luxury w-full" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Prep Time (min)</label>
              <input type="number" value={formData.preparation_time_minutes} onChange={(e) => setFormData({ ...formData, preparation_time_minutes: Number(e.target.value) })} className="input-luxury w-full" />
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={formData.is_veg} onChange={(e) => setFormData({ ...formData, is_veg: e.target.checked })} className="accent-nirvana-400" />
              Vegetarian
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={formData.has_half_price} onChange={(e) => setFormData({ ...formData, has_half_price: e.target.checked })} className="accent-nirvana-400" />
              Has Half Price
            </label>
          </div>
          {formData.has_half_price && (
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Half Price (₹)</label>
              <input type="number" step="0.01" value={formData.half_price} onChange={(e) => setFormData({ ...formData, half_price: e.target.value })} className="input-luxury w-full" />
            </div>
          )}
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={formData.is_available} onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })} className="accent-nirvana-400" />
              Available
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={formData.is_bestseller} onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })} className="accent-nirvana-400" />
              Bestseller
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={formData.is_chef_special} onChange={(e) => setFormData({ ...formData, is_chef_special: e.target.checked })} className="accent-amber-500" />
              Chef's Special
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="btn-outline-gold text-white flex-1">Cancel</button>
          <button type="submit" className="btn-gold flex-1">{item ? 'Save Changes' : 'Add Item'}</button>
        </div>
      </form>
    </div>
  );
}
