import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { organizationSchema, toolSchemas, websiteSchema } from '../src/components/seo/schema.js';
import { absoluteUrl, BRAND_LOGO_URL, SITE_URL, toolImageUrl } from '../src/data/siteMetadata.js';
import { allTools } from '../src/data/tools.js';
import { toolsSeoData } from '../src/data/toolsSeoData.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
const robots = 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1';

const staticPages = [
  { route: '/pdf-tools', title: 'PDF Tools Online | FileWalaTool', h1: 'PDF Tools', description: 'Use free PDF tools online to merge, split, compress, rotate, protect, unlock, and convert PDF files.' },
  { route: '/image-tools', title: 'Image Tools Online | FileWalaTool', h1: 'Image Tools', description: 'Use free image tools online to resize, compress, crop, convert, upscale, downscale, and prepare images.' },
  { route: '/compress', title: 'Compress Tools Online Free | FileWalaTool', h1: 'Compress Tools', description: 'Compress images and PDF files online for free with FileWalaTool.' },
  { route: '/documents', title: 'Document Tools Online Free | FileWalaTool', h1: 'Document Tools', description: 'Create, scan, resize, and prepare document files and official photos online.' },
  { route: '/about', title: 'About FileWalaTool', h1: 'About FileWalaTool', description: 'Learn about FileWalaTool and its free browser-based PDF, image, and document tools.' },
  { route: '/contact', title: 'Contact FileWalaTool', h1: 'Contact FileWalaTool', description: 'Contact FileWalaTool for support, feedback, business inquiries, or technical questions.' },
  { route: '/privacy-policy', title: 'Privacy Policy | FileWalaTool', h1: 'Privacy Policy', description: 'Read the FileWalaTool privacy policy and learn how the website handles files and visitor information.' },
  { route: '/terms-and-conditions', title: 'Terms and Conditions | FileWalaTool', h1: 'Terms and Conditions', description: 'Read the terms and conditions for using FileWalaTool online services.' },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function replaceMeta(html, selector, content) {
  const attribute = selector.startsWith('og:') ? 'property' : 'name';
  const pattern = new RegExp(`<meta\\s+${attribute}="${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'i');
  const tag = `<meta ${attribute}="${selector}" content="${escapeHtml(content)}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function renderItems(items = [], tagName = 'li') {
  return items.filter(Boolean).map((item) => `<${tagName}>${escapeHtml(item)}</${tagName}>`).join('');
}

function renderFaqs(faqs = []) {
  return faqs
    .filter((faq) => faq?.question && faq?.answer)
    .map((faq) => `<article><h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p></article>`)
    .join('');
}

function renderRelatedTools(seo) {
  const links = (seo.relatedTools ?? [])
    .map((slug) => allTools.find((tool) => tool.slug === slug))
    .filter((tool) => tool?.href && tool.slug !== seo.slug)
    .slice(0, seo.relatedToolsLimit ?? 4);

  if (links.length === 0) return '';

  return `<section><h2>Related tools</h2><ul>${links.map((tool) => `<li><a href="${tool.href}">${escapeHtml(tool.title)}</a></li>`).join('')}</ul></section>`;
}

function renderToolShell(page) {
  const seo = page.seo;
  const faqs = Array.isArray(seo.faqs) ? seo.faqs : [];
  const features = Array.isArray(seo.features) ? seo.features : [];
  const steps = Array.isArray(seo.howToUse) ? seo.howToUse : [];
  const benefits = Array.isArray(seo.benefits) ? seo.benefits : [];

  return `
<section class="bg-white py-10 sm:py-14">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="${seo.route}" aria-current="page">${escapeHtml(page.h1)}</a></nav>
    <p>${escapeHtml(seo.category)}</p>
    <h1>${escapeHtml(page.h1)}</h1>
    <p>${escapeHtml(seo.shortIntro ?? page.description)}</p>
    <section>
      <h2>About this tool</h2>
      <p>${escapeHtml(seo.detailedIntro ?? seo.intro ?? page.description)}</p>
      ${seo.privacyStatement ? `<p>${escapeHtml(seo.privacyStatement)}</p>` : ''}
    </section>
    <section>
      <h2>How to use</h2>
      <ol>${renderItems(steps)}</ol>
    </section>
    <section>
      <h2>${escapeHtml(seo.benefitsTitle ?? 'Why use this tool')}</h2>
      <ul>${renderItems(benefits.length ? benefits : features)}</ul>
    </section>
    ${seo.supportedFormats ? `<section><h2>Supported formats / output</h2><p>${escapeHtml(seo.supportedFormats)}</p></section>` : ''}
    <section>
      <h2>FAQ</h2>
      ${renderFaqs(faqs)}
    </section>
    ${renderRelatedTools(seo)}
  </div>
</section>`;
}

function renderNotFoundHtml() {
  let html = template
    .replace(/<title>[^<]*<\/title>/i, '<title>Page Not Found | FileWalaTool</title>')
    .replace(/<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${SITE_URL}/404" />`)
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');

  const rootStart = html.indexOf('<div id="root">');
  const bodyEnd = html.indexOf('</body>', rootStart);
  const shell = `<div id="root">
<section class="bg-white py-12 sm:py-16">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-3xl text-center">
      <p class="text-xs font-black uppercase tracking-wide text-brand-red">404 Error</p>
      <h1 class="mt-3 text-4xl font-black tracking-tight text-black sm:text-5xl">Page not found</h1>
      <p class="mt-4 text-base leading-7 text-black/60">The page you are looking for may have been moved, deleted, or the link may be incorrect.</p>
      <div class="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <a href="/" class="focus-ring inline-flex min-h-12 items-center justify-center rounded-md bg-brand-red px-5 py-3 text-sm font-black text-white">Go to Home</a>
        <a href="/compress-image" class="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-black/10 bg-white px-5 py-3 text-sm font-black text-black">Try Image Compressor</a>
      </div>
    </div>
    <section class="mx-auto mt-10 max-w-4xl rounded-md border border-black/10 bg-white p-5 shadow-sm sm:p-6">
      <h2 class="text-lg font-black text-black">Popular tools</h2>
      <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <a href="/image-to-pdf">Image to PDF</a>
        <a href="/pdf-to-jpg">PDF to JPG</a>
        <a href="/compress/image-to-50kb">Image to 50KB</a>
        <a href="/signature-resize">Signature Resize</a>
        <a href="/pan-photo-resize">PAN Photo Resize</a>
      </div>
    </section>
  </div>
</section>
</div>\n    `;

  if (rootStart >= 0 && bodyEnd > rootStart) {
    html = `${html.slice(0, rootStart)}${shell}  ${html.slice(bodyEnd)}`;
  }

  html = replaceMeta(html, 'description', 'The FileWalaTool page you are looking for may have been moved, deleted, or the link may be incorrect.');
  html = replaceMeta(html, 'robots', 'noindex,follow');
  html = replaceMeta(html, 'og:type', 'website');
  html = replaceMeta(html, 'og:site_name', 'FileWalaTool');
  html = replaceMeta(html, 'og:title', 'Page Not Found | FileWalaTool');
  html = replaceMeta(html, 'og:description', 'The FileWalaTool page you are looking for may have been moved, deleted, or the link may be incorrect.');
  html = replaceMeta(html, 'og:url', `${SITE_URL}/404`);
  html = replaceMeta(html, 'og:image', BRAND_LOGO_URL);
  html = replaceMeta(html, 'twitter:card', 'summary_large_image');
  html = replaceMeta(html, 'twitter:title', 'Page Not Found | FileWalaTool');
  html = replaceMeta(html, 'twitter:description', 'The FileWalaTool page you are looking for may have been moved, deleted, or the link may be incorrect.');
  html = replaceMeta(html, 'twitter:image', BRAND_LOGO_URL);
  fs.writeFileSync(path.join(distDir, '404.html'), html);
}

function renderPage(page) {
  const canonical = absoluteUrl(page.route);
  const image = page.image ?? toolImageUrl(page.route);
  const schemas = page.schemas ?? [{
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.h1,
    description: page.description,
    url: canonical,
    isPartOf: { '@type': 'WebSite', name: 'FileWalaTool', url: SITE_URL },
  }];
  let html = template
    .replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonical}" />`)
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');

  const rootStart = html.indexOf('<div id="root">');
  const bodyEnd = html.indexOf('</body>', rootStart);
  const pageShell = page.seo
    ? renderToolShell(page)
    : `<section class="bg-white py-10 sm:py-14"><div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8"><h1 class="text-4xl font-black leading-tight tracking-tight text-black sm:text-5xl">${escapeHtml(page.h1)}</h1><p class="mt-4 text-base leading-7 text-black/60">${escapeHtml(page.description)}</p></div></section>`;
  const shell = `<div id="root">${pageShell}</div>\n    `;
  if (rootStart >= 0 && bodyEnd > rootStart) {
    html = `${html.slice(0, rootStart)}${shell}  ${html.slice(bodyEnd)}`;
  }

  html = replaceMeta(html, 'description', page.description);
  html = replaceMeta(html, 'robots', page.robots ?? robots);
  html = replaceMeta(html, 'og:type', 'website');
  html = replaceMeta(html, 'og:site_name', 'FileWalaTool');
  html = replaceMeta(html, 'og:title', page.ogTitle ?? page.title);
  html = replaceMeta(html, 'og:description', page.ogDescription ?? page.description);
  html = replaceMeta(html, 'og:url', canonical);
  html = replaceMeta(html, 'og:image', image);
  html = replaceMeta(html, 'og:image:alt', page.imageAlt ?? page.ogTitle ?? page.title);
  html = replaceMeta(html, 'twitter:card', 'summary_large_image');
  html = replaceMeta(html, 'twitter:title', page.twitterTitle ?? page.ogTitle ?? page.title);
  html = replaceMeta(html, 'twitter:description', page.twitterDescription ?? page.ogDescription ?? page.description);
  html = replaceMeta(html, 'twitter:image', image);
  html = html.replace('</head>', `${schemas.map((schema) => `    <script type="application/ld+json" data-filewala-seo="true">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>`).join('\n')}\n  </head>`);

  const outputDir = path.join(distDir, page.route.slice(1));
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'index.html'), html);
}

for (const page of staticPages) renderPage(page);

for (const seo of toolsSeoData) {
  renderPage({
    route: seo.route,
    title: seo.seoTitle,
    h1: seo.h1,
    description: seo.metaDescription,
    ogDescription: seo.ogDescription,
    twitterDescription: seo.twitterDescription,
    image: toolImageUrl(seo.route),
    imageAlt: seo.imageAlt,
    seo,
    schemas: toolSchemas(seo),
  });
}

renderPage({
  route: '/',
  title: 'FileWalaTool - Free Online Image & PDF Tools',
  h1: 'Free Online Image and PDF Tools',
  description: 'Use FileWalaTool to resize images, compress files, convert JPG to PDF, merge PDF, split PDF, remove backgrounds, and edit documents online for free.',
  ogDescription: 'Resize images, compress files, convert JPG to PDF, merge PDF, split PDF, remove backgrounds, and edit documents online for free with FileWalaTool.',
  twitterDescription: 'Free online PDF and image tools to resize images, compress photos, convert files, merge PDFs, split PDFs, and remove backgrounds.',
  image: BRAND_LOGO_URL,
  schemas: [organizationSchema(), websiteSchema()],
});

renderPage({
  route: '/admin/contact-messages',
  title: 'Contact Messages Admin | FileWalaTool',
  h1: 'Contact Dashboard Login',
  description: 'FileWalaTool contact message administration.',
  robots: 'noindex,nofollow',
  schemas: [],
});

renderNotFoundHtml();

console.log(`Generated static SEO HTML for ${staticPages.length + toolsSeoData.length + 3} routes.`);
