import { CheckCircle2, HelpCircle, LockKeyhole, Sparkles, TrendingUp } from 'lucide-react';
import RelatedTools from '../RelatedTools.jsx';
import { allTools } from '../../data/tools.js';
import { useLanguage } from '../../i18n.jsx';

export default function ToolSeoSections({ seo, activeTab }) {
  const { text, tLiteral } = useLanguage();
  if (!seo) return null;

  const howToUse = Array.isArray(seo.howToUse) ? seo.howToUse.filter(Boolean) : [];
  const features = Array.isArray(seo.features) ? seo.features.filter(Boolean) : [];
  const faqs = Array.isArray(seo.faqs) ? seo.faqs.filter((faq) => faq?.question && faq?.answer) : [];
  const relatedTools = (Array.isArray(seo.relatedTools) ? seo.relatedTools : [])
    .map((slug) => allTools.find((tool) => tool.slug === slug))
    .filter((tool) => tool && tool.slug !== seo.slug)
    .slice(0, seo.relatedToolsLimit ?? 4);

  return (
    <>
      <div className="mx-auto mt-10 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-black/60">{text.sections.aboutThisTool}</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-black">{seo.h1}</h2>
            <p className="mt-3 text-base leading-7 text-black/65">{seo.detailedIntro ?? seo.intro}</p>
          </div>
          <div className="rounded-md border border-black/10 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-blue-700" />
              <h2 className="text-base font-black text-black">{text.sections.trustPrivacy}</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-black/60">
              {text.toolPage.aboutText}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-md border border-dashed border-black/15 bg-black/[0.015] px-4 py-6 text-center text-xs font-bold uppercase tracking-wide text-black/35">
          {tLiteral('Advertisement')}
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-black/10 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-red" />
              <h2 className="text-xl font-black text-black">{text.sections.howToUse}</h2>
            </div>
            <ol className="mt-4 grid gap-3">
              {howToUse.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm font-semibold leading-6 text-black/70">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-blue-700 text-xs font-black text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-md border border-black/10 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-red" />
              <h2 className="text-xl font-black text-black">{text.sections.features}</h2>
            </div>
            <ul className="mt-4 grid gap-3">
              {features.map((feature) => (
                <li key={feature} className="flex gap-3 text-sm font-semibold leading-6 text-black/70">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-green-700" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {seo.benefits?.length > 0 && (
          <section className="mt-10 rounded-md border border-black/10 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-700" />
              <h2 className="text-xl font-black text-black">{seo.benefitsTitle ?? text.sections.benefits}</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {seo.benefits.map((benefit) => (
                <p key={benefit} className="rounded-md border border-black/10 bg-white p-4 text-sm font-semibold leading-6 text-black/65">
                  {benefit}
                </p>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10 rounded-md border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-700" />
            <h2 className="text-xl font-black text-black">{text.sections.faq}</h2>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {faqs.map((faq) => (
              <article key={faq.question} className="rounded-md border border-black/10 bg-white p-4">
                <h3 className="text-sm font-black text-black">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-black/60">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <RelatedTools tools={relatedTools} activeTab={activeTab} currentSlug={seo.slug} maxItems={seo.relatedToolsLimit ?? 4} />
    </>
  );
}
