import { loadPdfJsDocument } from './pdfHelpers.js';

export async function extractPdfTextPreview(file, limit = 1000) {
  const pdf = await loadPdfJsDocument(file);
  const parts = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages && parts.join(' ').length < limit; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      parts.push(content.items.map((item) => item.str).filter(Boolean).join(' '));
      page.cleanup();
    }
  } finally {
    await pdf.destroy?.();
  }

  const text = parts.join('\n').replace(/\s+/g, ' ').trim();
  return {
    text: text.slice(0, limit),
    isScanned: text.replace(/\s/g, '').length < 20,
  };
}

export function isPdfFile(file) {
  return Boolean(file && (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)));
}
