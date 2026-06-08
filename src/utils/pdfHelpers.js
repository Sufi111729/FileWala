export async function loadPdfJsDocument(file) {
  const [pdfjs, pdfWorker] = await Promise.all([
    import('pdfjs-dist/build/pdf.mjs'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker.default;
  return pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
}

export async function getPdfPageCount(file) {
  const { PDFDocument } = await import('pdf-lib');
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  return pdf.getPageCount();
}
