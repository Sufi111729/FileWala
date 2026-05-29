import { Link } from 'react-router-dom';
import { MonitorSmartphone, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import InfoPageLayout from '../../components/layouts/InfoPageLayout.jsx';
import { useLanguage } from '../../i18n.jsx';

const features = [
  ['Fast Processing', 'Lightweight tools help you finish common file tasks quickly.', Zap],
  ['Secure Uploads', 'Browser-first workflows reduce unnecessary file transfer whenever possible.', ShieldCheck],
  ['Mobile Friendly', 'Responsive layouts work cleanly on phones, tablets, and desktops.', MonitorSmartphone],
  ['Simple UI', 'Clear steps and compact controls keep tools easy to use.', Sparkles],
];

export default function AboutUs() {
  const { text } = useLanguage();

  return (
    <InfoPageLayout
      title={text.legal.aboutTitle}
      description={text.legal.aboutDescription}
      metaTitle="About FileWalaTool - Image, PDF, and Document Tools"
      metaDescription="Learn what FileWalaTool is, why it was created, and how it helps users prepare images, PDFs, and documents quickly online."
      ctaTitle="Explore tools built for everyday file work"
      ctaDescription="Resize photos, compress images, edit PDFs, prepare signatures, and scan documents from one FileWalaTool workspace."
      ctaLabel={text.info.exploreAllTools}
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-5">
          <section>
            <h2 className="text-xl font-black tracking-tight text-black">{text.legal.aboutTitle}</h2>
            <p className="mt-3 text-base leading-7 text-black/65">
              FileWalaTool is a collection of simple online tools for images, PDFs, and documents. It helps users resize photos, compress files, prepare official document images, scan documents, and complete everyday file tasks without complex software.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black tracking-tight text-black">{text.legal.aboutWhy ?? 'Why it was created'}</h2>
            <p className="mt-3 text-base leading-7 text-black/65">
              FileWalaTool was created for people who need quick, practical tools that work well on mobile and desktop. The focus is especially useful for India-focused workflows such as passport photos, Aadhaar photo resizing, PAN photo resizing, signatures, and common online form requirements.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black tracking-tight text-black">{text.legal.aboutApproach ?? 'Our approach'}</h2>
            <p className="mt-3 text-base leading-7 text-black/65">
              We prioritize browser-based processing, fast loading, clean controls, readable previews, and privacy-friendly defaults. Future plans include more document utilities, better PDF workflows, and clearer tool guidance for real upload requirements.
            </p>
          </section>
          <Link className="font-black text-blue-700 hover:text-blue-800" to="/privacy-policy">
            Read our privacy approach
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {features.map(([title, description, Icon]) => (
            <article key={title} className="rounded-md border border-black/10 bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-brand-red ring-1 ring-black/10">
                <Icon className="h-5 w-5 text-brand-red" />
              </span>
              <h3 className="mt-5 text-base font-black text-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-black/60">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </InfoPageLayout>
  );
}
