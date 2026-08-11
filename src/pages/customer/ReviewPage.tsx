import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Send, ArrowLeft, CheckCircle2, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/context/ThemeContext';

export function ReviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { restaurant, isCustomDomain } = useTheme();
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
        source: 'website',
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
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-nirvana-400/30 border-t-nirvana-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center animate-fade-in-up">
          <div className="card-luxury p-8">
            <div className="w-20 h-20 mx-auto glass-gold rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-nirvana-400" />
            </div>
            <h1 className="font-serif text-3xl text-ink-950 mb-3">Thank You!</h1>
            <p className="text-ink-300 mb-2">Your review has been submitted successfully.</p>
            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-6 h-6 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-ink-600'}`}
                />
              ))}
            </div>
            <p className="text-ink-400 text-sm mb-8">We appreciate your feedback and will use it to improve our service.</p>
            <div className="flex gap-3">
              <button onClick={() => navigate(homeUrl)} className="btn-outline-gold flex-1 !py-2.5">
                Home
              </button>
              <button onClick={() => navigate(menuUrl)} className="btn-gold flex-1 !py-2.5">
                Order Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <header className="glass-dark border-b border-nirvana-400/10">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-ink-300 hover:text-nirvana-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
          <div className="text-right">
            <p className="text-xs text-ink-600">Review</p>
            <p className="font-serif text-nirvana-300">{restaurant.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-gold mb-4">
            <MessageSquare className="w-4 h-4 text-nirvana-400" />
            <span className="text-sm text-nirvana-300">Share Your Experience</span>
          </div>
          <h1 className="font-serif text-3xl text-ink-950 mb-2">Leave a Review</h1>
          <p className="text-ink-600 text-sm">Your feedback helps us improve!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up">
          {/* Star Rating */}
          <div className="card-luxury p-6 text-center">
            <p className="text-sm text-ink-400 mb-4">How would you rate your experience?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-125 active:scale-95"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]'
                        : 'text-ink-600 hover:text-ink-500'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-nirvana-300 mt-3 animate-fade-in">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent!'}
              </p>
            )}
          </div>

          {/* Name & Phone */}
          <div className="card-luxury p-5 space-y-4">
            <div>
              <label className="block text-sm text-ink-400 mb-1.5">Your Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="input-luxury w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-ink-400 mb-1.5">Phone (optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
                className="input-luxury w-full"
              />
            </div>
          </div>

          {/* Comment */}
          <div className="card-luxury p-5">
            <label className="block text-sm text-ink-400 mb-1.5">Your Review (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4}
              className="input-luxury w-full resize-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !rating || !name.trim()}
            className="btn-gold w-full !py-3 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
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
