export const SITE_URL = 'https://www.filewalatool.com';
export const BRAND_NAME = 'FileWalaTool';
export const BRAND_FOUNDER = 'Muhammad Sufiyan';
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

const TOOL_IMAGE_BY_PATH = {
  '/merge-pdf': 'merge-pdf-tool-filewalatool.webp',
  '/split-pdf': 'split-pdf-tool-filewalatool.webp',
  '/compress-pdf': 'compress-pdf-tool-filewalatool.webp',
  '/pdf-to-jpg': 'pdf-to-jpg-converter-filewalatool.webp',
  '/image-to-pdf': 'image-to-pdf-converter-filewalatool.webp',
  '/pdf-to-word': 'pdf-to-word-converter-filewalatool.webp',
  '/word-to-pdf': 'word-to-pdf-converter-filewalatool.webp',
  '/protect-pdf': 'protect-pdf-tool-filewalatool.webp',
  '/unlock-pdf': 'unlock-pdf-tool-filewalatool.webp',
  '/pdf-rotate': 'rotate-pdf-tool-filewalatool.webp',
  '/pdf-page-delete': 'delete-pdf-pages-tool-filewalatool.webp',
  '/watermark-pdf': 'watermark-pdf-tool-filewalatool.webp',
  '/image-resizer': 'image-resizer-tool-filewalatool.webp',
  '/compress-image': 'image-compressor-tool-filewalatool.webp',
  '/kb-resizer': 'image-kb-resizer-filewalatool.webp',
  '/tools/crop-image': 'crop-image-tool-filewalatool.webp',
  '/batch-image-cropper': 'batch-image-cropper-filewalatool.webp',
  '/jpg-to-png': 'jpg-to-png-converter-filewalatool.webp',
  '/png-to-jpg': 'png-to-jpg-converter-filewalatool.webp',
  '/background-remover': 'background-remover-filewalatool.webp',
  '/image-upscaler': 'image-upscaler-filewalatool.webp',
  '/image-downscaler': 'image-downscaler-filewalatool.webp',
  '/passport-photo-maker': 'passport-photo-maker-filewalatool.webp',
  '/signature-resize': 'signature-resize-tool-filewalatool.webp',
  '/compress/image-to-20kb': 'photo-to-20kb-resizer-filewalatool.webp',
  '/compress/image-to-50kb': 'photo-to-50kb-resizer-filewalatool.webp',
  '/compress/image-to-100kb': 'photo-to-100kb-resizer-filewalatool.webp',
  '/aadhaar-photo-resize': 'aadhaar-photo-resizer-filewalatool.webp',
  '/pan-photo-resize': 'pan-photo-resizer-filewalatool.webp',
  '/resume-builder': 'resume-builder-filewalatool.webp',
  '/document-scanner': 'document-scanner-filewalatool.webp',
};

export function toolImageUrl(path = '/') {
  const pathname = path.startsWith('http') ? new URL(path).pathname : path;
  const fileName = TOOL_IMAGE_BY_PATH[pathname];
  return fileName ? `${SITE_URL}/tool-previews/${fileName}` : BRAND_LOGO_URL;
}

export function absoluteUrl(path = '/') {
  if (!path || path === '/') return `${SITE_URL}/`;
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
