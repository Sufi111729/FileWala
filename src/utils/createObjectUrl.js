export default function createObjectUrl(blob) {
  if (!(blob instanceof Blob)) return '';
  return URL.createObjectURL(blob);
}

export function revokeObjectUrl(url) {
  if (typeof url === 'string' && url.startsWith('blob:')) URL.revokeObjectURL(url);
}
