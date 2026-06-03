import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import UploadBox from '../components/UploadBox.jsx';
import ToolCard from '../components/ToolCard.jsx';
import SeoHelmet from '../components/seo/SeoHelmet.jsx';
import ToolSeoSections from '../components/seo/ToolSeoSections.jsx';
import { toolSchemas } from '../components/seo/schema.js';
import { allTools, defaultTool } from '../data/tools.js';
import { absoluteUrl, getToolSeoBySlug } from '../data/toolsSeoData.js';
import { useLanguage } from '../i18n.jsx';

const safeList = (items) => (Array.isArray(items) ? items.filter(Boolean) : []);

export default function ToolPage() {
  const { text, tCategory, tSeo, tToolTitle, tToolDescription } = useLanguage();
  const { slug } = useParams();
  const tool = allTools.find((item) => item.slug === slug) ?? defaultTool;
  const seo = tSeo(getToolSeoBySlug(tool.slug));
  const relatedTools = allTools.filter((item) => item.category === tool.category && item.slug !== tool.slug).slice(0, 4);
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
    : [tToolTitle(tool), tool.category];

  return (
    <section className="bg-white py-8 sm:py-12">
      <SeoHelmet
        title={seo?.seoTitle ?? `${tToolTitle(tool)} - FileWalaTool`}
        description={seo?.metaDescription ?? tToolDescription(tool)}
        canonical={seo?.canonicalUrl ?? absoluteUrl(seo?.route ?? `/tools/${tool.slug}`)}
        keywords={keywords}
        image={tool.imageUrl}
        jsonLd={seo ? toolSchemas(seo) : []}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="focus-ring inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold text-black/60 transition-colors duration-150 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4 text-brand-red" />
          {text.toolPage.allTools}
        </Link>

        <div className="mx-auto mt-6 max-w-3xl text-center">
          <p className="inline-flex rounded-md border border-black/10 bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-black">
            {tCategory(tool.category)}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-black">{seo?.h1 ?? tToolTitle(tool)}</h1>
          <p className="mt-4 text-lg leading-8 text-black/60">{seo?.shortIntro ?? tToolDescription(tool)}</p>
        </div>

        <div className="mt-10">
          <UploadBox tool={tool} />
        </div>

        <section className="mx-auto mt-10 grid max-w-5xl gap-4 lg:grid-cols-3">
          {text.toolPage.steps.map((item) => (
            <div key={item} className="rounded-md border border-black/10 bg-white p-5">
              <CheckCircle2 className="h-5 w-5 text-brand-red" />
              <p className="mt-3 text-sm font-bold leading-6 text-black/70">{item}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto mt-10 grid max-w-5xl gap-6 rounded-md border border-black/10 bg-white p-6 lg:grid-cols-[1fr_0.85fr] lg:p-7">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-black/70">{text.toolPage.about}</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-black">
              {text.toolPage.cleaner} {tToolTitle(tool)}
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

        {relatedTools.length > 0 && (
          <div className="mt-12">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-black/70">{text.toolPage.related}</p>
                <h2 className="mt-1 text-2xl font-black text-black">
                  {text.toolPage.more} {tCategory(tool.category)}
                </h2>
              </div>
              <Link to="/#tools" className="text-sm font-black text-black transition-colors duration-150 hover:text-black/70">
                {text.common.viewAllTools}
              </Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedTools.map((item) => (
                <ToolCard key={item.slug} tool={item} />
              ))}
            </div>
          </div>
        )}

        <ToolSeoSections seo={seo} />
      </div>
    </section>
  );
}
