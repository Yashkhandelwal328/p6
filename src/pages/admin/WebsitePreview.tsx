import { useState } from 'react';
import { Monitor, Smartphone, Tablet, ExternalLink, Globe } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function WebsitePreview() {
  const { restaurant, slug } = useTheme();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  if (!restaurant) return null;

  const previewUrl = `${window.location.origin}/${restaurant.subdomain || slug}`;

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink-950 mb-1">Website Preview</h1>
          <p className="text-sm text-ink-600">See how your website looks across different devices.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-ink-900/50 p-2 rounded-xl border border-white/5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDevice('mobile')}
              className={`p-2 rounded-lg transition-colors ${device === 'mobile' ? 'bg-gold-500/20 text-gold-400' : 'text-ink-600 hover:text-white'}`}
              title="Mobile View"
            >
              <Smartphone className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-2 rounded-lg transition-colors ${device === 'tablet' ? 'bg-gold-500/20 text-gold-400' : 'text-ink-600 hover:text-white'}`}
              title="Tablet View"
            >
              <Tablet className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDevice('desktop')}
              className={`p-2 rounded-lg transition-colors ${device === 'desktop' ? 'bg-gold-500/20 text-gold-400' : 'text-ink-600 hover:text-white'}`}
              title="Desktop View"
            >
              <Monitor className="w-5 h-5" />
            </button>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold !py-2 text-sm flex items-center gap-2"
          >
            Open Live <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="flex-1 bg-ink-950 rounded-xl border border-white/10 overflow-hidden flex flex-col relative">
        <div className="h-12 bg-ink-900 flex items-center px-4 border-b border-white/10">
          <div className="flex items-center gap-2 w-full max-w-2xl mx-auto bg-ink-950 px-3 py-1.5 rounded-md text-sm text-ink-300">
            <Globe className="w-4 h-4 text-ink-500" />
            <span className="truncate">{previewUrl}</span>
          </div>
        </div>
        
        <div className="flex-1 bg-black/50 overflow-auto p-4 flex items-center justify-center">
          <div 
            className={`bg-white rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ${
              device === 'mobile' ? 'w-[375px] h-[812px]' :
              device === 'tablet' ? 'w-[768px] h-[1024px]' :
              'w-full h-full'
            }`}
          >
            <iframe 
              src={previewUrl} 
              className="w-full h-full border-none bg-white"
              title="Website Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
