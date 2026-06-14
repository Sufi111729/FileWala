import fs from 'node:fs';
import { allTools } from '../src/data/tools.js';
import { getToolSeoBySlug } from '../src/data/toolsSeoData.js';

const baseUrl = 'https://www.filewalatool.com';
const lastModified = new Date().toISOString().slice(0, 10);
const escapeXml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const staticPaths = ['/', '/pdf-tools', '/image-tools', '/compress', '/documents', '/about', '/contact', '/privacy-policy', '/terms-and-conditions'];

const toolEntries = allTools.map((tool) => ({
  loc: `${baseUrl}${tool.href}`,
  image: tool.imageUrl,
  title: tool.imageTitle,
  caption: tool.imageCaption,
  priority: getToolSeoBySlug(tool.slug)?.priority ?? 0.85,
}));

const imageXml = ({ loc, image, title, caption }) =>
  `<image:image><image:loc>${image}</image:loc><image:title>${escapeXml(title)}</image:title><image:caption>${escapeXml(caption)}</image:caption></image:image>`;

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ...staticPaths.map((path, index) =>
    `  <url><loc>${baseUrl}${path}</loc><lastmod>${lastModified}</lastmod><changefreq>${index === 0 ? 'daily' : 'monthly'}</changefreq><priority>${index === 0 ? '1.0' : '0.6'}</priority></url>`,
  ),
  ...toolEntries.map((entry) =>
    `  <url><loc>${entry.loc}</loc><lastmod>${lastModified}</lastmod><changefreq>monthly</changefreq><priority>${entry.priority}</priority>${imageXml(entry)}</url>`,
  ),
  '</urlset>',
].join('\n');

const imageSitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ...toolEntries.map((entry) => `  <url><loc>${entry.loc}</loc>${imageXml(entry)}</url>`),
  '</urlset>',
].join('\n');

fs.writeFileSync(new URL('../public/sitemap.xml', import.meta.url), `${sitemap}\n`);
fs.writeFileSync(new URL('../public/image-sitemap.xml', import.meta.url), `${imageSitemap}\n`);

console.log(`Generated sitemap entries for ${toolEntries.length} tools.`);
