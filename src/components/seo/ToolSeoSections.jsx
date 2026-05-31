import { CheckCircle2, HelpCircle, LockKeyhole, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToolCard from '../ToolCard.jsx';
import { allTools } from '../../data/tools.js';

export default function ToolSeoSections({ seo, activeTab }) {
  if (!seo) return null;

  const howToUse = Array.isArray(seo.howToUse) ? seo.howToUse.filter(Boolean) : [];
  const features = Array.isArray(seo.features) ? seo.features.filter(Boolean) : [];
  const faqs = Array.isArray(seo.faqs) ? seo.faqs.filter((faq) => faq?.question && faq?.answer) : [];
  const relatedTools = (Array.isArray(seo.relatedTools) ? seo.relatedTools : [])
    .map((slug) => allTools.find((tool) => tool.slug === slug))
    .filter(Boolean)
    .slice(0, 6);

  return (
    <div className="mx-auto mt-10 max-w-6xl">
      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-black/60">About this tool</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-black">{seo.h1}</h2>
          <p className="mt-3 text-base leading-7 text-black/65">{seo.detailedIntro ?? seo.intro}</p>
        </div>
        <div className="rounded-md border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-5 w-5 text-blue-700" />
            <h2 className="text-base font-black text-black">Trust and privacy</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-black/60">
            FileWalaTool is built for practical file preparation with clear controls, no forced signup, and privacy-minded
            browser workflows wherever possible. Always keep your own copy of important files before processing.
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-md border border-dashed border-black/15 bg-black/[0.015] px-4 py-6 text-center text-xs font-bold uppercase tracking-wide text-black/35">
        Advertisement
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-brand-red" />
            <h2 className="text-xl font-black text-black">How to use</h2>
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
            <h2 className="text-xl font-black text-black">Features</h2>
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
            <h2 className="text-xl font-black text-black">Benefits</h2>
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
          <h2 className="text-xl font-black text-black">Frequently asked questions</h2>
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

      {relatedTools.length > 0 && (
        <section className="mt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-black/60">Related tools</p>
              <h2 className="mt-1 text-2xl font-black text-black">More useful FileWalaTool options</h2>
            </div>
            <Link to="/#tools" className="text-sm font-black text-black hover:text-black/70">
              View all tools
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} activeTab={activeTab} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
