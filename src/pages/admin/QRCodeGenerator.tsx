import { useEffect, useState, useRef } from 'react';
import { QrCode, Download, Table2, Copy, Check, DoorOpen, Wifi } from 'lucide-react';
import QRCode from 'qrcode';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import type { Table, Room, WiFiSettings } from '@/types';

const SECURITY_TYPES = [
  { id: 'WPA2/WPA3 Personal', label: 'WPA2/WPA3 Personal', desc: 'Recommended for most modern routers.' },
  { id: 'WPA/WPA2 Personal', label: 'WPA/WPA2 Personal', desc: 'Universal compatibility with older devices.' },
  { id: 'WEP', label: 'WEP', desc: 'Not recommended. Low security.' },
  { id: 'Open', label: 'Open (No Password)', desc: 'Open network without password.' },
];

export function QRCodeGenerator() {
  const { restaurantId } = useAuth();
  const { restaurant } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'table' | 'room' | 'wifi'>('table');
  
  // Data state
  const [tables, setTables] = useState<Table[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [wifiSettings, setWifiSettings] = useState<WiFiSettings>({
    restaurant_id: '',
    ssid: '',
    password: '',
    security_type: 'WPA2/WPA3 Personal',
    show_name: true,
    show_password: false,
    show_qr: true,
    created_at: '',
    updated_at: '',
  });

  const [loading, setLoading] = useState(true);
  const [savingWifi, setSavingWifi] = useState(false);
  
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [subdomain, setSubdomain] = useState<string | null>(null);
  
  const getCustomerUrl = (type: 'table' | 'room', id: string | number) => {
    const tenantSlug = subdomain || restaurant?.subdomain;
    const baseUrl = tenantSlug 
      ? `${window.location.origin}/${tenantSlug}`
      : window.location.origin;
    return `${baseUrl}/menu?${type}=${id}`;
  };

  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function loadData() {
      if (!restaurantId) return;

      const { data: restData } = await supabase.from('restaurants').select('subdomain').eq('id', restaurantId).maybeSingle();
      if (restData) setSubdomain(restData.subdomain);

      const [tablesRes, roomsRes, wifiRes] = await Promise.all([
        supabase.from('tables').select('*').eq('restaurant_id', restaurantId).order('table_number'),
        supabase.from('rooms').select('*').eq('restaurant_id', restaurantId).order('room_number'),
        supabase.from('wifi_settings').select('*').eq('restaurant_id', restaurantId).maybeSingle()
      ]);

      setTables(tablesRes.data ?? []);
      if (tablesRes.data && tablesRes.data.length > 0) setSelectedTable(tablesRes.data[0]);

      setRooms(roomsRes.data ?? []);
      if (roomsRes.data && roomsRes.data.length > 0) setSelectedRoom(roomsRes.data[0]);

      if (wifiRes.data) {
        setWifiSettings(wifiRes.data);
      } else {
        setWifiSettings(prev => ({ ...prev, restaurant_id: restaurantId }));
      }

      setLoading(false);
    }
    loadData();
  }, [restaurantId]);

  useEffect(() => {
    if (activeTab === 'table') {
      if (!selectedTable) {
        setQrDataUrl('');
        return;
      }
      const orderUrl = getCustomerUrl('table', selectedTable.table_number);
      generateQR(orderUrl);
    } else if (activeTab === 'room') {
      if (!selectedRoom) {
        setQrDataUrl('');
        return;
      }
      const orderUrl = getCustomerUrl('room', selectedRoom.room_number);
      generateQR(orderUrl);
    } else if (activeTab === 'wifi') {
      if (!wifiSettings.ssid) {
        setQrDataUrl('');
        return;
      }
      let authType = 'WPA';
      if (wifiSettings.security_type === 'WEP') authType = 'WEP';
      else if (wifiSettings.security_type === 'Open') authType = 'nopass';
      const wifiString = `WIFI:T:${authType};S:${wifiSettings.ssid};P:${wifiSettings.security_type === 'Open' ? '' : (wifiSettings.password || '')};;`;
      generateQR(wifiString);
    }
  }, [selectedTable, selectedRoom, activeTab, restaurant, subdomain, wifiSettings.ssid, wifiSettings.password, wifiSettings.security_type]);

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
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    
    if (activeTab === 'table' && selectedTable) {
      link.download = `nirvana-table-${selectedTable.table_number}-qr.png`;
    } else if (activeTab === 'room' && selectedRoom) {
      link.download = `nirvana-room-${selectedRoom.room_number}-qr.png`;
    } else if (activeTab === 'wifi') {
      link.download = `nirvana-wifi-qr.png`;
    }
    
    link.click();
  }

  function copyUrl() {
    let url = '';
    if (activeTab === 'table' && selectedTable) {
      url = getCustomerUrl('table', selectedTable.table_number);
    } else if (activeTab === 'room' && selectedRoom) {
      url = getCustomerUrl('room', selectedRoom.room_number);
    }
    
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function downloadAll() {
    if (activeTab === 'table') {
      tables.forEach((table, idx) => {
        setTimeout(async () => {
          const url = getCustomerUrl('table', table.table_number);
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
    } else if (activeTab === 'room') {
      rooms.forEach((room, idx) => {
        setTimeout(async () => {
          const url = getCustomerUrl('room', room.room_number);
          const dataUrl = await QRCode.toDataURL(url, {
            width: 400, margin: 2,
            color: { dark: '#0d0c0a', light: '#c9a227' },
          });
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `nirvana-room-${room.room_number}-qr.png`;
          link.click();
        }, idx * 300);
      });
    }
  }

  async function handleSaveWifi() {
    if (!restaurantId || !wifiSettings.ssid) {
      alert('Please enter a WiFi Network Name (SSID)');
      return;
    }
    setSavingWifi(true);
    try {
      const { error } = await supabase
        .from('wifi_settings')
        .upsert({
          restaurant_id: restaurantId,
          ssid: wifiSettings.ssid,
          password: wifiSettings.password,
          security_type: wifiSettings.security_type,
          show_name: wifiSettings.show_name,
          show_password: wifiSettings.show_password,
          show_qr: wifiSettings.show_qr,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('WiFi settings saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save WiFi settings');
    } finally {
      setSavingWifi(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-2 border-nirvana-400/30 border-t-nirvana-400 rounded-full animate-spin" />
      </div>
    );
  }

  const orderUrl = activeTab === 'table' && selectedTable
    ? getCustomerUrl('table', selectedTable.table_number)
    : activeTab === 'room' && selectedRoom
    ? getCustomerUrl('room', selectedRoom.room_number)
    : '';

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink-950 mb-1 flex items-center gap-2">
            <QrCode className="w-7 h-7" /> QR Codes
          </h1>
          <p className="text-sm text-ink-600">Manage QR codes for tables, rooms, and WiFi</p>
        </div>
        {activeTab !== 'wifi' && (
          <button onClick={downloadAll} className="btn-gold flex items-center gap-2">
            <Download className="w-5 h-5" /> Download All {activeTab === 'room' ? 'Rooms' : 'Tables'}
          </button>
        )}
      </div>

      <div className="flex gap-2 border-b border-nirvana-400/20 pb-4">
        <button
          onClick={() => setActiveTab('table')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'table' ? 'bg-nirvana-400 text-ink-950 shadow-gold' : 'glass-dark text-ink-950 hover:bg-white/5 border border-nirvana-400/20'
          }`}
        >
          <Table2 className="w-4 h-4" /> Tables
        </button>
        <button
          onClick={() => setActiveTab('room')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'room' ? 'bg-nirvana-400 text-ink-950 shadow-gold' : 'glass-dark text-ink-950 hover:bg-white/5 border border-nirvana-400/20'
          }`}
        >
          <DoorOpen className="w-4 h-4" /> Rooms
        </button>
        <button
          onClick={() => setActiveTab('wifi')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'wifi' ? 'bg-nirvana-400 text-ink-950 shadow-gold' : 'glass-dark text-ink-950 hover:bg-white/5 border border-nirvana-400/20'
          }`}
        >
          <Wifi className="w-4 h-4" /> WiFi QR
        </button>
      </div>

      {activeTab === 'table' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-luxury p-5">
            <h3 className="font-serif text-lg text-nirvana-300 mb-4">Select a Table</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {tables.map((table) => {
                const isSelected = selectedTable?.id === table.id;
                return (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-nirvana-400/15 border-nirvana-400/40 shadow-gold'
                        : 'glass-dark border-white/5 hover:border-nirvana-400/20'
                    }`}
                  >
                    <Table2 className={`w-6 h-6 mx-auto mb-1 ${isSelected ? 'text-nirvana-400' : 'text-nirvana-300'}`} />
                    <p className={`text-sm font-medium ${isSelected ? 'text-ink-950' : 'text-white/90'}`}>Table {table.table_number}</p>
                    <p className={`text-xs ${isSelected ? 'text-ink-600' : 'text-white/60'}`}>{table.capacity} seats</p>
                  </button>
                );
              })}
            </div>
            {tables.length === 0 && <p className="text-ink-600 text-center py-4">No tables found.</p>}
          </div>

          <div className="card-luxury p-5">
            <h3 className="font-serif text-lg text-nirvana-300 mb-4">QR Code Preview</h3>
            {selectedTable ? (
              <div className="text-center">
                <div className="inline-block p-4 bg-nirvana-400 rounded-2xl mb-4">
                  <canvas ref={canvasRef} className="rounded-lg" />
                </div>
                <p className="font-serif text-lg text-ink-950 mb-1">Table {selectedTable.table_number}</p>
                <p className="text-xs text-ink-600 mb-4 break-all">{orderUrl}</p>
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
              <p className="text-ink-600 text-center py-8">Select a table to generate QR code</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'room' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-luxury p-5">
            <h3 className="font-serif text-lg text-nirvana-300 mb-4">Select a Room</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {rooms.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-nirvana-400/15 border-nirvana-400/40 shadow-gold'
                        : 'glass-dark border-white/5 hover:border-nirvana-400/20'
                    }`}
                  >
                    <DoorOpen className={`w-6 h-6 mx-auto mb-1 ${isSelected ? 'text-nirvana-400' : 'text-nirvana-300'}`} />
                    <p className={`text-sm font-medium ${isSelected ? 'text-ink-950' : 'text-white/90'}`}>{room.room_number}</p>
                    <p className={`text-xs ${isSelected ? 'text-ink-600' : 'text-white/60'} truncate`}>{room.room_name || 'Room'}</p>
                  </button>
                );
              })}
            </div>
            {rooms.length === 0 && <p className="text-ink-600 text-center py-4">No rooms found.</p>}
          </div>

          <div className="card-luxury p-5">
            <h3 className="font-serif text-lg text-nirvana-300 mb-4">QR Code Preview</h3>
            {selectedRoom ? (
              <div className="text-center">
                <div className="inline-block p-4 bg-nirvana-400 rounded-2xl mb-4">
                  <canvas ref={canvasRef} className="rounded-lg" />
                </div>
                <p className="font-serif text-lg text-ink-950 mb-1">Room {selectedRoom.room_number}</p>
                <p className="text-xs text-ink-600 mb-4 break-all">{orderUrl}</p>
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
              <p className="text-ink-600 text-center py-8">Select a room to generate QR code</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'wifi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="card-luxury p-5 space-y-5">
              <h3 className="font-serif text-lg text-nirvana-300 mb-4">WiFi Settings</h3>
              <div>
                <label className="block text-sm font-bold text-ink-950 mb-1">WiFi Name / SSID *</label>
                <input
                  type="text"
                  value={wifiSettings.ssid}
                  onChange={e => setWifiSettings({ ...wifiSettings, ssid: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-nirvana-400/20 rounded-xl text-ink-950 focus:outline-none focus:border-nirvana-400 placeholder:text-ink-600"
                  placeholder="Network Name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink-950 mb-1">WiFi Password *</label>
                <input
                  type="text"
                  value={wifiSettings.password || ''}
                  onChange={e => setWifiSettings({ ...wifiSettings, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-nirvana-400/20 rounded-xl text-ink-950 focus:outline-none focus:border-nirvana-400 placeholder:text-ink-600"
                  placeholder="Password"
                />
              </div>
              
              <div className="space-y-3 pt-4 border-t border-nirvana-400/20">
                <label className="block text-sm font-bold text-ink-950 mb-2">Security Type</label>
                {SECURITY_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setWifiSettings({ ...wifiSettings, security_type: type.id })}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      wifiSettings.security_type === type.id
                        ? 'border-nirvana-400 bg-nirvana-400/10'
                        : 'border-white/10 hover:border-nirvana-400/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        wifiSettings.security_type === type.id ? 'border-nirvana-400 bg-nirvana-400' : 'border-white/30'
                      }`}>
                        {wifiSettings.security_type === type.id && <div className="w-1.5 h-1.5 bg-ink-950 rounded-full" />}
                      </div>
                      <span className="font-bold text-ink-950 text-sm">{type.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-nirvana-400/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-ink-950 text-sm">Show Name on Card</h4>
                  </div>
                  <button
                    onClick={() => setWifiSettings({ ...wifiSettings, show_name: !wifiSettings.show_name })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${wifiSettings.show_name ? 'bg-nirvana-400' : 'bg-white/20'}`}
                  >
                    <div className={`absolute top-1 bottom-1 w-4 bg-ink-950 rounded-full transition-all ${wifiSettings.show_name ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-ink-950 text-sm">Show Password on Card</h4>
                  </div>
                  <button
                    onClick={() => setWifiSettings({ ...wifiSettings, show_password: !wifiSettings.show_password })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${wifiSettings.show_password ? 'bg-nirvana-400' : 'bg-white/20'}`}
                  >
                    <div className={`absolute top-1 bottom-1 w-4 bg-ink-950 rounded-full transition-all ${wifiSettings.show_password ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-ink-950 text-sm">Show QR</h4>
                  </div>
                  <button
                    onClick={() => setWifiSettings({ ...wifiSettings, show_qr: !wifiSettings.show_qr })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${wifiSettings.show_qr ? 'bg-nirvana-400' : 'bg-white/20'}`}
                  >
                    <div className={`absolute top-1 bottom-1 w-4 bg-ink-950 rounded-full transition-all ${wifiSettings.show_qr ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSaveWifi}
                disabled={savingWifi}
                className="btn-gold w-full flex justify-center items-center gap-2 mt-4"
              >
                <Check className="w-5 h-5" />
                {savingWifi ? 'Saving...' : 'Save WiFi Settings'}
              </button>
            </div>
          </div>

          <div className="card-luxury p-5">
            <h3 className="font-serif text-lg text-nirvana-300 mb-4">WiFi QR Preview</h3>
            <div className="text-center">
              <div className="inline-block p-4 bg-nirvana-400 rounded-2xl mb-6 shadow-gold">
                {wifiSettings.show_qr && wifiSettings.ssid ? (
                  <canvas ref={canvasRef} className="rounded-lg bg-white" />
                ) : (
                  <div className="w-[200px] h-[200px] bg-white/10 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center">
                    <Wifi className="w-12 h-12 text-ink-600" />
                  </div>
                )}
              </div>
              
              <div className="space-y-4 max-w-[200px] mx-auto text-left bg-white/5 p-4 rounded-xl border border-white/10">
                {wifiSettings.show_name && (
                  <div>
                    <div className="text-[10px] text-ink-600 uppercase tracking-wider">Network Name</div>
                    <div className="text-sm font-bold text-ink-950 truncate">{wifiSettings.ssid || 'Not set'}</div>
                  </div>
                )}
                {wifiSettings.show_password && wifiSettings.security_type !== 'Open' && (
                  <div>
                    <div className="text-[10px] text-ink-600 uppercase tracking-wider">Password</div>
                    <div className="text-sm font-bold text-ink-950 truncate">{wifiSettings.password || '••••••••'}</div>
                  </div>
                )}
              </div>

              {wifiSettings.show_qr && wifiSettings.ssid && (
                <div className="mt-6 flex gap-2 justify-center">
                  <button onClick={downloadQR} className="btn-gold flex items-center gap-2 !py-2 text-sm">
                    <Download className="w-4 h-4" /> Download PNG
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
