import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n.jsx';

const quickLinks = [
  ['All Tools', '/#tools'],
  ['Image Tools', '/image-tools'],
  ['PDF Tools', '/pdf-tools'],
  ['Compress', '/compress'],
  ['Convert', '/?category=Convert#tools'],
];

const categories = [
  ['Merge PDF', '/merge-pdf'],
  ['Split PDF', '/split-pdf'],
  ['Compress PDF', '/compress-pdf'],
  ['Image to PDF', '/image-to-pdf'],
  ['PDF to JPG', '/pdf-to-jpg'],
  ['Image Resizer', '/image-resizer'],
  ['Compress Image', '/compress-image'],
  ['Background Remover', '/background-remover'],
];

const legalLinks = [
  ['Privacy Policy', '/privacy-policy'],
  ['Terms & Conditions', '/terms-and-conditions'],
];

export default function Footer() {
  const { text } = useLanguage();
  const linkLabel = (label) => text.categories[label] ?? text.footer[label] ?? label;

  return (
    <footer className="site-footer below-fold-section border-t border-black/10 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link to="/" className="focus-ring inline-flex rounded-lg" aria-label="FileWalaTool home">
              <picture>
                <source srcSet="/assets/logofilewalatoo-538.webp" type="image/webp" />
                <img
                  src="/assets/logofilewalatoo-538.png"
                  alt="FileWalaTool"
                  width="538"
                  height="140"
                  loading="lazy"
                  decoding="async"
                  className="h-[18px] w-auto max-w-[90px] object-contain"
                />
              </picture>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
              {text.footer.description}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-black">{text.footer.quickLinks}</h2>
            <nav className="mt-4 grid gap-3">
              {quickLinks.map(([label, href]) => (
                <Link key={label} to={href} className="text-sm font-semibold text-slate-700 transition hover:text-black">
                  {linkLabel(label)}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-black">{text.footer.categories}</h2>
            <nav className="mt-4 grid gap-3">
              {categories.map(([label, href]) => (
                <Link key={label} to={href} className="text-sm font-semibold text-slate-700 transition hover:text-black">
                  {label === 'Passport Photos'
                    ? text.footer.passportPhotos
                    : label === 'Background Remover'
                      ? text.footer.backgroundRemover
                      : linkLabel(label)}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-black/10 pt-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>{text.common.copyright}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {legalLinks.map(([label, href]) => (
              <Link key={href} to={href} className="text-slate-700 transition hover:text-black">
                {label === 'Privacy Policy'
                  ? text.common.privacy
                  : label === 'Terms & Conditions'
                    ? text.common.terms
                    : label === 'About Us'
                      ? 'About Us'
                      : label === 'Contact Us'
                        ? 'Contact Us'
                    : label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
