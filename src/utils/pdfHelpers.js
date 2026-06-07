import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export async function loadPdfJsDocument(file) {
  const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  return pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
}

export async function getPdfPageCount(file) {
  const { PDFDocument } = await import('pdf-lib');
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  return pdf.getPageCount();
}
