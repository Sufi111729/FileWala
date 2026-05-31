import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToolCard from '../ToolCard.jsx';
import CategoryTabs from '../navigation/CategoryTabs.jsx';
import SeoHelmet from '../seo/SeoHelmet.jsx';
import ToolSeoSections from '../seo/ToolSeoSections.jsx';
import { toolSchemas } from '../seo/schema.js';
import { allTools } from '../../data/tools.js';
import { absoluteUrl } from '../../data/toolsSeoData.js';
import { useLanguage } from '../../i18n.jsx';

const workflowSteps = [
  'Upload your file using the secure drag and drop area.',
  'Choose a processing mode that fits quality or file size.',
  'Process the file and download the finished result.',
];

const aboutBullets = [
  'Works directly in your browser.',
  'Designed for fast document upload requirements.',
  'Keeps the tool simple on mobile and desktop.',
];

const defaultRelatedTitles = [
  'Compress Image',
  'Crop Image',
  'JPG to PNG',
  'Signature Resize',
  'Document Scanner',
];

export default function ToolPageLayout({
  title,
  description,
  category = 'Documents',
  activeTab = 'Documents',
  relatedTitles = defaultRelatedTitles,
  seo,
  children,
}) {
  const { text } = useLanguage();
  const relatedTools = relatedTitles
    .map((toolTitle) => allTools.find((tool) => tool.title === toolTitle))
    .filter((tool) => tool && tool.title !== title)
    .slice(0, 5);

  return (
    <section className="bg-white py-10 sm:py-14">
      <SeoHelmet
        title={seo?.seoTitle ?? `${title} - FileWalaTool`}
        description={seo?.metaDescription ?? description}
        canonical={seo?.canonicalUrl ?? absoluteUrl(seo?.route ?? '/documents')}
        keywords={seo ? [seo.primaryKeyword, ...seo.secondaryKeywords, ...seo.longTailKeywords, ...seo.questionKeywords, ...seo.indiaKeywords, ...seo.brandKeywords, ...seo.alternateNames] : [title, category]}
        jsonLd={seo ? toolSchemas(seo) : []}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black">
            <Sparkles className="h-4 w-4 text-brand-red" />
            {text.toolsLibrary.label}
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-black sm:text-5xl">
            {seo?.h1 ?? text.toolsLibrary.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-black/60 sm:text-lg sm:leading-8">{seo?.shortIntro ?? description}</p>
        </div>

        <div className="mt-7">
          <CategoryTabs activeTab={activeTab} />
        </div>

        <div className="mt-7 rounded-md border border-black/10 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">{category}</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-black sm:text-3xl">{title}</h2>
          </div>
          {children}
        </div>

        <section className="mx-auto mt-10 grid max-w-5xl gap-4 lg:grid-cols-3">
          {text.documentTool.workflow.map((item) => (
            <div key={item} className="rounded-md border border-black/10 bg-white p-5 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-brand-red" />
              <p className="mt-3 text-sm font-bold leading-6 text-black/70">{item}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto mt-10 grid max-w-5xl gap-6 rounded-md border border-black/10 bg-white p-6 shadow-sm lg:grid-cols-[1fr_0.85fr] lg:p-7">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-black/70">{text.documentTool.about}</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-black">
              {text.documentTool.cleanerPrefix} {title}
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

        {relatedTools.length > 0 && (
          <section className="mt-12">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-black/70">{text.documentTool.related}</p>
                <h2 className="mt-1 text-2xl font-black text-black">{text.documentTool.moreTools}</h2>
              </div>
              <Link to="/#tools" className="text-sm font-black text-black transition-colors duration-150 hover:text-black/70">
                {text.common.viewAllTools}
              </Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {relatedTools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} activeTab={activeTab} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 flex justify-center">
          <Link
            to="/#tools"
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800"
          >
            {text.common.viewAllTools}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ToolSeoSections seo={seo} activeTab={activeTab} />
      </div>
    </section>
  );
}
