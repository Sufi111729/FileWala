export const SITE_URL = 'https://www.filewalatool.com';
export const BRAND_NAME = 'FileWalaTool';
export const BRAND_ALIASES = [
  'FileWalaTool',
  'File Wala Tool',
  'filewalatool',
  'file wala tool',
  'Filewala',
  'file wala',
  'File Tool',
  'File Tools',
  'Online File Tool',
  'Free File Tool',
];

export function absoluteUrl(path = '/') {
  if (!path || path === '/') return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
