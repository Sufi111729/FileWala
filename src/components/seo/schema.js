import { absoluteUrl, BRAND_ALIASES, BRAND_FOUNDER, BRAND_LOGO_URL, BRAND_NAME, SITE_URL, toolImageUrl } from '../../data/siteMetadata.js';

const categoryPathByName = {
  'PDF Tools': '/pdf-tools',
  'Image Tools': '/image-tools',
  'Passport Tools': '/documents',
  Documents: '/documents',
  Compress: '/compress',
};

function categoryUrl(category) {
  return absoluteUrl(categoryPathByName[category] ?? '/');
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND_NAME,
    alternateName: BRAND_ALIASES,
    url: absoluteUrl('/'),
    logo: BRAND_LOGO_URL,
    founder: {
      '@type': 'Person',
      name: BRAND_FOUNDER,
    },
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND_NAME,
    alternateName: BRAND_ALIASES,
    url: absoluteUrl('/'),
    inLanguage: 'en-IN',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function webApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: BRAND_NAME,
    alternateName: BRAND_ALIASES,
    url: SITE_URL,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web Browser',
    description: 'Free online image, PDF, compression, resize, converter, and document tools.',
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
  };
}

export function breadcrumbSchema(items) {
  const cleanItems = items.filter((item) => item?.name && item?.url);

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: cleanItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function collectionPageSchema({ name, description, path }) {
  const url = absoluteUrl(path);

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: BRAND_NAME,
      url: SITE_URL,
    },
  };
}

export function toolItemListSchema(tools = []) {
  const cleanTools = tools.filter((tool) => tool?.title && tool?.href);

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: cleanTools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'WebApplication',
        name: tool.title,
        description: tool.description,
        url: absoluteUrl(tool.href),
        image: tool.imageUrl,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
      },
    })),
  };
}

export function webPageSchema({ name, description, path }) {
  const url = absoluteUrl(path);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: BRAND_NAME,
      url: SITE_URL,
    },
  };
}

export function toolSchemas(seo) {
  if (!seo) return [];

  const url = seo.canonicalUrl ?? absoluteUrl(seo.route);
  const faqs = Array.isArray(seo.faqs) ? seo.faqs.filter((faq) => faq?.question && faq?.answer) : [];

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': seo.schema?.type ?? seo.schemaType ?? 'WebApplication',
      name: seo.title,
      alternateName: seo.alternateNames,
      applicationCategory: seo.schema?.applicationCategory ?? 'UtilitiesApplication',
      operatingSystem: 'Web',
      url,
      description: seo.schema?.description ?? seo.metaDescription,
      image: seo.imageUrl ?? toolImageUrl(seo.route),
      keywords: [...new Set([
        seo.primaryKeyword,
        ...seo.secondaryKeywords,
        ...seo.longTailKeywords,
        ...seo.indiaKeywords,
      ].filter(Boolean))].join(', '),
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: seo.schema?.priceCurrency ?? 'USD',
      },
      publisher: {
        '@type': 'Organization',
        name: BRAND_NAME,
        url: SITE_URL,
        logo: BRAND_LOGO_URL,
        founder: {
          '@type': 'Person',
          name: BRAND_FOUNDER,
        },
      },
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
          item: categoryUrl(seo.category),
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

  if (faqs.length > 0 && seo.includeFaqSchema !== false) {
    schemas.splice(1, 0, {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  return schemas;
}
