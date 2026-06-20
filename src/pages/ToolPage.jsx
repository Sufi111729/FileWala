import { CheckCircle2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import UploadBox from '../components/UploadBox.jsx';
import SEO from '../components/SEO.jsx';
import ToolSeoSections from '../components/seo/ToolSeoSections.jsx';
import { toolSchemas } from '../components/seo/schema.js';
import { allTools, defaultTool } from '../data/tools.js';
import { absoluteUrl, getToolSeoBySlug } from '../data/toolsSeoData.js';
import { useLanguage } from '../i18n.jsx';
import NotFound from './NotFound.jsx';

const safeList = (items) => (Array.isArray(items) ? items.filter(Boolean) : []);

export default function ToolPage({ slugOverride }) {
  const { text, tCategory, tSeo, tToolTitle, tToolDescription } = useLanguage();
  const { slug: routeSlug } = useParams();
  const slug = slugOverride ?? routeSlug;
  const tool = allTools.find((item) => item.slug === slug);
  if (!tool && !slugOverride) return <NotFound />;
  const resolvedTool = tool ?? defaultTool;
  const seo = tSeo(getToolSeoBySlug(resolvedTool.slug));
  const keywords = seo
    ? [
        seo.primaryKeyword,
        ...safeList(seo.secondaryKeywords),
        ...safeList(seo.longTailKeywords),
        ...safeList(seo.questionKeywords),
        ...safeList(seo.indiaKeywords),
        ...safeList(seo.brandKeywords),
        ...safeList(seo.alternateNames),
      ]
    : [tToolTitle(resolvedTool), resolvedTool.category];

  return (
    <section className="bg-white py-4 sm:py-6">
      <SEO
        title={seo?.seoTitle ?? `${tToolTitle(resolvedTool)} - FileWalaTool`}
        description={seo?.metaDescription ?? tToolDescription(resolvedTool)}
        canonical={seo?.canonicalUrl ?? absoluteUrl(seo?.route ?? `/tools/${resolvedTool.slug}`)}
        keywords={keywords}
        image={resolvedTool.imageUrl}
        imageAlt={seo?.imageAlt ?? resolvedTool.imageAlt}
        ogDescription={seo?.ogDescription}
        twitterDescription={seo?.twitterDescription}
        schema={seo ? toolSchemas({ ...seo, imageUrl: resolvedTool.imageUrl }) : []}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link to="/" className="focus-ring text-sm font-bold text-black/55 hover:text-black">
          {text.toolPage.allTools}
        </Link>

        <div className="mt-3 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-wide text-blue-700">
            {tCategory(resolvedTool.category)}
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-black sm:text-3xl">{seo?.h1 ?? tToolTitle(resolvedTool)}</h1>
          <p className="mt-2 text-sm leading-6 text-black/60 sm:text-base">{seo?.shortIntro ?? tToolDescription(resolvedTool)}</p>
        </div>

        <div className="mt-4">
          <UploadBox tool={resolvedTool} />
        </div>

        <section className="mx-auto mt-8 grid max-w-5xl gap-4 lg:grid-cols-3">
          {text.toolPage.steps.map((item) => (
            <div key={item} className="rounded-md border border-black/10 bg-white p-5">
              <CheckCircle2 className="h-5 w-5 text-brand-red" />
              <p className="mt-3 text-sm font-bold leading-6 text-black/70">{item}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto mt-8 grid max-w-5xl gap-6 rounded-md border border-black/10 bg-white p-6 lg:grid-cols-[1fr_0.85fr] lg:p-7">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-black/70">{text.toolPage.about}</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-black">
              {text.toolPage.cleaner} {tToolTitle(resolvedTool)}
            </h2>
            <p className="mt-3 text-base leading-7 text-black/60">{text.toolPage.aboutText}</p>
          </div>
          <div className="grid gap-3 text-sm font-bold text-black/70">
            {text.toolPage.bullets.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-black/10 bg-white px-4 py-3">
                <CheckCircle2 className="h-5 w-5 flex-none text-brand-red" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <ToolSeoSections seo={seo} />
      </div>
    </section>
  );
}
