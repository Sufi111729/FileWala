import SeoHelmet from './seo/SeoHelmet.jsx';

export default function SEO({ schema, ...props }) {
  return <SeoHelmet {...props} schema={schema} />;
}
