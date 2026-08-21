import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  schema?: object | object[];
}

export const SEO = ({
  title = "MomentumFit — Daily Fitness Habit Tracker App | Build Streaks That Stick",
  description = "MomentumFit is a free daily fitness habit tracker app. Build streaks, track progress, and stay consistent. The streak tracker designed to keep you moving.",
  keywords = "fitness tracker, habit tracker, adults 40+, fitness habits, workout consistency, health app, streak tracker, goal setting, fitness motivation",
  ogImage = "https://momentumfit.app/og-image.jpg",
  canonical,
  schema
}: SEOProps) => {
  const location = useLocation();
  const currentUrl = `https://momentumfit.app${location.pathname}`;
  const canonicalUrl = canonical || currentUrl;

  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:type', 'website', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);

    // Update canonical link
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', canonicalUrl);

    // Add or update schema markup
    if (schema) {
      const schemas = Array.isArray(schema) ? schema : [schema];
      // Remove any existing dynamic schema blocks to avoid stale markup from previous pages
      document.querySelectorAll('script[type="application/ld+json"][data-dynamic]').forEach(el => el.remove());
      schemas.forEach((s, index) => {
        const schemaElement = document.createElement('script');
        schemaElement.setAttribute('type', 'application/ld+json');
        schemaElement.setAttribute('data-dynamic', 'true');
        schemaElement.setAttribute('data-dynamic-index', String(index));
        schemaElement.textContent = JSON.stringify(s);
        document.head.appendChild(schemaElement);
      });
    }

    return () => {
      // Clean up dynamic schema blocks on unmount
      document.querySelectorAll('script[type="application/ld+json"][data-dynamic]').forEach(el => el.remove());
    };
  }, [title, description, keywords, ogImage, currentUrl, canonicalUrl, schema]);

  return null;
};
