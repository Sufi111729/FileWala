export default function parsePageRange(input, totalPages, allowEmpty = false) {
  const value = String(input || '').trim();
  if (!value && allowEmpty) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (!value) throw new Error('Enter page numbers, for example 1,3,5-7.');
  const pages = new Set();
  value.split(',').map((part) => part.trim()).forEach((part) => {
    const match = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!match) throw new Error('Use valid page numbers like 1,3,5-7.');
    const start = Number(match[1]);
    const end = Number(match[2] || match[1]);
    if (start < 1 || end < start || end > totalPages) {
      throw new Error(`Page numbers must be between 1 and ${totalPages}.`);
    }
    for (let page = start; page <= end; page += 1) pages.add(page);
  });
  return [...pages].sort((a, b) => a - b);
}
