export const SITE_URL = 'https://www.filewalatool.com';
export const BRAND_NAME = 'FileWalaTool';
export const BRAND_ASSET_VERSION = '2';
export const BRAND_LOGO_URL = `${SITE_URL}/logo.png?v=${BRAND_ASSET_VERSION}`;
export const BRAND_ICON_URL = `${SITE_URL}/favicon-32x32.png?v=${BRAND_ASSET_VERSION}`;
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
