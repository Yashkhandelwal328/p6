import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store, MapPin, Clock, Phone, Utensils, Star, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/context/ThemeContext';
import type { Restaurant } from '@/types';

export function PublicRestaurantPage({ previewData }: { previewData?: Partial<Restaurant> }) {
  const { slug } = useParams<{ slug: string }>();
  const { restaurant: contextRestaurant, slug: contextSlug, isCustomDomain } = useTheme();
  const [restaurant, setRestaurant] = useState<Partial<Restaurant> | null>(previewData || contextRestaurant || null);
  const [loading, setLoading] = useState(!previewData && !contextRestaurant);
  
  const activeSlug = contextSlug || slug;
  const menuUrl = isCustomDomain ? '/menu' : (activeSlug ? `/${activeSlug}/menu` : 'menu');

  useEffect(() => {
    // If preview data is updated (e.g. from Settings), update state
    if (previewData) {
      setRestaurant(previewData);
      setLoading(false);
    } else if (contextRestaurant) {
      setRestaurant(contextRestaurant);
      setLoading(false);
    }
  }, [previewData, contextRestaurant]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Store className="w-16 h-16 text-theme-text-muted mb-4" />
        <h1 className="text-2xl font-serif text-primary mb-2">Restaurant Not Found</h1>
        <p className="text-theme-text-secondary">We couldn't find the restaurant you're looking for.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-primary selection:bg-primary selection:text-primary-foreground">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-96 w-full bg-surface overflow-hidden">
        {restaurant.logo_url ? (
          <img src={restaurant.logo_url} alt="Cover" className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary to-accent opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-7xl mx-auto flex items-end gap-6">
          {restaurant.logo_url && (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-background bg-surface shadow-xl flex-shrink-0">
              <img src={restaurant.logo_url} alt="Logo" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="pb-2">
            <h1 className="text-3xl md:text-5xl font-serif text-primary font-bold drop-shadow-md">
              {restaurant.name}
            </h1>
            <p className="text-theme-text-secondary mt-1 text-lg flex items-center gap-2">
              <Star className="w-4 h-4 text-primary fill-primary" />
              4.9 (120+ reviews)
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-10">
          
          <section>
            <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-primary" />
              About Us
            </h2>
            <p className="text-theme-text-secondary text-lg leading-relaxed">
              Welcome to {restaurant.name}. We pride ourselves on offering the finest culinary experience with fresh ingredients and exceptional service. 
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="aspect-square bg-surface rounded-xl border border-theme-border flex items-center justify-center overflow-hidden">
                  <ImageIcon className="w-8 h-8 text-theme-text-muted opacity-20" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="card-luxury p-6 space-y-6">
            <Link 
              to={menuUrl}
              className="w-full btn-primary flex items-center justify-center gap-2 text-lg shadow-lg"
            >
              <Utensils className="w-5 h-5" />
              Order Now
            </Link>

            <div className="space-y-4 pt-4 border-t border-theme-border">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-theme-text-secondary text-sm">123 Main Street, City, Country</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium">Opening Hours</h3>
                  <p className="text-theme-text-secondary text-sm">Mon - Sun: 10:00 AM - 10:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium">Contact</h3>
                  <p className="text-theme-text-secondary text-sm">+1 234 567 8900</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
