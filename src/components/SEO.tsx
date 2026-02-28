import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  schema?: object;
}

export const SEO = ({
  title = "Momentum — Fitness Habit Tracker & Daily Streak App",
  description = "Build unstoppable fitness habits with daily check-ins, streak tracking, and AI coaching. Join 10,000+ people who show up every day.",
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
      let schemaElement = document.querySelector('script[type="application/ld+json"][data-dynamic]');
      if (!schemaElement) {
        schemaElement = document.createElement('script');
        schemaElement.setAttribute('type', 'application/ld+json');
        schemaElement.setAttribute('data-dynamic', 'true');
        document.head.appendChild(schemaElement);
      }
      schemaElement.textContent = JSON.stringify(schema);
    }
  }, [title, description, keywords, ogImage, currentUrl, canonicalUrl, schema]);

  return null;
};
