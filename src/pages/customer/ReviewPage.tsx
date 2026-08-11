import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Send, ArrowLeft, CheckCircle2, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/context/ThemeContext';

export function ReviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { restaurant, isCustomDomain } = useTheme();
  const [searchParams] = useSearchParams();
  const sourceParam = searchParams.get('source') || 'website';
  
  // Validate source against allowed enum values
  const validSources = ['website', 'owner_dashboard', 'order_page'];
  const source = validSources.includes(sourceParam) ? sourceParam : 'website';

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const menuUrl = isCustomDomain ? '/menu' : (slug ? `/${slug}/menu` : '/menu');
  const homeUrl = isCustomDomain ? '/' : (slug ? `/${slug}` : '/');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!rating) {
      setError('Please select a rating');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!restaurant?.id) {
      setError('Restaurant not found');
      return;
    }

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from('reviews').insert({
        restaurant_id: restaurant.id,
        customer_name: name.trim(),
        customer_phone: phone.trim() || null,
        rating,
        comment: comment.trim() || null,
        source: source,
      });

      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-theme-text-primary">
        <div className="w-full max-w-md text-center animate-fade-in-up">
          <div className="bg-surface border border-theme-border p-8 rounded-2xl shadow-xl">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-theme-text-primary mb-3">Thank You!</h1>
            <p className="text-theme-text-secondary mb-2">Your review has been submitted successfully.</p>
            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-6 h-6 ${s <= rating ? 'text-primary fill-primary' : 'text-theme-text-muted opacity-30'}`}
                />
              ))}
            </div>
            <p className="text-theme-text-secondary text-sm mb-8">We appreciate your feedback and will use it to improve our service.</p>
            <div className="flex gap-3">
              <button onClick={() => navigate(homeUrl)} className="btn-outline flex-1 !py-2.5">
                Home
              </button>
              <button onClick={() => navigate(menuUrl)} className="btn-primary flex-1 !py-2.5">
                Order Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-theme-text-primary selection:bg-primary selection:text-primary-foreground">
      <header className="bg-surface border-b border-theme-border sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-theme-text-secondary hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
          <div className="text-right">
            <p className="text-xs text-theme-text-secondary uppercase tracking-wider font-semibold">Review</p>
            <p className="font-serif font-bold text-theme-text-primary">{restaurant.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 mb-4">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Share Your Experience</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-theme-text-primary mb-2">Leave a Review</h1>
          <p className="text-theme-text-secondary text-sm">Your feedback helps us improve!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up">
          {/* Star Rating */}
          <div className="bg-surface border border-theme-border rounded-2xl p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-theme-text-secondary mb-4">How would you rate your experience?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-125 active:scale-95 p-1"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-primary fill-primary drop-shadow-md'
                        : 'text-theme-text-muted opacity-30 hover:opacity-100'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm font-medium text-primary mt-3 animate-fade-in">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent!'}
              </p>
            )}
          </div>

          {/* Name & Phone */}
          <div className="bg-surface border border-theme-border rounded-2xl p-5 space-y-4 shadow-sm">
            <div>
              <label className="block text-sm font-medium text-theme-text-primary mb-1.5">Your Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl bg-background border border-theme-border text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-theme-text-muted"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-primary mb-1.5">Phone (optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
                className="w-full px-4 py-3 rounded-xl bg-background border border-theme-border text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-theme-text-muted"
              />
            </div>
          </div>

          {/* Comment */}
          <div className="bg-surface border border-theme-border rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-theme-text-primary mb-1.5">Your Review (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-background border border-theme-border text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-theme-text-muted resize-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !rating || !name.trim()}
            className="btn-primary w-full !py-3.5 text-lg flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Review
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
