import { ArrowRight, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n.jsx';

export default function InfoPageLayout({
  title,
  description,
  metaTitle,
  metaDescription,
  ctaTitle,
  ctaDescription,
  ctaLabel,
  ctaHref = '/#tools',
  children,
}) {
  const { text } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{metaTitle ?? `${title} - FileWalaTool`}</title>
        <meta name="description" content={metaDescription ?? description} />
      </Helmet>

      <main className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black">
              <Sparkles className="h-4 w-4 text-brand-red" />
              {text.common.fileWalaTool}
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-black sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-black/60 sm:text-lg sm:leading-8">{description}</p>
          </header>

          <section className="mx-auto mt-8 max-w-5xl rounded-md border border-black/10 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            {children}
          </section>

          <section className="mx-auto mt-10 max-w-5xl rounded-md border border-black/10 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-black tracking-tight text-black">{ctaTitle ?? text.info.ctaTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-black/60 sm:text-base sm:leading-7">{ctaDescription ?? text.info.ctaDescription}</p>
              </div>
              <Link
                to={ctaHref}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800"
              >
                {ctaLabel ?? text.info.exploreAllTools}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
