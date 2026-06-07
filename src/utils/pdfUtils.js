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

function validatePdfFile(file) {
  if (!file) {
    throw new Error('Upload a PDF first.');
  }

  if (!isPdfFile(file)) {
    throw new Error('Invalid PDF. Please upload a PDF file.');
  }

  if (file.size === 0) {
    throw new Error('Empty file. Please upload a PDF with content.');
  }
}

async function loadPdfDocument(file, action) {
  validatePdfFile(file);

  try {
    const { PDFDocument } = await import('pdf-lib');
    const bytes = await file.arrayBuffer();
    return PDFDocument.load(bytes);
  } catch {
    throw new Error(`${file.name} could not be ${action}. It may be invalid, damaged, or password-protected.`);
  }
}

async function createPdfDocument() {
  const { PDFDocument } = await import('pdf-lib');
  return PDFDocument.create();
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

  const outputPdf = await createPdfDocument();
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
    throw new Error('At least one page must remain in the PDF.');
  }

  const outputPdf = await createPdfDocument();
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

  const { degrees } = await import('pdf-lib');
  selectedPages.forEach((pageNumber) => {
    const page = sourcePdf.getPage(pageNumber - 1);
    const currentAngle = page.getRotation().angle || 0;
    page.setRotation(degrees((currentAngle + normalizedDegrees) % 360));
  });

  const bytes = await sourcePdf.save({ useObjectStreams: true });
  return new Blob([bytes], { type: 'application/pdf' });
}

export async function basicCompressPdf(file) {
  const { blob } = await compressPdf(file, 'medium');
  return blob;
}

const compressionProfiles = {
  low: {
    label: 'Low Compression (Best Quality)',
    dpi: 150,
    quality: 0.82,
    maxPixels: 4200000,
  },
  medium: {
    label: 'Medium Compression (Balanced)',
    dpi: 120,
    quality: 0.68,
    maxPixels: 3000000,
  },
  high: {
    label: 'High Compression (Maximum Reduction)',
    dpi: 96,
    quality: 0.52,
    maxPixels: 1800000,
  },
};

const targetCompressionPasses = [
  { dpi: 140, quality: 0.74, maxPixels: 3600000 },
  { dpi: 120, quality: 0.66, maxPixels: 2800000 },
  { dpi: 105, quality: 0.58, maxPixels: 2200000 },
  { dpi: 92, quality: 0.5, maxPixels: 1600000 },
  { dpi: 82, quality: 0.42, maxPixels: 1200000 },
  { dpi: 72, quality: 0.35, maxPixels: 900000 },
  { dpi: 64, quality: 0.28, maxPixels: 650000 },
];

function canvasToJpegBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Compression failed. Could not encode PDF page image.'));
      },
      'image/jpeg',
      quality,
    );
  });
}

function fitScaleToPixelLimit(viewport, maxPixels) {
  const pixels = viewport.width * viewport.height;
  if (pixels <= maxPixels) return 1;
  return Math.sqrt(maxPixels / pixels);
}

async function openPdfForCompression(file) {
  validatePdfFile(file);

  const sourceBytes = await file.arrayBuffer();

  try {
    const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default;
    return pdfjsLib.getDocument({
      data: sourceBytes.slice(0),
      disableFontFace: true,
      useSystemFonts: true,
    }).promise;
  } catch {
    throw new Error('Corrupted PDF. This file could not be opened for compression.');
  }
}

async function buildCompressedPdf(pdfDocument, profile, options = {}) {
  const { PDFDocument } = await import('pdf-lib');
  const outputPdf = await PDFDocument.create();
  const pageCount = pdfDocument.numPages;

  outputPdf.setTitle('');
  outputPdf.setAuthor('');
  outputPdf.setSubject('');
  outputPdf.setKeywords([]);
  outputPdf.setProducer('FileWalaTool');
  outputPdf.setCreator('FileWalaTool');

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    options.onProgress?.({
      phase: 'compressing',
      pageNumber,
      pageCount,
      pass: options.pass,
      passCount: options.passCount,
    });

    const page = await pdfDocument.getPage(pageNumber);
    const baseViewport = page.getViewport({ scale: 1 });
    const renderScale = (profile.dpi / 72) * fitScaleToPixelLimit(
      page.getViewport({ scale: profile.dpi / 72 }),
      profile.maxPixels,
    );
    const viewport = page.getViewport({ scale: renderScale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false });
    const width = Math.max(1, Math.floor(viewport.width));
    const height = Math.max(1, Math.floor(viewport.height));

    canvas.width = width;
    canvas.height = height;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);

    const renderTask = page.render({
      canvasContext: context,
      viewport,
      background: 'white',
    });
    await renderTask.promise;

    const jpegBlob = await canvasToJpegBlob(canvas, profile.quality);
    const jpegBytes = await jpegBlob.arrayBuffer();
    const image = await outputPdf.embedJpg(jpegBytes);
    const outputPage = outputPdf.addPage([baseViewport.width, baseViewport.height]);

    outputPage.drawImage(image, {
      x: 0,
      y: 0,
      width: baseViewport.width,
      height: baseViewport.height,
    });

    page.cleanup();
    canvas.width = 1;
    canvas.height = 1;
  }

  options.onProgress?.({ phase: 'preparing', pageNumber: pageCount, pageCount, pass: options.pass, passCount: options.passCount });

  const bytes = await outputPdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });

  return new Blob([bytes], { type: 'application/pdf' });
}

export async function compressPdf(file, level = 'medium', options = {}) {
  const profile = compressionProfiles[level] || compressionProfiles.medium;
  let pdfDocument;

  try {
    pdfDocument = await openPdfForCompression(file);
    const pageCount = pdfDocument.numPages;
    const blob = await buildCompressedPdf(pdfDocument, profile, options);
    return {
      blob,
      originalSize: file.size,
      compressedSize: blob.size,
      savedPercent: file.size ? Math.max(0, Math.round(((file.size - blob.size) / file.size) * 100)) : 0,
      level,
      levelLabel: profile.label,
      pageCount,
    };
  } catch (caughtError) {
    throw new Error(caughtError.message || 'Compression failed. Please try another PDF.');
  } finally {
    await pdfDocument?.destroy?.();
  }
}

export async function compressPdfToTarget(file, targetKB, options = {}) {
  const targetBytes = Number(targetKB) * 1024;

  if (!Number.isFinite(targetBytes) || targetBytes < 10 * 1024) {
    throw new Error('Enter a valid target size in KB.');
  }

  if (file?.size && targetBytes >= file.size) {
    throw new Error('Target size must be smaller than the original PDF size.');
  }

  let pdfDocument;
  let bestBlob = null;
  let bestProfile = null;
  let reachedTarget = false;

  try {
    pdfDocument = await openPdfForCompression(file);
    const pageCount = pdfDocument.numPages;

    for (let passIndex = 0; passIndex < targetCompressionPasses.length; passIndex += 1) {
      const profile = targetCompressionPasses[passIndex];
      const blob = await buildCompressedPdf(pdfDocument, profile, {
        ...options,
        pass: passIndex + 1,
        passCount: targetCompressionPasses.length,
      });

      if (!bestBlob || blob.size < bestBlob.size) {
        bestBlob = blob;
        bestProfile = profile;
      }

      options.onProgress?.({
        phase: 'checking',
        currentSize: blob.size,
        targetSize: targetBytes,
        pass: passIndex + 1,
        passCount: targetCompressionPasses.length,
        pageCount,
      });

      if (blob.size <= targetBytes) {
        reachedTarget = true;
        break;
      }
    }

    if (!bestBlob) {
      throw new Error('Compression failed. Please try another PDF.');
    }

    return {
      blob: bestBlob,
      originalSize: file.size,
      compressedSize: bestBlob.size,
      targetSize: targetBytes,
      savedPercent: file.size ? Math.max(0, Math.round(((file.size - bestBlob.size) / file.size) * 100)) : 0,
      reachedTarget,
      profile: bestProfile,
      pageCount,
    };
  } catch (caughtError) {
    throw new Error(caughtError.message || 'Compression failed. Please try another PDF.');
  } finally {
    await pdfDocument?.destroy?.();
  }
}

export function getPdfCompressionLevels() {
  return Object.entries(compressionProfiles).map(([value, profile]) => ({
    value,
    label: profile.label,
  }));
}

export async function rebuildPdf(file) {
  const pdf = await loadPdfDocument(file, 'rebuilt');
  pdf.setTitle('');
  pdf.setAuthor('');
  pdf.setSubject('');
  pdf.setKeywords([]);
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

  const { PDFDocument } = await import('pdf-lib');
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
