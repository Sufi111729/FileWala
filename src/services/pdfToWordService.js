import { loadPdfJsDocument } from '../utils/pdfHelpers.js';

export async function convertPdfToWord(file, onProgress) {
  const { Document, Packer, PageBreak, Paragraph, TextRun } = await import('docx');
  const pdf = await loadPdfJsDocument(file);
  const children = [];
  let extractedCharacters = 0;

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    onProgress?.(`Extracting page ${pageNumber} of ${pdf.numPages}...`);
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const lines = new Map();
    content.items.forEach((item) => {
      const y = Math.round(item.transform?.[5] ?? 0);
      lines.set(y, `${lines.get(y) || ''}${lines.has(y) ? ' ' : ''}${item.str}`.trim());
    });
    const pageLines = [...lines.entries()].sort((a, b) => b[0] - a[0]).map((entry) => entry[1]).filter(Boolean);
    extractedCharacters += pageLines.join('').replace(/\s/g, '').length;
    pageLines.forEach((line) => children.push(new Paragraph({ children: [new TextRun(line)] })));
    if (pageNumber < pdf.numPages) children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  if (extractedCharacters < Math.max(20, pdf.numPages * 10)) {
    throw new Error('This PDF looks like scanned/image PDF. OCR is required for Word conversion.');
  }
  const document = new Document({ sections: [{ children }] });
  return Packer.toBlob(document);
}
