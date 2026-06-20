import { ArrowRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import { SITE_URL } from '../data/siteMetadata.js';

const popularTools = [
  ['Image to PDF', '/image-to-pdf'],
  ['PDF to JPG', '/pdf-to-jpg'],
  ['Image to 50KB', '/compress/image-to-50kb'],
  ['Signature Resize', '/signature-resize'],
  ['PAN Photo Resize', '/pan-photo-resize'],
];

export default function NotFound() {
  return (
    <section className="bg-white py-12 sm:py-16">
      <SEO
        title="Page Not Found | FileWalaTool"
        description="The FileWalaTool page you are looking for may have been moved, deleted, or the link may be incorrect."
        canonical={`${SITE_URL}/404`}
        robots="noindex,follow"
        schema={[]}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-wide text-brand-red">404 Error</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-black sm:text-5xl">Page not found</h1>
          <p className="mt-4 text-base leading-7 text-black/60">
            The page you are looking for may have been moved, deleted, or the link may be incorrect.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand-red px-5 py-3 text-sm font-black text-white transition-colors hover:bg-black"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Go to Home
            </Link>
            <Link
              to="/compress-image"
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-5 py-3 text-sm font-black text-black transition-colors hover:border-black/30 hover:bg-black/[0.025]"
            >
              Try Image Compressor
              <ArrowRight className="h-4 w-4 text-brand-red" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <section className="mx-auto mt-10 max-w-4xl rounded-md border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-black text-black">Popular tools</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularTools.map(([label, href]) => (
              <Link
                key={href}
                to={href}
                className="focus-ring flex min-h-12 items-center justify-between gap-3 rounded-md border border-black/10 bg-white px-4 py-3 text-sm font-bold text-black/70 transition-colors hover:border-black/25 hover:text-black"
              >
                <span>{label}</span>
                <ArrowRight className="h-4 w-4 flex-none text-brand-red" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
