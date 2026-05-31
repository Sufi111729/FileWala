import { Helmet } from 'react-helmet-async';
import { BRAND_NAME, SITE_URL } from '../../data/toolsSeoData.js';

export default function SeoHelmet({
  title,
  description,
  canonical = SITE_URL,
  keywords = [],
  robots = 'index, follow',
  image = `${SITE_URL}/assets/logofilewalatoo.png`,
  type = 'website',
  jsonLd = [],
}) {
  const keywordContent = Array.isArray(keywords) ? keywords.filter(Boolean).join(', ') : keywords;
  const schemaItems = Array.isArray(jsonLd) ? jsonLd.filter(Boolean) : [jsonLd].filter(Boolean);

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {keywordContent && <meta name="keywords" content={keywordContent} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      <meta property="og:site_name" content={BRAND_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />

      {schemaItems.map((schema, index) => (
        <script key={`${schema['@type'] ?? 'schema'}-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

