import CategoryTabs from '../components/navigation/CategoryTabs.jsx';
import SeoHelmet from '../components/seo/SeoHelmet.jsx';
import { breadcrumbSchema, collectionPageSchema, toolItemListSchema } from '../components/seo/schema.js';
import ToolCard from '../components/ToolCard.jsx';
import { allTools } from '../data/tools.js';
import { absoluteUrl, SITE_URL } from '../data/siteMetadata.js';
import { useLanguage } from '../i18n.jsx';

const categoryMeta = {
  'PDF Tools': {
    path: '/pdf-tools',
    title: 'PDF Tools Online - Merge, Split, Compress, Rotate PDF | FileWalaTool',
    description: 'Use free PDF tools online with FileWalaTool. Merge, split, compress, rotate, protect, unlock, and convert PDF files in your browser.',
    keywords: ['pdf tools', 'merge pdf', 'split pdf', 'compress pdf', 'rotate pdf', 'pdf converter'],
  },
  'Image Tools': {
    path: '/image-tools',
    title: 'Image Tools Online - Resize, Compress, Crop, Convert | FileWalaTool',
    description: 'Use free image tools online with FileWalaTool. Resize, compress, crop, convert, upscale, downscale, and prepare images for uploads.',
    keywords: ['image tools', 'resize image', 'compress image', 'crop image', 'image converter', 'photo resizer'],
  },
};

export default function CategoryToolsPage({ category }) {
  const { text, tCategory } = useLanguage();
  const meta = categoryMeta[category];
  const tools = allTools.filter((tool) => tool.category === category || tool.groups?.includes(category));
  const categoryName = tCategory(category);
  const localizedDescription = `${categoryName}: ${text.grid.description}`;
  const localizedTitle = `${categoryName} | FileWalaTool`;
  const canonical = absoluteUrl(meta.path);
  const jsonLd = [
    collectionPageSchema({ name: categoryName, description: localizedDescription, path: meta.path }),
    toolItemListSchema(tools),
    breadcrumbSchema([
      { name: text.nav.home, url: SITE_URL },
      { name: categoryName, url: canonical },
    ]),
  ];

  return (
    <section className="bg-white py-10 sm:py-14">
      <SeoHelmet
        title={localizedTitle}
        description={localizedDescription}
        canonical={canonical}
        keywords={meta.keywords}
        jsonLd={jsonLd}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-wide text-black/70">{text.toolsLibrary.label}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-black sm:text-4xl">
            {categoryName}
          </h1>
          <p className="mt-4 text-base leading-7 text-black/60">{localizedDescription}</p>
          <p className="mt-6 inline-flex rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black/60">
            {tools.length} {text.toolsLibrary.toolsFound}
          </p>
        </div>

        <div className="mt-7">
          <CategoryTabs activeTab={category} />
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} activeTab={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
