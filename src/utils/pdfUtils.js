import { degrees, PDFDocument } from 'pdf-lib';

export function formatFileSize(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 800);
}

function isPdfFile(file) {
  return Boolean(file && (file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf')));
}

async function loadPdfDocument(file, action) {
  if (!isPdfFile(file)) {
    throw new Error('Please upload a PDF file.');
  }

  try {
    const bytes = await file.arrayBuffer();
    return PDFDocument.load(bytes);
  } catch {
    throw new Error(`${file.name} could not be ${action}. It may be invalid, damaged, or password-protected.`);
  }
}

export function parsePageRanges(input, totalPages) {
  const trimmed = String(input || '').trim();
  if (!trimmed) {
    throw new Error('Enter at least one page or page range.');
  }

  const pages = new Set();
  const parts = trimmed.split(',').map((part) => part.trim()).filter(Boolean);

  if (parts.length === 0) {
    throw new Error('Enter at least one page or page range.');
  }

  parts.forEach((part) => {
    const match = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) {
      throw new Error('Use valid page ranges like 1-3, 5, 8-10.');
    }

    const start = Number(match[1]);
    const end = Number(match[2] || match[1]);

    if (start < 1 || end < 1 || start > end || end > totalPages) {
      throw new Error(`Pages must be between 1 and ${totalPages}.`);
    }

    for (let page = start; page <= end; page += 1) {
      pages.add(page);
    }
  });

  return [...pages].sort((a, b) => a - b);
}

export async function getPdfPageCount(file) {
  const pdf = await loadPdfDocument(file, 'opened');
  return pdf.getPageCount();
}

export async function splitPdfByRanges(file, ranges) {
  const sourcePdf = await loadPdfDocument(file, 'split');
  const totalPages = sourcePdf.getPageCount();
  const selectedPages = Array.isArray(ranges) ? ranges : parsePageRanges(ranges, totalPages);

  if (selectedPages.length === 0) {
    throw new Error('Enter at least one page to extract.');
  }

  const outputPdf = await PDFDocument.create();
  const copiedPages = await outputPdf.copyPages(
    sourcePdf,
    selectedPages.map((page) => page - 1),
  );
  copiedPages.forEach((page) => outputPdf.addPage(page));

  const bytes = await outputPdf.save({ useObjectStreams: true });
  return new Blob([bytes], { type: 'application/pdf' });
}

export async function deletePdfPages(file, pagesToDelete) {
  const sourcePdf = await loadPdfDocument(file, 'updated');
  const totalPages = sourcePdf.getPageCount();
  const deletePages = Array.isArray(pagesToDelete) ? pagesToDelete : parsePageRanges(pagesToDelete, totalPages);
  const deleteSet = new Set(deletePages);
  const keepPages = [];

  for (let page = 1; page <= totalPages; page += 1) {
    if (!deleteSet.has(page)) keepPages.push(page);
  }

  if (deleteSet.size === 0) {
    throw new Error('Enter at least one page to delete.');
  }

  if (keepPages.length === 0) {
    throw new Error('You cannot delete every page. Keep at least one page.');
  }

  const outputPdf = await PDFDocument.create();
  const copiedPages = await outputPdf.copyPages(
    sourcePdf,
    keepPages.map((page) => page - 1),
  );
  copiedPages.forEach((page) => outputPdf.addPage(page));

  const bytes = await outputPdf.save({ useObjectStreams: true });
  return new Blob([bytes], { type: 'application/pdf' });
}

export async function rotatePdfPages(file, pages, rotationDegrees) {
  const sourcePdf = await loadPdfDocument(file, 'rotated');
  const totalPages = sourcePdf.getPageCount();
  const selectedPages = pages === 'all' ? Array.from({ length: totalPages }, (_, index) => index + 1) : pages;
  const normalizedDegrees = Number(rotationDegrees);

  if (![90, 180, 270].includes(normalizedDegrees)) {
    throw new Error('Choose a valid rotation angle.');
  }

  selectedPages.forEach((pageNumber) => {
    const page = sourcePdf.getPage(pageNumber - 1);
    const currentAngle = page.getRotation().angle || 0;
    page.setRotation(degrees((currentAngle + normalizedDegrees) % 360));
  });

  const bytes = await sourcePdf.save({ useObjectStreams: true });
  return new Blob([bytes], { type: 'application/pdf' });
}

export async function basicCompressPdf(file) {
  const pdf = await loadPdfDocument(file, 'compressed');
  const bytes = await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });
  return new Blob([bytes], { type: 'application/pdf' });
}

export async function mergePdfFiles(files) {
  if (!Array.isArray(files) || files.length < 2) {
    throw new Error('Please select at least 2 PDF files to merge.');
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    if (!isPdfFile(file)) {
      throw new Error(`${file.name} is not a PDF file.`);
    }

    try {
      const bytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(bytes);
      const pageIndexes = sourcePdf.getPageIndices();
      const pages = await mergedPdf.copyPages(sourcePdf, pageIndexes);
      pages.forEach((page) => mergedPdf.addPage(page));
    } catch {
      throw new Error(`${file.name} could not be merged. It may be invalid, damaged, or password-protected.`);
    }
  }

  const mergedBytes = await mergedPdf.save();
  return new Blob([mergedBytes], { type: 'application/pdf' });
}
