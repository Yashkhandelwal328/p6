import { useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';

export function SeoHead() {
  const { restaurant } = useTheme();

  useEffect(() => {
    if (!restaurant) return;

    // Update Title
    const title = `${restaurant.name} | ${restaurant.tagline || 'Order Online'}`;
    document.title = title;

    // Helper to set meta tags safely
    const setMetaTag = (attr: string, value: string, content: string) => {
      let element = document.querySelector(`meta[${attr}="${value}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, value);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const description = restaurant.description || `Welcome to ${restaurant.name}. Order online or view our menu today.`;
    
    // SEO Meta Tags
    setMetaTag('name', 'description', description);
    
    // OpenGraph Tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', 'website');
    if (restaurant.banner_url || restaurant.logo_url) {
      setMetaTag('property', 'og:image', restaurant.banner_url || restaurant.logo_url || '');
    }

    // Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    if (restaurant.banner_url || restaurant.logo_url) {
      setMetaTag('name', 'twitter:image', restaurant.banner_url || restaurant.logo_url || '');
    }

    // Favicon
    if (restaurant.logo_url) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = restaurant.logo_url;
    }

    // Structured Data (JSON-LD) for LocalBusiness
    const jsonLdId = 'restaurant-json-ld';
    let script = document.getElementById(jsonLdId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = jsonLdId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      "name": restaurant.name,
      "image": restaurant.logo_url || restaurant.banner_url || "",
      "@id": window.location.href,
      "url": window.location.href,
      "telephone": restaurant.phone || "",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": restaurant.address || ""
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
          ],
          "opens": restaurant.opening_time,
          "closes": restaurant.closing_time
        }
      ],
      "servesCuisine": (restaurant as any).cuisine_type || "Various",
      "acceptsReservations": "True"
    };
    
    script.innerHTML = JSON.stringify(structuredData);

  }, [restaurant]);

  return null; // This component strictly manages the document head
}
