import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import CategoryTabs from '../navigation/CategoryTabs.jsx';
import SeoHelmet from '../seo/SeoHelmet.jsx';
import ToolSeoSections from '../seo/ToolSeoSections.jsx';
import { toolSchemas } from '../seo/schema.js';
import { allTools } from '../../data/tools.js';
import { absoluteUrl } from '../../data/siteMetadata.js';
import { useLanguage } from '../../i18n.jsx';

export default function ToolPageLayout({
  title,
  description,
  category = 'Documents',
  activeTab = 'Documents',
  seo,
  children,
}) {
  const { text, tCategory, tSeo, tToolTitle, tToolDescription } = useLanguage();
  const localizedSeo = tSeo(seo);
  const currentTool = allTools.find((tool) => tool.title === title);
  const localizedTitle = currentTool ? tToolTitle(currentTool) : title;
  const localizedDescription = currentTool ? tToolDescription(currentTool) : description;

  return (
    <section className="bg-white py-4 sm:py-6">
      <SeoHelmet
        title={localizedSeo?.seoTitle ?? `${localizedTitle} - FileWalaTool`}
        description={localizedSeo?.metaDescription ?? localizedDescription}
        canonical={localizedSeo?.canonicalUrl ?? absoluteUrl(localizedSeo?.route ?? '/documents')}
        image={localizedSeo?.imageUrl}
        imageAlt={localizedSeo?.imageAlt}
        ogDescription={localizedSeo?.ogDescription}
        twitterDescription={localizedSeo?.twitterDescription}
        keywords={localizedSeo ? [localizedSeo.primaryKeyword, ...localizedSeo.secondaryKeywords, ...localizedSeo.longTailKeywords, ...localizedSeo.questionKeywords, ...localizedSeo.indiaKeywords, ...localizedSeo.brandKeywords, ...localizedSeo.alternateNames] : [localizedTitle, category]}
        jsonLd={localizedSeo ? toolSchemas(localizedSeo) : []}
      />
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-0">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-wide text-blue-700">{tCategory(category)}</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-black sm:text-3xl">
            {localizedSeo?.h1 ?? localizedTitle ?? text.toolsLibrary.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-black/60 sm:text-base">{localizedSeo?.shortIntro ?? localizedDescription}</p>
        </div>

        <div className="mt-4">
          <CategoryTabs activeTab={activeTab} />
        </div>

        <div className="mt-4 rounded-md border border-black/10 bg-white p-3 shadow-sm sm:p-4">
          {children}
        </div>

        <section className="mx-auto mt-8 grid max-w-5xl gap-4 lg:grid-cols-3">
          {text.documentTool.workflow.map((item) => (
            <div key={item} className="rounded-md border border-black/10 bg-white p-5 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-brand-red" />
              <p className="mt-3 text-sm font-bold leading-6 text-black/70">{item}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto mt-8 grid max-w-5xl gap-6 rounded-md border border-black/10 bg-white p-6 shadow-sm lg:grid-cols-[1fr_0.85fr] lg:p-7">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-black/70">{text.documentTool.about}</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-black">
              {text.documentTool.cleanerPrefix} {localizedTitle}
            </h2>
            <p className="mt-3 text-base leading-7 text-black/60">
              {text.documentTool.aboutText}
            </p>
          </div>
          <div className="grid gap-3 text-sm font-bold text-black/70">
            {text.documentTool.bullets.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-black/10 bg-white px-4 py-3">
                <CheckCircle2 className="h-5 w-5 flex-none text-brand-red" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 flex justify-center">
          <Link
            to="/#tools"
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800"
          >
            {text.common.viewAllTools}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ToolSeoSections seo={localizedSeo} activeTab={activeTab} />
      </div>
    </section>
  );
}
