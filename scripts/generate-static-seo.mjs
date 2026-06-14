import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { organizationSchema, toolSchemas, websiteSchema } from '../src/components/seo/schema.js';
import { absoluteUrl, BRAND_LOGO_URL, SITE_URL, toolImageUrl } from '../src/data/siteMetadata.js';
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
  const shell = `<div id="root"><section class="bg-white py-10 sm:py-14"><div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8"><h1 class="text-4xl font-black leading-tight tracking-tight text-black sm:text-5xl">${escapeHtml(page.h1)}</h1><p class="mt-4 text-base leading-7 text-black/60">${escapeHtml(page.description)}</p></div></section></div>\n    `;
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

console.log(`Generated static SEO HTML for ${staticPages.length + toolsSeoData.length + 2} routes.`);
