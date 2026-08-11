import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Palette, CheckCircle2 } from 'lucide-react';
import type { QRTemplate } from '@/types';

const PREDEFINED_TEMPLATES = [
  { id: 'clean-white', name: 'Clean white card', bg: 'bg-white text-black', previewUrl: '/preview-white.png' },
  { id: 'dark-neon', name: 'Black neon', bg: 'bg-gray-900 text-white', previewUrl: '/preview-dark.png' },
  { id: 'gold-luxury', name: 'Elegant cream and gold', bg: 'bg-[#FDFBF7] text-[#8B7355]', previewUrl: '/preview-gold.png' },
];

export function QRTemplates() {
  const { restaurantId } = useAuth();
  const [activeTab, setActiveTab] = useState<'table' | 'room'>('table');
  const [templates, setTemplates] = useState<QRTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('clean-white');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurantId) {
      loadTemplates();
    }
  }, [restaurantId, activeTab]);

  async function loadTemplates() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('qr_templates')
        .select('*')
        .eq('restaurant_id', restaurantId!)
        .eq('type', activeTab)
        .eq('is_default', true)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSelectedTemplateId(data.layout_config.baseId || 'clean-white');
      } else {
        setSelectedTemplateId('clean-white');
      }
    } catch (err) {
      console.error('Error loading template', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!restaurantId) return;
    setSaving(true);
    
    try {
      const templateData = {
        restaurant_id: restaurantId,
        name: `Default ${activeTab} template`,
        type: activeTab,
        is_default: true,
        layout_config: { baseId: selectedTemplateId }
      };

      // Upsert logic: check if exists, then update or insert
      const { data: existing } = await supabase
        .from('qr_templates')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('type', activeTab)
        .eq('is_default', true)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('qr_templates')
          .update(templateData)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('qr_templates')
          .insert([templateData]);
        if (error) throw error;
      }
      
      alert('Template saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Palette className="w-6 h-6" />
            QR Templates
          </h1>
          <p className="text-theme-secondary">Select and apply premium printable card designs.</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-theme-border pb-4">
        <button
          onClick={() => setActiveTab('table')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'table' ? 'bg-primary text-primary-foreground' : 'bg-surface text-theme-secondary border border-theme-border hover:bg-white/5'
          }`}
        >
          Table QR Templates
        </button>
        <button
          onClick={() => setActiveTab('room')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'room' ? 'bg-primary text-primary-foreground' : 'bg-surface text-theme-secondary border border-theme-border hover:bg-white/5'
          }`}
        >
          Rooms QR Templates
        </button>
      </div>

      <div className="bg-surface border border-theme-border rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-primary uppercase tracking-wide">
            QR Template Builder
          </h2>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="btn-primary !px-6"
          >
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>

        <p className="text-theme-secondary text-sm mb-6">
          Select the default design used for {activeTab} QR generation.
        </p>

        {loading ? (
          <div className="py-12 text-center text-theme-secondary">Loading templates...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {PREDEFINED_TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                  selectedTemplateId === template.id
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-theme-border bg-background hover:border-primary/50'
                }`}
              >
                {selectedTemplateId === template.id && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-xs font-bold text-primary bg-primary/20 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Selected
                  </div>
                )}
                
                <div className={`w-full h-32 rounded-lg mb-3 flex items-center justify-center font-serif text-lg ${template.bg}`}>
                  <span className="opacity-50">QR Code</span>
                </div>
                
                <h3 className="font-medium text-theme-primary text-sm">{template.name}</h3>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
