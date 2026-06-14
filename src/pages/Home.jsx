import { Download, MonitorSmartphone, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { Component, Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import SEO from '../components/SEO.jsx';
import { organizationSchema, websiteSchema } from '../components/seo/schema.js';
import { SITE_URL } from '../data/siteMetadata.js';
import { useLanguage } from '../i18n.jsx';
import { lazyWithRetry } from '../utils/lazyPage.js';

const ToolGrid = lazyWithRetry(() => import('../components/ToolGrid.jsx'));

const validTabs = ['All Tools', 'Resize', 'Compress', 'Convert', 'PDF Tools', 'Image Tools', 'Documents'];

const features = [
  {
    title: 'Fast Processing',
    description: 'Optimized flows keep every tool quick and lightweight.',
    icon: Zap,
  },
  {
    title: 'Secure File Handling',
    description: 'Clear upload states and privacy-minded file workflows.',
    icon: ShieldCheck,
  },
  {
    title: 'No Signup Required',
    description: 'Start editing, converting, and resizing without friction.',
    icon: Sparkles,
  },
  {
    title: 'Works on Mobile/Desktop',
    description: 'Responsive layouts feel natural on every screen size.',
    icon: MonitorSmartphone,
  },
];

function ToolGridReserve() {
  return <section id="tools" className="tools-grid-section bg-white" aria-hidden="true" />;
}

class SilentToolGridBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return <ToolGridReserve />;
    return this.props.children;
  }
}

export default function Home() {
  const { text } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All Tools');
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const category = searchParams.get('category');
    const query = searchParams.get('q');
    if (category && validTabs.includes(category)) {
      setActiveTab(category);
    }
    if (query) setSearchTerm(query);
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'All Tools' ? {} : { category: tab }, { replace: true });
  };

  return (
    <>
      <SEO
        title="FileWalaTool - Free Online Image & PDF Tools"
        description="Use FileWalaTool to resize images, compress files, convert JPG to PDF, merge PDF, split PDF, remove backgrounds, and edit documents online for free."
        canonical={`${SITE_URL}/`}
        image={`${SITE_URL}/logo.png?v=2`}
        ogDescription="Resize images, compress files, convert JPG to PDF, merge PDF, split PDF, remove backgrounds, and edit documents online for free with FileWalaTool."
        twitterDescription="Free online PDF and image tools to resize images, compress photos, convert files, merge PDFs, split PDFs, and remove backgrounds."
        keywords={[
          'FileWalaTool',
          'File Wala Tool',
          'FileWala',
          'File Wala',
          'file wala tool',
          'free online file tools',
          'free pdf tools',
          'free image tools',
        ]}
        schema={[organizationSchema(), websiteSchema()]}
      />
      <Hero searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <SilentToolGridBoundary>
        <Suspense fallback={<ToolGridReserve />}>
          <ToolGrid searchTerm={searchTerm} activeTab={activeTab} onTabChange={handleTabChange} />
        </Suspense>
      </SilentToolGridBoundary>
      <section id="download-app" className="below-fold-section scroll-mt-36 border-y border-black/10 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl bg-slate-950 px-6 py-8 text-white shadow-lg sm:px-10 sm:py-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-red">
                  <MonitorSmartphone className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-red-300">FileWalaTool for Android</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Download the FileWalaTool app</h2>
                <p className="mt-3 text-base leading-7 text-white/70">
                  Use FileWalaTool on your Android phone. Download the APK directly and install the latest available app package.
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 lg:items-end">
                <a
                  href="/downloads/Filewalatool.apk"
                  download="Filewalatool.apk"
                  className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand-red px-6 py-3 text-base font-black text-white transition-colors hover:bg-white hover:text-black"
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                  Download APK
                </a>
                <p className="text-sm font-semibold text-white/55">Android APK · 21 MB</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="why-section below-fold-section bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-black uppercase tracking-wide text-black/70">{text.home.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-black">
              {text.home.title}
            </h2>
            <p className="mt-3 text-base leading-7 text-black/60">
              {text.home.description}
              {' '}FileWalaTool is a free online toolkit for PDF tools, image tools, file conversion, image compression, PDF compression, document tools, and form-ready photo resizing.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const translatedFeature = text.home.features[index] ?? [feature.title, feature.description];
              return (
                <article
                  key={feature.title}
                  className="rounded-md border border-black/10 bg-white p-5 shadow-sm transition-colors duration-150 hover:border-black/20"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-brand-red ring-1 ring-black/10">
                    <Icon className="h-5 w-5 text-brand-red" />
                  </span>
                  <h2 className="mt-5 text-base font-black text-black">{translatedFeature[0]}</h2>
                  <p className="mt-2 text-sm leading-6 text-black/60">{translatedFeature[1]}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
