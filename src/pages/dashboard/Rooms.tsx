import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit2, Trash2, BedDouble } from 'lucide-react';
import type { Room } from '@/types';

export function Rooms() {
  const { restaurantId } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Partial<Room>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      loadRooms();
    }
  }, [restaurantId]);

  async function loadRooms() {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('restaurant_id', restaurantId!)
        .order('room_number');
      
      if (error) throw error;
      setRooms(data || []);
    } catch (err: any) {
      console.error('Error loading rooms:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurantId || !currentRoom.room_number) return;
    
    setSaving(true);
    setError('');
    
    try {
      const roomData = {
        ...currentRoom,
        restaurant_id: restaurantId,
      };

      if (currentRoom.id) {
        const { error } = await supabase
          .from('rooms')
          .update(roomData)
          .eq('id', currentRoom.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('rooms')
          .insert([roomData]);
        if (error) throw error;
      }
      
      await loadRooms();
      setIsEditing(false);
      setCurrentRoom({});
    } catch (err: any) {
      setError(err.message || 'Failed to save room');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await loadRooms();
    } catch (err: any) {
      alert(err.message || 'Failed to delete room');
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-theme-secondary">Loading rooms...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <BedDouble className="w-6 h-6" />
            Rooms
          </h1>
          <p className="text-theme-secondary">Manage hotel rooms and QR codes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-theme-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-primary mb-4">
              {currentRoom.id ? 'Edit Room' : 'Add Room'}
            </h2>
            
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    value={currentRoom.room_number || ''}
                    onChange={e => setCurrentRoom({ ...currentRoom, room_number: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-theme-border rounded-lg text-theme-primary focus:outline-none focus:border-primary"
                    placeholder="e.g. 101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-1">Room Name</label>
                  <input
                    type="text"
                    value={currentRoom.room_name || ''}
                    onChange={e => setCurrentRoom({ ...currentRoom, room_name: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-theme-border rounded-lg text-theme-primary focus:outline-none focus:border-primary"
                    placeholder="e.g. Presidential Suite"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-1">Floor</label>
                  <input
                    type="text"
                    value={currentRoom.floor || ''}
                    onChange={e => setCurrentRoom({ ...currentRoom, floor: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-theme-border rounded-lg text-theme-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-1">Wing / Building</label>
                  <input
                    type="text"
                    value={currentRoom.wing || ''}
                    onChange={e => setCurrentRoom({ ...currentRoom, wing: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-theme-border rounded-lg text-theme-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-1">Room Type</label>
                  <input
                    type="text"
                    value={currentRoom.room_type || ''}
                    onChange={e => setCurrentRoom({ ...currentRoom, room_type: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-theme-border rounded-lg text-theme-primary focus:outline-none focus:border-primary"
                    placeholder="e.g. Deluxe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-1">Status</label>
                  <select
                    value={currentRoom.status || 'active'}
                    onChange={e => setCurrentRoom({ ...currentRoom, status: e.target.value as 'active' | 'maintenance' })}
                    className="w-full px-3 py-2 bg-background border border-theme-border rounded-lg text-theme-primary focus:outline-none focus:border-primary"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-1">Notes</label>
                <textarea
                  value={currentRoom.notes || ''}
                  onChange={e => setCurrentRoom({ ...currentRoom, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-theme-border rounded-lg text-theme-primary focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || !currentRoom.room_number}
                  className="btn-primary flex-1"
                >
                  {saving ? 'Saving...' : 'Save Room'}
                </button>
                {currentRoom.id && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setCurrentRoom({});
                    }}
                    className="px-4 py-2 bg-surface border border-theme-border text-theme-primary rounded-lg hover:bg-white/5"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2">
          <div className="bg-surface border border-theme-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-primary mb-4">All Rooms ({rooms.length})</h2>
            
            {rooms.length === 0 ? (
              <div className="text-center py-12 text-theme-secondary bg-background rounded-lg border border-dashed border-theme-border">
                <BedDouble className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No rooms added yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-theme-border text-theme-secondary text-sm">
                      <th className="pb-3 font-medium">Room</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Floor/Wing</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-border">
                    {rooms.map(room => (
                      <tr key={room.id} className="text-theme-primary text-sm hover:bg-white/5 transition-colors">
                        <td className="py-3">
                          <div className="font-bold">{room.room_number}</div>
                          <div className="text-xs text-theme-secondary">{room.room_name}</div>
                        </td>
                        <td className="py-3">{room.room_type || '-'}</td>
                        <td className="py-3">
                          {room.floor || '-'}{room.wing ? ` / ${room.wing}` : ''}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            room.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {room.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setIsEditing(true);
                                setCurrentRoom(room);
                              }}
                              className="p-1.5 text-theme-secondary hover:text-primary transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(room.id)}
                              className="p-1.5 text-theme-secondary hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
