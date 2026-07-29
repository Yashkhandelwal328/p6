import { useEffect, useState, useRef } from 'react';
import { QrCode, Download, Table2, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Table } from '@/types';

export function QRCodeGenerator() {
  const { restaurantId } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('tables').select('*').eq('restaurant_id', restaurantId).order('table_number');
      setTables(data ?? []);
      if (data && data.length > 0) setSelectedTable(data[0]);
      setLoading(false);
    }
    loadData();
  }, [restaurantId]);

  useEffect(() => {
    if (!selectedTable) return;
    const orderUrl = `${window.location.origin}/order?table=${selectedTable.table_number}`;
    generateQR(orderUrl);
  }, [selectedTable]);

  async function generateQR(text: string) {
    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: 400,
        margin: 2,
        color: { dark: '#0d0c0a', light: '#c9a227' },
      });
      setQrDataUrl(dataUrl);

      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, text, {
          width: 300,
          margin: 2,
          color: { dark: '#0d0c0a', light: '#c9a227' },
        });
      }
    } catch (err) {
      console.error('QR generation failed:', err);
    }
  }

  function downloadQR() {
    if (!qrDataUrl || !selectedTable) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `nirvana-table-${selectedTable.table_number}-qr.png`;
    link.click();
  }

  function copyUrl() {
    if (!selectedTable) return;
    const url = `${window.location.origin}/order?table=${selectedTable.table_number}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadAll() {
    tables.forEach((table, idx) => {
      setTimeout(async () => {
        const url = `${window.location.origin}/order?table=${table.table_number}`;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 400, margin: 2,
          color: { dark: '#0d0c0a', light: '#c9a227' },
        });
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `nirvana-table-${table.table_number}-qr.png`;
        link.click();
      }, idx * 300);
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-2 border-nirvana-400/30 border-t-nirvana-400 rounded-full animate-spin" />
      </div>
    );
  }

  const orderUrl = selectedTable ? `${window.location.origin}/order?table=${selectedTable.table_number}` : '';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-gradient-gold mb-1 flex items-center gap-2">
            <QrCode className="w-7 h-7" /> QR Code Generator
          </h1>
          <p className="text-sm text-ink-400">Generate and download QR codes for each table</p>
        </div>
        <button onClick={downloadAll} className="btn-gold flex items-center gap-2">
          <Download className="w-5 h-5" /> Download All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Selector */}
        <div className="card-luxury p-5">
          <h3 className="font-serif text-lg text-nirvana-300 mb-4">Select a Table</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`p-4 rounded-xl border transition-all ${
                  selectedTable?.id === table.id
                    ? 'bg-nirvana-400/15 border-nirvana-400/40 shadow-gold'
                    : 'glass-dark border-white/5 hover:border-nirvana-400/20'
                }`}
              >
                <Table2 className="w-6 h-6 mx-auto mb-1 text-nirvana-300" />
                <p className="text-sm font-medium text-ink-100">Table {table.table_number}</p>
                <p className="text-xs text-ink-400">{table.capacity} seats</p>
              </button>
            ))}
          </div>
        </div>

        {/* QR Preview */}
        <div className="card-luxury p-5">
          <h3 className="font-serif text-lg text-nirvana-300 mb-4">QR Code Preview</h3>
          {selectedTable ? (
            <div className="text-center">
              <div className="inline-block p-4 bg-nirvana-400 rounded-2xl mb-4">
                <canvas ref={canvasRef} className="rounded-lg" />
              </div>
              <p className="font-serif text-lg text-ink-100 mb-1">Table {selectedTable.table_number}</p>
              <p className="text-xs text-ink-400 mb-4 break-all">{orderUrl}</p>
              <div className="flex gap-2 justify-center">
                <button onClick={downloadQR} className="btn-gold flex items-center gap-2 !py-2 text-sm">
                  <Download className="w-4 h-4" /> Download PNG
                </button>
                <button onClick={copyUrl} className="btn-outline-gold flex items-center gap-2 !py-2 text-sm">
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy URL'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-ink-400 text-center py-8">Select a table to generate QR code</p>
          )}
        </div>
      </div>
    </div>
  );
}
