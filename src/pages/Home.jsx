import { MonitorSmartphone, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { Component, Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import SeoHelmet from '../components/seo/SeoHelmet.jsx';
import { organizationSchema, toolItemListSchema, webApplicationSchema, websiteSchema } from '../components/seo/schema.js';
import { SITE_URL } from '../data/siteMetadata.js';
import { allTools } from '../data/tools.js';
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
    if (category && validTabs.includes(category)) {
      setActiveTab(category);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'All Tools' ? {} : { category: tab }, { replace: true });
  };

  return (
    <>
      <SeoHelmet
        title="FileWalaTool - Free Online Image & PDF Tools"
        description="Resize images, compress files, convert JPG to PDF, merge PDF, split PDF, remove backgrounds, and edit documents online for free with FileWalaTool."
        canonical={SITE_URL}
        keywords={[
          'FileWalaTool',
          'File Wala Tool',
          'file wala tool',
          'free online file tools',
          'pdf tools',
          'image tools',
          'document tools India',
        ]}
        jsonLd={[websiteSchema(), organizationSchema(), webApplicationSchema(), toolItemListSchema(allTools)]}
      />
      <Hero searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <SilentToolGridBoundary>
        <Suspense fallback={<ToolGridReserve />}>
          <ToolGrid searchTerm={searchTerm} activeTab={activeTab} onTabChange={handleTabChange} />
        </Suspense>
      </SilentToolGridBoundary>
      <section className="why-section below-fold-section bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-black uppercase tracking-wide text-black/70">{text.home.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-black">
              {text.home.title}
            </h2>
            <p className="mt-3 text-base leading-7 text-black/60">
              {text.home.description}
              {' '}FileWalaTool is a free online file tool platform for PDF, image, document, resize, compress, and converter tools.
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
