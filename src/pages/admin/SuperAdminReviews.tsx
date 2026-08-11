import { useEffect, useState } from 'react';
import { Star, MessageSquare, CheckCircle2, Trash2, Eye, EyeOff, Store, Search, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Review } from '@/types';

interface ReviewWithRestaurant extends Review {
  restaurants?: { name: string; subdomain: string | null } | null;
}

export function SuperAdminReviews() {
  const [reviews, setReviews] = useState<ReviewWithRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    const { data } = await supabase
      .from('reviews')
      .select('*, restaurants(name, subdomain)')
      .order('created_at', { ascending: false });

    setReviews((data ?? []) as ReviewWithRestaurant[]);
    setLoading(false);
  }

  async function toggleRead(id: string, currentRead: boolean) {
    await supabase.from('reviews').update({ is_read: !currentRead }).eq('id', id);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, is_read: !currentRead } : r));
  }

  async function deleteReview(id: string) {
    if (!confirm('Are you sure you want to delete this review?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    setReviews(prev => prev.filter(r => r.id !== id));
  }

  async function markAllRead() {
    const unreadIds = reviews.filter(r => !r.is_read).map(r => r.id);
    if (unreadIds.length === 0) return;
    await supabase.from('reviews').update({ is_read: true }).in('id', unreadIds);
    setReviews(prev => prev.map(r => ({ ...r, is_read: true })));
  }

  const filteredReviews = reviews.filter(r => {
    if (filterRead === 'unread' && r.is_read) return false;
    if (filterRead === 'read' && !r.is_read) return false;
    if (filterRating !== 'all' && r.rating !== filterRating) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.customer_name.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q) ||
        r.restaurants?.name?.toLowerCase().includes(q) ||
        r.customer_phone?.includes(q)
      );
    }
    return true;
  });

  const unreadCount = reviews.filter(r => !r.is_read).length;
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Customer Reviews
          </h1>
          <p className="text-theme-secondary text-sm mt-1">
            {reviews.length} total reviews · {unreadCount} unread · {avgRating} avg rating
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark All Read
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[5, 4, 3, 2, 1].map(star => {
          const count = reviews.filter(r => r.rating === star).length;
          return (
            <button
              key={star}
              onClick={() => setFilterRating(filterRating === star ? 'all' : star)}
              className={`card-luxury p-4 text-center transition-all ${filterRating === star ? 'border-primary/40 shadow-md' : ''}`}
            >
              <div className="flex justify-center gap-0.5 mb-2">
                {Array.from({ length: star }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-2xl font-bold text-theme-primary">{count}</p>
              <p className="text-xs text-theme-secondary">{star} star{star !== 1 ? 's' : ''}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card-luxury p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-secondary" />
          <input
            type="text"
            placeholder="Search by name, restaurant, comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-background border border-theme-border rounded-xl text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterRead(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                filterRead === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-theme-secondary border border-theme-border hover:bg-primary/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="card-luxury p-12 text-center">
          <MessageSquare className="w-12 h-12 text-theme-secondary mx-auto mb-3 opacity-30" />
          <p className="text-theme-secondary">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`card-luxury p-5 transition-all ${!review.is_read ? 'border-l-4 border-l-primary' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-theme-primary">{review.customer_name}</h3>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    {!review.is_read && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        New
                      </span>
                    )}
                  </div>

                  {review.comment && (
                    <p className="text-theme-secondary text-sm mb-3 leading-relaxed">{review.comment}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-theme-secondary flex-wrap">
                    <span className="flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      {review.restaurants?.name || 'Unknown'}
                    </span>
                    {review.customer_phone && (
                      <span>📱 {review.customer_phone}</span>
                    )}
                    <span className="capitalize font-medium">
                      {review.source === 'owner_dashboard' 
                        ? 'Owner Review' 
                        : review.source === 'order_page' 
                          ? 'Customer Review' 
                          : 'Website Review'}
                    </span>
                    <span>{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleRead(review.id, review.is_read)}
                    className={`p-2 rounded-lg transition-colors ${review.is_read ? 'text-theme-secondary hover:bg-primary/10' : 'text-primary hover:bg-primary/10'}`}
                    title={review.is_read ? 'Mark as unread' : 'Mark as read'}
                  >
                    {review.is_read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
