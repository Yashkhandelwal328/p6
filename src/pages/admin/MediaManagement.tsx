import { useEffect, useState } from 'react';
import { Image as ImageIcon, Upload, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface MediaFile {
  name: string;
  url: string;
  size: number;
  created_at: string | null;
}

export function MediaManagement() {
  const { restaurantId } = useAuth();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [restaurantId]);

  async function loadFiles() {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from('menu-images').list(`${restaurantId}`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (error) throw error;

      const fileList = await Promise.all(
        (data || []).filter(f => f.name !== '.emptyFolderPlaceholder').map(async (f) => {
          const { data: urlData } = supabase.storage.from('menu-images').getPublicUrl(`${restaurantId}/${f.name}`);
          return {
            name: f.name,
            url: urlData.publicUrl,
            size: f.metadata?.size || 0,
            created_at: f.created_at,
          };
        })
      );
      setFiles(fileList);
    } catch (err: any) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0 || !restaurantId) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop();
      const fileName = `media-${Date.now()}.${ext}`;
      const filePath = `${restaurantId}/${fileName}`;

      const { error } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;
      
      await loadFiles();
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDelete(name: string) {
    if (!restaurantId || !confirm('Are you sure you want to delete this image?')) return;
    try {
      const { error } = await supabase.storage.from('menu-images').remove([`${restaurantId}/${name}`]);
      if (error) throw error;
      await loadFiles();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink-950 mb-1 flex items-center gap-2">
            <ImageIcon className="w-7 h-7" /> Media Library
          </h1>
          <p className="text-sm text-ink-600">Manage all your restaurant images, logos, and banners here.</p>
        </div>
        
        <div>
          <label className="btn-gold flex items-center gap-2 cursor-pointer">
            <Upload className="w-5 h-5" />
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleUpload} 
              disabled={uploading} 
            />
          </label>
        </div>
      </div>

      <div className="card-luxury p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 text-ink-600">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No media files found. Upload your first image to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file) => (
              <div key={file.name} className="group relative bg-ink-950 rounded-xl overflow-hidden border border-white/10 hover:border-gold-500/50 transition-colors">
                <div className="aspect-square bg-ink-900">
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="p-3">
                  <p className="text-xs font-medium text-ink-800 truncate mb-1" title={file.name}>{file.name}</p>
                  <p className="text-[10px] text-ink-500">{formatSize(file.size)}</p>
                </div>
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button 
                    onClick={() => { navigator.clipboard.writeText(file.url); alert('URL Copied'); }}
                    className="btn-outline !py-1 !px-3 text-xs flex items-center gap-2"
                  >
                    <ExternalLink className="w-3 h-3" /> Copy URL
                  </button>
                  <button 
                    onClick={() => handleDelete(file.name)}
                    className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
