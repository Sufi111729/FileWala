import { Link } from 'react-router-dom';
import { MonitorSmartphone, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import InfoPageLayout from '../../components/layouts/InfoPageLayout.jsx';
import { useLanguage } from '../../i18n.jsx';

const featureIcons = [Zap, ShieldCheck, MonitorSmartphone, Sparkles];

export default function AboutUs() {
  const { text } = useLanguage();

  return (
    <InfoPageLayout
      title={text.legal.aboutTitle}
      description={text.legal.aboutDescription}
      metaTitle={`${text.legal.aboutTitle} - FileWalaTool`}
      metaDescription={text.legal.aboutDescription}
      ctaTitle={text.home.title}
      ctaDescription={text.info.ctaDescription}
      ctaLabel={text.info.exploreAllTools}
      canonicalPath="/about-us"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-5">
          <section>
            <h2 className="text-xl font-black tracking-tight text-black">{text.legal.aboutTitle}</h2>
            <p className="mt-3 text-base leading-7 text-black/65">
              {text.legal.aboutDescription}
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black tracking-tight text-black">{text.home.eyebrow}</h2>
            <p className="mt-3 text-base leading-7 text-black/65">
              {text.home.description}
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black tracking-tight text-black">{text.sections.privacyFriendly}</h2>
            <p className="mt-3 text-base leading-7 text-black/65">
              {text.toolPage.aboutText}
            </p>
          </section>
          <Link className="font-black text-blue-700 hover:text-blue-800" to="/privacy-policy">
            {text.common.privacy}
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {text.home.features.map(([title, description], index) => {
            const Icon = featureIcons[index] ?? Sparkles;
            return (
            <article key={title} className="rounded-md border border-black/10 bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-brand-red ring-1 ring-black/10">
                <Icon className="h-5 w-5 text-brand-red" />
              </span>
              <h3 className="mt-5 text-base font-black text-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-black/60">{description}</p>
            </article>
            );
          })}
        </div>
      </div>
    </InfoPageLayout>
  );
}
