import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Wifi, Check } from 'lucide-react';
import QRCode from 'qrcode';
import type { WiFiSettings } from '@/types';

const SECURITY_TYPES = [
  { id: 'WPA2/WPA3 Personal', label: 'WPA2/WPA3 Personal', desc: 'Recommended for most modern routers.' },
  { id: 'WPA/WPA2 Personal', label: 'WPA/WPA2 Personal', desc: 'Universal compatibility with older devices.' },
  { id: 'WEP', label: 'WEP', desc: 'Not recommended. Low security.' },
  { id: 'Open', label: 'Open (No Password)', desc: 'Open network without password.' },
];

export function WiFiQR() {
  const { restaurantId } = useAuth();
  const [settings, setSettings] = useState<WiFiSettings>({
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
  const [saving, setSaving] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (restaurantId) {
      setSettings(prev => ({ ...prev, restaurant_id: restaurantId }));
      loadSettings();
    }
  }, [restaurantId]);

  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from('wifi_settings')
        .select('*')
        .eq('restaurant_id', restaurantId!)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Error loading wifi settings:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!settings.ssid) {
      setQrDataUrl('');
      return;
    }

    let authType = 'WPA';
    if (settings.security_type === 'WEP') authType = 'WEP';
    else if (settings.security_type === 'Open') authType = 'nopass';

    // Format: WIFI:T:WPA;S:mynetwork;P:mypass;;
    const wifiString = `WIFI:T:${authType};S:${settings.ssid};P:${settings.security_type === 'Open' ? '' : (settings.password || '')};;`;

    QRCode.toDataURL(wifiString, {
      width: 200,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    }).then(url => setQrDataUrl(url)).catch(err => console.error(err));
  }, [settings.ssid, settings.password, settings.security_type]);

  async function handleSave() {
    if (!restaurantId || !settings.ssid) {
      alert('Please enter a WiFi Network Name (SSID)');
      return;
    }
    setSaving(true);

    try {
      // Upsert
      const { error } = await supabase
        .from('wifi_settings')
        .upsert({
          restaurant_id: restaurantId,
          ssid: settings.ssid,
          password: settings.password,
          security_type: settings.security_type,
          show_name: settings.show_name,
          show_password: settings.show_password,
          show_qr: settings.show_qr,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('WiFi settings saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save WiFi settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-theme-secondary">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Wifi className="w-6 h-6" />
            WiFi QR
          </h1>
          <p className="text-theme-secondary">Configure WiFi details and QR display preferences for room printable templates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Step 1 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6 bg-surface border border-theme-border p-4 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</div>
            <div>
              <h3 className="font-bold text-theme-primary text-sm">Add WiFi Details</h3>
              <p className="text-xs text-theme-secondary">Enter your WiFi name and password</p>
            </div>
          </div>

          <div className="bg-surface border border-theme-border rounded-xl p-5 space-y-5">
            <div>
              <label className="block text-sm font-bold text-theme-primary mb-1">WiFi Name / SSID *</label>
              <input
                type="text"
                value={settings.ssid}
                onChange={e => setSettings({ ...settings, ssid: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-theme-border rounded-xl text-theme-primary focus:outline-none focus:border-primary"
                placeholder="Network Name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-theme-primary mb-1">WiFi Password *</label>
              <input
                type="text"
                value={settings.password || ''}
                onChange={e => setSettings({ ...settings, password: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-theme-border rounded-xl text-theme-primary focus:outline-none focus:border-primary"
                placeholder="Password"
              />
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs">
              <strong>Tip:</strong> Using a strong password ensures better security for your guests.
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6 bg-surface border border-theme-border p-4 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">2</div>
            <div>
              <h3 className="font-bold text-theme-primary text-sm">Choose Security Type</h3>
              <p className="text-xs text-theme-secondary">Select your WiFi security type</p>
            </div>
          </div>

          <div className="bg-surface border border-theme-border rounded-xl p-5 space-y-3">
            {SECURITY_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setSettings({ ...settings, security_type: type.id })}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  settings.security_type === type.id
                    ? 'border-primary bg-primary/5'
                    : 'border-theme-border bg-background hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    settings.security_type === type.id ? 'border-primary bg-primary' : 'border-theme-border'
                  }`}>
                    {settings.security_type === type.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="font-bold text-theme-primary text-sm">{type.label}</span>
                </div>
                <p className="text-xs text-theme-secondary pl-6">{type.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6 bg-surface border border-theme-border p-4 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">3</div>
            <div>
              <h3 className="font-bold text-theme-primary text-sm">Enable WiFi QR on Room Card</h3>
              <p className="text-xs text-theme-secondary">Choose what to show on the card</p>
            </div>
          </div>

          <div className="bg-surface border border-theme-border rounded-xl p-5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-theme-primary text-sm">Show WiFi Name on Card</h4>
                <p className="text-xs text-theme-secondary">Display WiFi name (SSID) on the room card.</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, show_name: !settings.show_name })}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.show_name ? 'bg-primary' : 'bg-theme-border'}`}
              >
                <div className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-all ${settings.show_name ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-theme-primary text-sm">Show WiFi Password on Card</h4>
                <p className="text-xs text-theme-secondary">Display WiFi password on the room card.</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, show_password: !settings.show_password })}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.show_password ? 'bg-primary' : 'bg-theme-border'}`}
              >
                <div className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-all ${settings.show_password ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-theme-primary text-sm">Show WiFi QR on Room Template</h4>
                <p className="text-xs text-theme-secondary">Display scannable WiFi QR on the room card.</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, show_qr: !settings.show_qr })}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.show_qr ? 'bg-primary' : 'bg-theme-border'}`}
              >
                <div className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-all ${settings.show_qr ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-theme-primary text-xs flex items-start gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span>Guests can scan the QR code to <strong>instantly connect</strong> to WiFi without typing.</span>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6 bg-surface border border-theme-border p-4 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">4</div>
            <div>
              <h3 className="font-bold text-theme-primary text-sm">Preview / Save</h3>
              <p className="text-xs text-theme-secondary">Preview & save WiFi QR</p>
            </div>
          </div>

          <div className="bg-surface border border-theme-border rounded-xl p-5">
            <div className="bg-background border border-theme-border rounded-xl p-6 mb-6 text-center shadow-lg max-w-[240px] mx-auto">
              <Wifi className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-bold text-theme-primary mb-1">Stay Connected</h3>
              <p className="text-[10px] text-theme-secondary mb-4 uppercase tracking-widest">Scan to connect to our WiFi</p>
              
              {settings.show_qr && (
                <div className="aspect-square bg-white rounded-lg p-2 mb-4 mx-auto w-32 flex items-center justify-center overflow-hidden">
                  {settings.ssid && qrDataUrl ? (
                    <img src={qrDataUrl} alt="WiFi QR" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full border-2 border-dashed border-gray-300 rounded" />
                  )}
                </div>
              )}
              
              <div className="text-left space-y-2">
                {settings.show_name && (
                  <div>
                    <div className="text-[10px] text-theme-secondary uppercase">WiFi Name</div>
                    <div className="text-sm font-bold text-theme-primary truncate">{settings.ssid || 'Network Name'}</div>
                  </div>
                )}
                {settings.show_password && settings.security_type !== 'Open' && (
                  <div>
                    <div className="text-[10px] text-theme-secondary uppercase">Password</div>
                    <div className="text-sm font-bold text-theme-primary truncate">{settings.password || '••••••••'}</div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full flex justify-center items-center gap-2"
            >
              <Check className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save WiFi QR'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
