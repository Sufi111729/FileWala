import { useEffect } from 'react';
import { BRAND_ICON_URL, BRAND_LOGO_URL, BRAND_NAME, SITE_URL } from '../../data/siteMetadata.js';

const managedAttribute = 'data-filewala-seo';

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value) element.setAttribute(key, value);
  });
  element.setAttribute(managedAttribute, 'true');
}

function upsertCanonical(href) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
  element.setAttribute(managedAttribute, 'true');
}

function removeManagedSchemas() {
  document.head.querySelectorAll(`script[type="application/ld+json"][${managedAttribute}]`).forEach((element) => {
    element.remove();
  });
}

function appendSchema(schema) {
  const element = document.createElement('script');
  element.type = 'application/ld+json';
  element.textContent = JSON.stringify(schema);
  element.setAttribute(managedAttribute, 'true');
  document.head.appendChild(element);
}

export default function SeoHelmet({
  title,
  description,
  canonical = SITE_URL,
  keywords = [],
  robots = 'index, follow',
  image = BRAND_LOGO_URL,
  type = 'website',
  jsonLd = [],
}) {
  useEffect(() => {
    const keywordContent = Array.isArray(keywords) ? keywords.filter(Boolean).join(', ') : keywords;
    const schemaItems = Array.isArray(jsonLd) ? jsonLd.filter(Boolean) : [jsonLd].filter(Boolean);

    if (title) document.title = title;
    if (description) upsertMeta('meta[name="description"]', { name: 'description', content: description });
    if (keywordContent) upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywordContent });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: robots });
    upsertCanonical(canonical);

    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: BRAND_NAME });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    if (description) upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image });
    upsertMeta('meta[property="og:logo"]', { property: 'og:logo', content: BRAND_ICON_URL });

    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    if (description) upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });

    removeManagedSchemas();
    schemaItems.forEach(appendSchema);
  }, [canonical, description, image, jsonLd, keywords, robots, title, type]);

  return null;
}
