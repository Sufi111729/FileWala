import { absoluteUrl, BRAND_ALIASES, BRAND_LOGO_URL, BRAND_NAME, SITE_URL } from '../../data/siteMetadata.js';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND_NAME,
    alternateName: BRAND_ALIASES,
    url: SITE_URL,
    logo: BRAND_LOGO_URL,
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND_NAME,
    alternateName: BRAND_ALIASES,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}#tools`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function toolSchemas(seo) {
  if (!seo) return [];

  const url = seo.canonicalUrl ?? absoluteUrl(seo.route);

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: seo.title,
      alternateName: seo.alternateNames,
      applicationCategory: seo.schema?.applicationCategory ?? 'UtilitiesApplication',
      operatingSystem: 'Web Browser',
      url,
      description: seo.metaDescription,
      keywords: [
        seo.primaryKeyword,
        ...seo.secondaryKeywords,
        ...seo.longTailKeywords,
        ...seo.indiaKeywords,
      ].filter(Boolean).join(', '),
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      publisher: {
        '@type': 'Organization',
        name: BRAND_NAME,
        url: SITE_URL,
        logo: BRAND_LOGO_URL,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: seo.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: seo.category,
          item: seo.category === 'PDF Tools' ? absoluteUrl('/?category=PDF%20Tools#tools') : absoluteUrl('/#tools'),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: seo.title,
          item: url,
        },
      ],
    },
  ];
}
