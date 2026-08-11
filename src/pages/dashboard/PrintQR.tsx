import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Printer, QrCode } from 'lucide-react';
import type { Room, QRTemplate } from '@/types';

export function PrintQR() {
  const { restaurantId } = useAuth();
  const [activeTab, setActiveTab] = useState<'table' | 'room'>('room');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tables, setTables] = useState<{ id: string; table_number: number }[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [template, setTemplate] = useState<QRTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurantId) {
      loadData();
    }
  }, [restaurantId, activeTab]);

  async function loadData() {
    setLoading(true);
    try {
      if (activeTab === 'room') {
        const { data } = await supabase
          .from('rooms')
          .select('*')
          .eq('restaurant_id', restaurantId!)
          .order('room_number');
        setRooms(data || []);
      } else {
        const { data } = await supabase
          .from('tables')
          .select('id, table_number')
          .eq('restaurant_id', restaurantId!)
          .order('table_number');
        setTables(data || []);
      }

      const { data: tmpl } = await supabase
        .from('qr_templates')
        .select('*')
        .eq('restaurant_id', restaurantId!)
        .eq('type', activeTab)
        .eq('is_default', true)
        .maybeSingle();
      
      setTemplate(tmpl);
      setSelectedId('');
    } catch (err) {
      console.error('Error loading data for print:', err);
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    if (!selectedId) {
      alert('Please select a room or table first.');
      return;
    }
    window.print();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hide controls when printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Printer className="w-6 h-6" />
            Print QR
          </h1>
          <p className="text-theme-secondary">Preview and download or print the QR code.</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-theme-border pb-4">
        <button
          onClick={() => setActiveTab('room')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'room' ? 'bg-primary text-primary-foreground' : 'bg-surface text-theme-secondary border border-theme-border hover:bg-white/5'
          }`}
        >
          Room QR Preview
        </button>
        <button
          onClick={() => setActiveTab('table')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'table' ? 'bg-primary text-primary-foreground' : 'bg-surface text-theme-secondary border border-theme-border hover:bg-white/5'
          }`}
        >
          Table QR Preview
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-surface border border-theme-border rounded-xl p-5">
            <label className="block text-sm font-bold text-theme-primary mb-3 uppercase tracking-wider">
              Select {activeTab === 'room' ? 'Room' : 'Table'}
            </label>
            {loading ? (
              <div className="text-sm text-theme-secondary">Loading...</div>
            ) : (
              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                className="w-full px-3 py-2.5 bg-background border border-theme-border rounded-lg text-theme-primary focus:outline-none focus:border-primary"
              >
                <option value="">-- Choose {activeTab} --</option>
                {activeTab === 'room' 
                  ? rooms.map(r => <option key={r.id} value={r.id}>Room {r.room_number}</option>)
                  : tables.map(t => <option key={t.id} value={t.id}>Table {t.table_number}</option>)
                }
              </select>
            )}
            
            <button
              onClick={handlePrint}
              disabled={!selectedId}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Card
            </button>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="bg-surface border border-theme-border rounded-xl p-8 min-h-[500px] flex items-center justify-center">
            {!selectedId ? (
              <div className="text-center text-theme-secondary">
                <QrCode className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No {activeTab} selected</p>
                <p className="text-sm opacity-70">Select a {activeTab} to preview printable QR card.</p>
              </div>
            ) : (
              <div id="print-area" className="w-[400px] aspect-[1/1.4] bg-white rounded-2xl shadow-xl p-8 flex flex-col relative overflow-hidden">
                {/* Fallback Template Design */}
                <div className="flex-1 border-4 border-black/10 rounded-xl p-6 flex flex-col items-center justify-center text-black">
                  <h2 className="text-2xl font-bold font-serif mb-2">Scan to Order</h2>
                  <p className="text-sm text-gray-500 mb-8 text-center">
                    {activeTab === 'room' ? 'Room Service Menu' : 'Table Menu'}
                  </p>
                  
                  <div className="w-48 h-48 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center mb-8">
                    <QrCode className="w-32 h-32 text-black" />
                  </div>
                  
                  <div className="mt-auto pt-6 border-t border-gray-200 w-full text-center">
                    <span className="text-lg font-bold">
                      {activeTab === 'room' 
                        ? `ROOM ${rooms.find(r => r.id === selectedId)?.room_number}`
                        : `TABLE ${tables.find(t => t.id === selectedId)?.table_number}`
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
