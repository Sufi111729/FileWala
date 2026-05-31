import { Archive, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SeoHelmet from '../../components/seo/SeoHelmet.jsx';
import { absoluteUrl } from '../../data/siteMetadata.js';
import { useLanguage } from '../../i18n.jsx';

const compressTools = [
  {
    title: 'Image Compressor',
    href: '/compress/image-compressor',
    description: 'Compress JPG, PNG, and WEBP images with quality presets.',
  },
  {
    title: 'Image to 20KB',
    href: '/compress/image-to-20kb',
    description: 'Compress an image to a 20KB target for online uploads.',
  },
  {
    title: 'Image to 50KB',
    href: '/compress/image-to-50kb',
    description: 'Compress an image to a 50KB target while keeping it clear.',
  },
  {
    title: 'Image to 100KB',
    href: '/compress/image-to-100kb',
    description: 'Compress an image to a 100KB target for forms and documents.',
  },
  {
    title: 'Custom Image KB Resizer',
    href: '/compress/custom-image-kb-resizer',
    description: 'Choose your own target KB and compress using canvas.',
  },
  {
    title: 'PDF Compressor',
    href: '/compress/pdf-compressor',
    description: 'Apply basic browser-side PDF optimization and download.',
  },
];

export default function CompressTools() {
  const { text } = useLanguage();

  return (
    <section className="bg-white py-10 sm:py-14">
      <SeoHelmet
        title="Compress Tools Online - Image and PDF Compressor | FileWalaTool"
        description="Compress images, photos, and PDFs online with FileWalaTool. Resize files to 20KB, 50KB, 100KB, or a custom KB target for uploads."
        canonical={absoluteUrl('/compress')}
        keywords={['compress image', 'image to 20kb', 'image to 50kb', 'compress pdf', 'photo compressor', 'custom kb resizer']}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-wide text-green-700">{text.categories.Compress}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-black sm:text-4xl">{text.categories.Compress} {text.grid.tools}</h1>
          <p className="mt-4 text-base leading-7 text-black/60">
            Compress images and PDFs directly in your browser with upload, preview, processing, and download.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {compressTools.map((tool) => (
            <Link
              key={tool.href}
              to={tool.href}
              className="group rounded-md border border-black/10 bg-white p-5 shadow-sm transition-colors hover:border-green-300 hover:bg-green-50/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-green-50 text-green-700">
                <Archive className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-lg font-black text-black">{tool.title}</h2>
              <p className="mt-2 min-h-16 text-sm leading-6 text-black/60">{tool.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-black">
                {text.common.openTool}
                <ArrowRight className="h-4 w-4 text-green-700" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
