import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Cloud,
  Download,
  FileUp,
  HardDrive,
  Loader2,
  RotateCcw,
  Settings,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../i18n.jsx';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const DROPBOX_APP_KEY = import.meta.env.VITE_DROPBOX_APP_KEY;
const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

const converterConfig = {
  'image-to-pdf': {
    accept: 'image/jpeg,image/png,image/webp,image/bmp',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'],
    extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp'],
    multiple: true,
    maxFiles: 30,
    maxSize: 20 * 1024 * 1024,
    maxTotalSize: 100 * 1024 * 1024,
    outputName: 'images-filewalatool.pdf',
    outputType: 'application/pdf',
  },
  'jpg-to-png': {
    accept: 'image/jpeg',
    outputName: 'converted-filewalatool.png',
    outputType: 'image/png',
  },
  'png-to-jpg': {
    accept: 'image/png',
    outputName: 'converted-filewalatool.jpg',
    outputType: 'image/jpeg',
  },
  'pdf-to-jpg': {
    accept: 'application/pdf,.pdf',
    extensions: ['pdf'],
    maxSize: 50 * 1024 * 1024,
    maxPages: 50,
  },
  'batch-image-cropper': {
    accept: 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp',
    multiple: true,
    maxSize: 30 * 1024 * 1024,
  },
  'pdf-to-word': {
    accept: 'application/pdf',
    outputName: 'converted.docx',
    outputType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['pdf'],
    maxSize: 50 * 1024 * 1024,
  },
  'word-to-pdf': {
    accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    outputName: 'converted.pdf',
    outputType: 'application/pdf',
    extensions: ['docx'],
    maxSize: 20 * 1024 * 1024,
    rejectedMessages: { doc: 'DOC format is not supported in browser-only mode. Please upload DOCX.' },
  },
  'protect-pdf': {
    accept: 'application/pdf,.pdf',
    extensions: ['pdf'],
    maxSize: 50 * 1024 * 1024,
  },
  'unlock-pdf': {
    accept: 'application/pdf,.pdf',
    extensions: ['pdf'],
    maxSize: 50 * 1024 * 1024,
  },
  'watermark-pdf': {
    accept: 'application/pdf,.pdf',
    extensions: ['pdf'],
    maxSize: 50 * 1024 * 1024,
  },
  'resize-image': {
    accept: 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp',
    extensions: ['jpg', 'jpeg', 'png', 'webp'],
    maxSize: 50 * 1024 * 1024,
  },
};

const defaultConfig = {
  accept: '',
  multiple: false,
  outputName: 'filewalatool-result',
  outputType: 'application/octet-stream',
};

const modeValues = ['best-quality', 'balanced-size', 'fast-export'];

function loadScript(src, attributes = {}) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      if (existing.dataset.loaded === 'true') resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    Object.entries(attributes).forEach(([key, value]) => script.setAttribute(key, value));
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error('Cloud picker could not be loaded.'));
    document.body.appendChild(script);
  });
}

function pickerMimeTypes(accept) {
  return accept
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.includes('/'));
}

function dropboxExtensions(accept) {
  const fromMime = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'image/bmp': ['.bmp'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  };

  return [
    ...new Set(
      accept
        .split(',')
        .map((item) => item.trim())
        .flatMap((item) => (item.startsWith('.') ? [item] : fromMime[item] ?? [])),
    ),
  ];
}

function joinFileNames(files) {
  if (files.length === 0) return '';
  if (files.length === 1) return files[0].name;
  return `${files.length} files selected`;
}

function totalFileSize(files) {
  return files.reduce((sum, file) => sum + file.size, 0);
}

function formatUploadSize(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function qualityForMode(mode) {
  if (mode === 'best-quality') return 0.96;
  if (mode === 'fast-export') return 0.72;
  return 0.86;
}

function textBytes(text) {
  return new TextEncoder().encode(text);
}

function concatBytes(parts) {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Upload a valid image file.'));
    };
    image.src = url;
  });
}

function googleExportType(mimeType) {
  const exports = {
    'application/vnd.google-apps.document': {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extension: 'docx',
    },
    'application/vnd.google-apps.spreadsheet': {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      extension: 'xlsx',
    },
    'application/vnd.google-apps.presentation': {
      mimeType: 'application/pdf',
      extension: 'pdf',
    },
    'application/vnd.google-apps.drawing': {
      mimeType: 'image/png',
      extension: 'png',
    },
  };
  return exports[mimeType] ?? null;
}

function withExtension(name, extension) {
  const cleanName = name || 'google-drive-file';
  return cleanName.toLowerCase().endsWith(`.${extension}`) ? cleanName : `${cleanName}.${extension}`;
}

async function fetchGoogleDriveFile(document, accessToken) {
  const pickerDocument = window.google?.picker?.Document;
  const id = document.id ?? document[pickerDocument?.ID];
  const name = document.name ?? document[pickerDocument?.NAME] ?? 'google-drive-file';
  const mimeType = document.mimeType ?? document[pickerDocument?.MIME_TYPE] ?? 'application/octet-stream';
  const exportType = googleExportType(mimeType);
  const url = exportType
    ? `https://www.googleapis.com/drive/v3/files/${id}/export?mimeType=${encodeURIComponent(exportType.mimeType)}`
    : `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Google Drive file could not be downloaded.');
  }

  const blob = await response.blob();
  const fileName = exportType ? withExtension(name, exportType.extension) : name;
  return new File([blob], fileName || 'google-drive-file', {
    type: exportType?.mimeType || blob.type || mimeType,
  });
}

async function fetchDropboxFile(file) {
  const response = await fetch(file.link);
  if (!response.ok) {
    throw new Error('Dropbox file could not be downloaded.');
  }
  const blob = await response.blob();
  return new File([blob], file.name || 'dropbox-file', {
    type: blob.type || 'application/octet-stream',
  });
}

async function imageToCanvas(file, background = null) {
  const image = await loadImage(file);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const dimensionScale = Math.min(1, 4096 / sourceWidth, 4096 / sourceHeight);
  const pixelScale = Math.min(1, Math.sqrt(16_000_000 / (sourceWidth * sourceHeight)));
  const scale = Math.min(dimensionScale, pixelScale);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(sourceWidth * scale));
  canvas.height = Math.max(1, Math.round(sourceHeight * scale));
  const context = canvas.getContext('2d');
  if (background) {
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Conversion failed. Please try another file.'));
      },
      type,
      quality,
    );
  });
}

async function convertImageFormat(file, type, mode) {
  const canvas = await imageToCanvas(file, type === 'image/jpeg' ? '#ffffff' : null);
  return canvasToBlob(canvas, type, qualityForMode(mode));
}

async function imageFileToPdfImage(file, mode) {
  const canvas = await imageToCanvas(file, '#ffffff');
  const blob = await canvasToBlob(canvas, 'image/jpeg', qualityForMode(mode));
  const image = {
    width: canvas.width,
    height: canvas.height,
    bytes: new Uint8Array(await blob.arrayBuffer()),
  };
  canvas.width = 1;
  canvas.height = 1;
  return image;
}

function createPdf(images) {
  const parts = [];
  const offsets = [0];
  let position = 0;
  let objectNumber = 1;
  const pageObjects = [];
  const contentObjects = [];
  const imageObjects = [];

  const append = (part) => {
    const bytes = typeof part === 'string' ? textBytes(part) : part;
    parts.push(bytes);
    position += bytes.length;
  };

  const startObject = () => {
    offsets[objectNumber] = position;
    append(`${objectNumber} 0 obj\n`);
    return objectNumber++;
  };

  append('%PDF-1.4\n');

  const catalogObject = startObject();
  append('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  const pagesObject = startObject();
  append('PAGES_PLACEHOLDER\nendobj\n');

  images.forEach((image, index) => {
    const pageObject = startObject();
    pageObjects.push(pageObject);
    const contentObject = objectNumber;
    const imageObject = objectNumber + 1;
    append(
      `<< /Type /Page /Parent ${pagesObject} 0 R /MediaBox [0 0 ${image.width} ${image.height}] /Resources << /XObject << /Im${index + 1} ${imageObject} 0 R >> >> /Contents ${contentObject} 0 R >>\nendobj\n`,
    );

    const content = `q\n${image.width} 0 0 ${image.height} 0 0 cm\n/Im${index + 1} Do\nQ\n`;
    const contentBytes = textBytes(content);
    const currentContentObject = startObject();
    contentObjects.push(currentContentObject);
    append(`<< /Length ${contentBytes.length} >>\nstream\n`);
    append(contentBytes);
    append('\nendstream\nendobj\n');

    const currentImageObject = startObject();
    imageObjects.push(currentImageObject);
    append(
      `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`,
    );
    append(image.bytes);
    append('\nendstream\nendobj\n');
  });

  const kids = pageObjects.map((pageObject) => `${pageObject} 0 R`).join(' ');
  const pagesBody = `<< /Type /Pages /Count ${pageObjects.length} /Kids [${kids}] >>\nendobj\n`;
  const fullPdfBeforeXref = concatBytes(parts);
  const placeholder = textBytes('PAGES_PLACEHOLDER\nendobj\n');
  const pagesBytes = textBytes(pagesBody);
  const placeholderOffset = offsets[pagesObject] + textBytes(`${pagesObject} 0 obj\n`).length;
  const adjustedBeforeXref = concatBytes([
    fullPdfBeforeXref.slice(0, placeholderOffset),
    pagesBytes,
    fullPdfBeforeXref.slice(placeholderOffset + placeholder.length),
  ]);
  const delta = pagesBytes.length - placeholder.length;
  const adjustedOffsets = offsets.map((offset, index) => (index > pagesObject ? offset + delta : offset));
  const xrefOffset = adjustedBeforeXref.length;
  const xrefRows = ['xref', `0 ${objectNumber}`, '0000000000 65535 f '];
  for (let index = 1; index < objectNumber; index += 1) {
    xrefRows.push(`${String(adjustedOffsets[index]).padStart(10, '0')} 00000 n `);
  }
  const trailer = `${xrefRows.join('\n')}\ntrailer\n<< /Size ${objectNumber} /Root ${catalogObject} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([adjustedBeforeXref, textBytes(trailer)], { type: 'application/pdf' });
}

async function convertImagesToPdf(files, mode) {
  const images = [];
  for (const file of files) {
    images.push(await imageFileToPdfImage(file, mode));
  }
  return createPdf(images);
}

function previewType(contentType) {
  if (contentType?.startsWith('image/')) return 'image';
  if (contentType === 'application/pdf') return 'pdf';
  return '';
}

function canvasToJpegBlob(canvas, quality = 0.9) {
  return canvasToBlob(canvas, 'image/jpeg', quality);
}

async function loadPdfDocument(file) {
  const [pdfjs, worker] = await Promise.all([
    import('pdfjs-dist/build/pdf.mjs'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  try {
    return await pdfjs.getDocument({
      data: await file.arrayBuffer(),
      disableFontFace: true,
      useSystemFonts: true,
    }).promise;
  } catch (error) {
    if (error?.name === 'PasswordException') {
      throw new Error('This PDF is password-protected. Unlock it before converting pages to JPG.');
    }
    throw new Error('This PDF could not be opened. It may be corrupted or unsupported.');
  }
}

function renderScaleForPage(page, targetScale, maxPixels) {
  const viewport = page.getViewport({ scale: targetScale });
  const pixels = viewport.width * viewport.height;
  return pixels <= maxPixels ? targetScale : targetScale * Math.sqrt(maxPixels / pixels);
}

async function renderPdfPage(page, { targetScale, maxPixels, quality }) {
  const scale = renderScaleForPage(page, targetScale, maxPixels);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const context = canvas.getContext('2d', { alpha: false });
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport, background: 'white' }).promise;
  const blob = await canvasToJpegBlob(canvas, quality);
  canvas.width = 1;
  canvas.height = 1;
  page.cleanup();
  return blob;
}

function parsePageSelection(value, pageCount) {
  const input = value.trim();
  if (!input) return Array.from({ length: pageCount }, (_, index) => index + 1);

  const pages = new Set();
  for (const token of input.split(',')) {
    const cleanToken = token.trim();
    if (!cleanToken) continue;
    const range = cleanToken.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (start < 1 || end > pageCount || start > end) throw new Error(`Use page numbers from 1 to ${pageCount}.`);
      for (let pageNumber = start; pageNumber <= end; pageNumber += 1) pages.add(pageNumber);
      continue;
    }
    if (!/^\d+$/.test(cleanToken)) throw new Error('Use page ranges such as 1-3,5.');
    const pageNumber = Number(cleanToken);
    if (pageNumber < 1 || pageNumber > pageCount) throw new Error(`Use page numbers from 1 to ${pageCount}.`);
    pages.add(pageNumber);
  }
  if (pages.size === 0) throw new Error('Select at least one PDF page.');
  return [...pages].sort((a, b) => a - b);
}

function fileExtension(fileName) {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function validateFiles(files, config) {
  if (files.length === 0) return '';
  if (config.maxFiles && files.length > config.maxFiles) {
    return `Select up to ${config.maxFiles} images at a time.`;
  }
  if (config.maxTotalSize && totalFileSize(files) > config.maxTotalSize) {
    return `Total selected size must be ${formatUploadSize(config.maxTotalSize)} or smaller.`;
  }
  const invalidMimeFile = config.mimeTypes?.length > 0
    ? files.find((file) => file.type && !config.mimeTypes.includes(file.type))
    : null;
  if (invalidMimeFile) return 'Please upload a supported image file.';
  const invalidFile = config.extensions
    ? files.find((file) => !config.extensions.includes(fileExtension(file.name)))
    : null;
  if (invalidFile) {
    const rejectedMessage = config.rejectedMessages?.[fileExtension(invalidFile.name)];
    if (rejectedMessage) return rejectedMessage;
    return `Please select a ${config.extensions.map((extension) => `.${extension}`).join(' or ')} file.`;
  }
  if (files.some((file) => file.size === 0)) return 'The selected file is empty.';
  if (files.some((file) => config.maxSize && file.size > config.maxSize)) {
    return `File size must be ${formatUploadSize(config.maxSize)} or smaller.`;
  }
  return '';
}

export default function UploadBox({ tool, onFilesSelected, uploadOnly = false, helperText = '' }) {
  const { text, tLiteral, tToolTitle } = useLanguage();
  const fileInputRef = useRef(null);
  const config = useMemo(() => ({ ...defaultConfig, ...(converterConfig[tool.slug] ?? {}) }), [tool.slug]);
  const [files, setFiles] = useState([]);
  const [mode, setMode] = useState(modeValues[1]);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [importSource, setImportSource] = useState('');
  const [cloudStatus, setCloudStatus] = useState('');
  const [filePreviewUrls, setFilePreviewUrls] = useState([]);
  const [pdfPreviewPages, setPdfPreviewPages] = useState([]);
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [pdfPageSelection, setPdfPageSelection] = useState('');
  const [pdfProgress, setPdfProgress] = useState('');

  const fileLabel = files.length > 1 ? `${files.length} ${text.upload.filesSelected}` : joinFileNames(files);
  const isWorking = status === 'processing' || status === 'loading-preview';
  const canConvert = !isWorking && files.length > 0;
  const preview = previewType(result?.contentType);

  useEffect(() => {
    if (tool.slug !== 'image-to-pdf') {
      setFilePreviewUrls([]);
      return undefined;
    }

    const urls = files.map((file) => URL.createObjectURL(file));
    setFilePreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files, tool.slug]);

  useEffect(() => () => {
    if (result?.downloadUrl?.startsWith('blob:')) URL.revokeObjectURL(result.downloadUrl);
    result?.pages?.forEach((page) => URL.revokeObjectURL(page.url));
  }, [result]);

  useEffect(() => () => {
    pdfPreviewPages.forEach((page) => URL.revokeObjectURL(page.url));
  }, [pdfPreviewPages]);

  const resetResult = () => {
    if (result?.downloadUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(result.downloadUrl);
    }
    setResult(null);
    setError('');
    setStatus('idle');
    setCloudStatus('');
    setPdfProgress('');
  };

  const resetPdfPreview = () => {
    pdfPreviewPages.forEach((page) => URL.revokeObjectURL(page.url));
    setPdfPreviewPages([]);
    setPdfPageCount(0);
    setPdfPageSelection('');
    setPdfProgress('');
  };

  const handleFiles = async (fileList) => {
    const selectedFiles = Array.from(fileList ?? []);
    const nextFiles = config.multiple ? selectedFiles : selectedFiles.slice(0, 1);
    const validationError = validateFiles(nextFiles, config);
    if (validationError) {
      setFiles([]);
      onFilesSelected?.([]);
      resetResult();
      setError(validationError);
      setStatus('error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (tool.slug === 'pdf-to-jpg') resetPdfPreview();
    setFiles(nextFiles);
    onFilesSelected?.(nextFiles);
    resetResult();

    if (tool.slug === 'pdf-to-jpg' && nextFiles[0]) {
      setStatus('loading-preview');
      setPdfProgress('Loading PDF pages...');
      const previewPages = [];
      try {
        const pdfDocument = await loadPdfDocument(nextFiles[0]);
        if (pdfDocument.numPages > config.maxPages) {
          await pdfDocument.destroy();
          throw new Error(`This tool supports up to ${config.maxPages} PDF pages at a time.`);
        }
        for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
          setPdfProgress(`Preparing page preview ${pageNumber} of ${pdfDocument.numPages}...`);
          const page = await pdfDocument.getPage(pageNumber);
          const blob = await renderPdfPage(page, { targetScale: 0.7, maxPixels: 500_000, quality: 0.72 });
          previewPages.push({ pageNumber, url: URL.createObjectURL(blob) });
        }
        setPdfPageCount(pdfDocument.numPages);
        setPdfPreviewPages(previewPages);
        await pdfDocument.destroy();
        setPdfProgress('');
        setStatus('idle');
      } catch (caughtError) {
        previewPages.forEach((page) => URL.revokeObjectURL(page.url));
        setFiles([]);
        onFilesSelected?.([]);
        setPdfProgress('');
        setError(caughtError.message);
        setStatus('error');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (event) => {
    handleFiles(event.target.files);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  const removeFiles = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setFiles([]);
    onFilesSelected?.([]);
    if (tool.slug === 'pdf-to-jpg') resetPdfPreview();
    resetResult();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateFiles = (nextFiles) => {
    setFiles(nextFiles);
    onFilesSelected?.(nextFiles);
    resetResult();
  };

  const moveFile = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= files.length) return;
    const nextFiles = [...files];
    [nextFiles[index], nextFiles[nextIndex]] = [nextFiles[nextIndex], nextFiles[index]];
    updateFiles(nextFiles);
  };

  const removeFileAt = (index) => {
    const nextFiles = files.filter((_, fileIndex) => fileIndex !== index);
    updateFiles(nextFiles);
    if (nextFiles.length === 0 && fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetTool = () => {
    setFiles([]);
    onFilesSelected?.([]);
    setMode(modeValues[1]);
    setImportSource('');
    if (tool.slug === 'pdf-to-jpg') resetPdfPreview();
    resetResult();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleProcess = async () => {
    if (!canConvert) return;

    setError('');
    setResult(null);
    setStatus('processing');

    let activePdfDocument = null;
    let pendingPdfPages = [];
    try {
      let blob;
      if (tool.slug === 'pdf-to-jpg') {
        const selectedPages = parsePageSelection(pdfPageSelection, pdfPageCount);
        const pdfDocument = await loadPdfDocument(files[0]);
        activePdfDocument = pdfDocument;
        const pages = [];
        for (let index = 0; index < selectedPages.length; index += 1) {
          const pageNumber = selectedPages[index];
          setPdfProgress(`Converting page ${index + 1} of ${selectedPages.length}...`);
          const page = await pdfDocument.getPage(pageNumber);
          const pageBlob = await renderPdfPage(page, {
            targetScale: mode === 'best-quality' ? 2 : mode === 'fast-export' ? 1.25 : 1.6,
            maxPixels: mode === 'best-quality' ? 10_000_000 : 7_000_000,
            quality: qualityForMode(mode),
          });
          pages.push({
            pageNumber,
            blob: pageBlob,
            fileName: `pdf-page-${pageNumber}.jpg`,
            url: URL.createObjectURL(pageBlob),
          });
          pendingPdfPages = pages;
        }
        await pdfDocument.destroy();
        activePdfDocument = null;
        setResult({ pages, pageCount: pages.length });
        pendingPdfPages = [];
        setPdfProgress('');
        setStatus('done');
        return;
      } else if (tool.slug === 'image-to-pdf') {
        blob = await convertImagesToPdf(files, mode);
      } else if (tool.slug === 'jpg-to-png') {
        blob = await convertImageFormat(files[0], 'image/png', mode);
      } else if (tool.slug === 'png-to-jpg') {
        blob = await convertImageFormat(files[0], 'image/jpeg', mode);
      } else {
        throw new Error('This tool needs a frontend conversion library before it can run without Java.');
      }

      const downloadUrl = URL.createObjectURL(blob);
      setResult({
        fileName: config.outputName,
        contentType: blob.type || config.outputType,
        size: blob.size,
        downloadUrl,
      });
      setStatus('done');
    } catch (caughtError) {
      pendingPdfPages.forEach((page) => URL.revokeObjectURL(page.url));
      if (activePdfDocument) await activePdfDocument.destroy().catch(() => {});
      setPdfProgress('');
      setError(caughtError.message);
      setStatus('error');
    }
  };

  const downloadPdfPagesZip = async () => {
    if (!result?.pages?.length) return;
    setPdfProgress('Creating ZIP file...');
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      result.pages.forEach((page) => zip.file(page.fileName, page.blob));
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'pdf-to-jpg-filewalatool.zip';
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError('The ZIP file could not be created. Download the JPG images individually.');
    } finally {
      setPdfProgress('');
    }
  };

  const requestGoogleToken = () =>
    new Promise((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        reject(new Error('Google login could not be loaded.'));
        return;
      }

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_DRIVE_SCOPE,
        callback: (response) => {
          if (response?.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error('Google Drive login was cancelled.'));
          }
        },
      });
      tokenClient.requestAccessToken({ prompt: '' });
    });

  const loadGooglePicker = async () => {
    await loadScript('https://accounts.google.com/gsi/client');
    await loadScript('https://apis.google.com/js/api.js');
    await new Promise((resolve) => window.gapi.load('picker', { callback: resolve }));
  };

  const openGoogleDrive = async () => {
    if (!GOOGLE_API_KEY || !GOOGLE_CLIENT_ID) {
      setError('Add VITE_GOOGLE_API_KEY and VITE_GOOGLE_CLIENT_ID to enable Google Drive login.');
      return;
    }

    setError('');
    setCloudStatus(tLiteral('Opening Google Drive...'));
    setImportSource('Google Drive');

    try {
      await loadGooglePicker();
      const accessToken = await requestGoogleToken();
      const mimeTypes = pickerMimeTypes(config.accept);

      await new Promise((resolve, reject) => {
        const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
          .setIncludeFolders(false)
          .setSelectFolderEnabled(false);
        if (mimeTypes.length > 0) {
          view.setMimeTypes(mimeTypes.join(','));
        }

        const builder = new window.google.picker.PickerBuilder()
          .addView(view)
          .setOAuthToken(accessToken)
          .setDeveloperKey(GOOGLE_API_KEY)
          .setCallback(async (data) => {
            const action = data[window.google.picker.Response.ACTION] ?? data.action;
            if (action === window.google.picker.Action.CANCEL) {
              setCloudStatus('');
              resolve();
            }
            if (action === window.google.picker.Action.PICKED) {
              try {
                setCloudStatus(tLiteral('Downloading Google Drive file...'));
                const documents = data[window.google.picker.Response.DOCUMENTS] ?? data.docs ?? [];
                const downloadedFiles = await Promise.all(
                  documents.map((document) => fetchGoogleDriveFile(document, accessToken)),
                );
                handleFiles(downloadedFiles);
                setImportSource('Google Drive');
                setCloudStatus('');
                resolve();
              } catch (caughtError) {
                reject(caughtError);
              }
            }
          });

        if (config.multiple) {
          builder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
        }

        builder.build().setVisible(true);
      });
    } catch (caughtError) {
      setCloudStatus('');
      setError(caughtError.message);
    }
  };

  const openDropbox = async () => {
    if (!DROPBOX_APP_KEY) {
      setError('Add VITE_DROPBOX_APP_KEY to enable Dropbox login.');
      return;
    }

    setError('');
    setCloudStatus(tLiteral('Opening Dropbox...'));
    setImportSource('Dropbox');

    try {
      await loadScript('https://www.dropbox.com/static/api/2/dropins.js', {
        id: 'dropboxjs',
        'data-app-key': DROPBOX_APP_KEY,
      });

      if (!window.Dropbox?.choose) {
        throw new Error('Dropbox chooser could not be loaded.');
      }

      await new Promise((resolve, reject) => {
        window.Dropbox.choose({
          linkType: 'direct',
          multiselect: config.multiple,
          extensions: dropboxExtensions(config.accept),
          success: async (selectedFiles) => {
            try {
              setCloudStatus(tLiteral('Downloading Dropbox file...'));
              const downloadedFiles = await Promise.all(selectedFiles.map(fetchDropboxFile));
              handleFiles(downloadedFiles);
              setImportSource('Dropbox');
              setCloudStatus('');
              resolve();
            } catch (caughtError) {
              reject(caughtError);
            }
          },
          cancel: () => {
            setCloudStatus('');
            resolve();
          },
        });
      });
    } catch (caughtError) {
      setCloudStatus('');
      setError(caughtError.message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
        <label
          htmlFor="file-upload"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="group m-4 flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-black/20 bg-white px-5 py-9 text-center transition-colors duration-150 hover:border-black/50 sm:m-6 sm:px-8 sm:py-12"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-md bg-white text-brand-red ring-1 ring-black/10">
            <UploadCloud className="h-7 w-7 text-brand-red" />
          </span>
          <span className="mt-5 text-xl font-black tracking-tight text-black">{text.upload.drop}</span>
          <span className="mt-2 max-w-md text-sm leading-6 text-black/50">
            {fileLabel || helperText || `${text.upload.choose} ${tToolTitle(tool)}.`}
          </span>
          {importSource && (
            <span className="mt-2 text-xs font-bold text-black/50">{text.upload.selectedFrom} {importSource}</span>
          )}
          <span className="mt-5 inline-flex items-center gap-2 rounded-md bg-black px-5 py-2.5 text-sm font-bold text-white transition-colors duration-150 hover:bg-black/85">
            <FileUp className="h-5 w-5 text-brand-red" />
            {text.upload.select}
          </span>
          {files.length > 0 && (
            <span className="mt-4 grid gap-1 text-sm font-semibold text-black/60">
              <span className="font-black text-green-700">
                Ready: {files.length > 1 ? `${files.length} Files Selected` : 'File Selected'}
              </span>
              {files.length === 1 ? (
                <>
                  <span>File Name: {files[0].name}</span>
                  <span>Size: {formatUploadSize(files[0].size)}</span>
                </>
              ) : (
                <span>Total Size: {formatUploadSize(totalFileSize(files))}</span>
              )}
              <button type="button" onClick={removeFiles} className="mt-1 text-sm font-bold text-red-700 underline underline-offset-2">
                Remove
              </button>
            </span>
          )}
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept={config.accept}
            multiple={config.multiple}
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>

        {tool.slug === 'image-to-pdf' && files.length > 0 && (
          <div className="border-t border-black/5 p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-black">Selected images</h2>
                <p className="text-sm text-black/55">Arrange images in the order they should appear in the PDF.</p>
              </div>
              <span className="text-sm font-bold text-black/60">{files.length} file{files.length === 1 ? '' : 's'}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {files.map((file, index) => (
                <article key={`${file.name}-${file.lastModified}-${index}`} className="flex min-w-0 items-center gap-3 rounded-md border border-black/10 bg-white p-3">
                  <img
                    src={filePreviewUrls[index]}
                    alt={`${file.name} preview`}
                    title={`${file.name} preview`}
                    loading="lazy"
                    decoding="async"
                    className="h-16 w-16 flex-none rounded-md border border-black/10 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-black">{index + 1}. {file.name}</p>
                    <p className="mt-1 text-xs font-semibold text-black/50">{formatUploadSize(file.size)}</p>
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => moveFile(index, -1)} disabled={index === 0} aria-label={`Move ${file.name} up`} className="focus-ring rounded-md border border-black/10 p-2 text-black/65 disabled:text-black/20">
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => moveFile(index, 1)} disabled={index === files.length - 1} aria-label={`Move ${file.name} down`} className="focus-ring rounded-md border border-black/10 p-2 text-black/65 disabled:text-black/20">
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => removeFileAt(index)} aria-label={`Remove ${file.name}`} className="focus-ring rounded-md border border-red-100 p-2 text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {tool.slug === 'pdf-to-jpg' && (pdfPreviewPages.length > 0 || status === 'loading-preview') && (
          <div className="border-t border-black/5 p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-black">PDF page preview</h2>
                <p className="text-sm text-black/55">Review the pages before converting them into JPG images.</p>
              </div>
              {pdfPageCount > 0 && <span className="text-sm font-bold text-black/60">{pdfPageCount} pages</span>}
            </div>
            {status === 'loading-preview' ? (
              <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-black/60">
                <Loader2 className="h-4 w-4 animate-spin text-brand-red" />
                {pdfProgress}
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {pdfPreviewPages.map((page) => (
                  <article key={page.pageNumber} className="min-w-0 rounded-md border border-black/10 bg-white p-2">
                    <img src={page.url} alt={`PDF page ${page.pageNumber} preview`} title={`PDF page ${page.pageNumber} preview`} loading="lazy" decoding="async" className="aspect-[3/4] w-full rounded border border-black/10 object-contain" />
                    <p className="mt-2 text-center text-xs font-black text-black/60">Page {page.pageNumber}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {!uploadOnly && (
        <div className="grid gap-6 border-t border-black/5 p-5 sm:p-6 lg:grid-cols-[1fr_280px]">
          <div className="rounded-md border border-black/10 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-brand-red ring-1 ring-black/10">
                <Settings className="h-5 w-5 text-brand-red" />
              </span>
              <div>
                <h2 className="text-lg font-black text-black">{text.upload.settings}</h2>
                <p className="text-sm text-black/60">{text.upload.settingsHint}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {text.upload.options.map((option, index) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-3 rounded-md border border-black/10 bg-white p-3 text-sm font-semibold text-black/70 transition-colors duration-150 hover:border-black/35"
                >
                  <input
                    type="radio"
                    name={`processing-mode-${tool.slug}`}
                    checked={mode === modeValues[index]}
                    onChange={() => setMode(modeValues[index])}
                    className="h-4 w-4 accent-black"
                  />
                  {option}
                </label>
              ))}
            </div>

            {tool.slug === 'pdf-to-jpg' && pdfPageCount > 0 && (
              <label className="mt-5 block max-w-md text-sm font-bold text-black/70">
                Pages to convert
                <input
                  type="text"
                  value={pdfPageSelection}
                  onChange={(event) => setPdfPageSelection(event.target.value)}
                  placeholder={`All pages or 1-${Math.min(pdfPageCount, 3)},5`}
                  inputMode="numeric"
                  className="focus-ring mt-2 w-full rounded-md border border-black/15 bg-white px-4 py-3 text-base font-semibold text-black placeholder:text-black/35"
                />
                <span className="mt-2 block text-xs font-semibold text-black/45">Leave blank for all {pdfPageCount} pages.</span>
              </label>
            )}

            <button
              type="button"
              onClick={handleProcess}
              disabled={!canConvert}
              className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-black px-5 py-2.5 text-sm font-bold text-white transition-colors duration-150 hover:bg-black/85 disabled:cursor-not-allowed disabled:bg-black/25 sm:w-auto"
            >
              {isWorking && <Loader2 className="h-4 w-4 animate-spin text-brand-red" />}
              {text.upload.process}
            </button>
            {(tool.slug === 'image-to-pdf' || tool.slug === 'pdf-to-jpg') && (
              <button
                type="button"
                onClick={resetTool}
                disabled={files.length === 0 && !result}
                className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-5 py-2.5 text-sm font-bold text-black disabled:cursor-not-allowed disabled:text-black/25 sm:w-auto"
              >
                <RotateCcw className="h-4 w-4 text-brand-red" />
                Reset
              </button>
            )}

            {isWorking && (
              <p className="mt-3 text-sm font-semibold text-black/60">
                {pdfProgress || text.upload.processingBrowser}
              </p>
            )}
            {error && (
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-red-700">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
          </div>

          <aside className="rounded-md border border-black/10 bg-white p-5">
            <h3 className="text-sm font-black uppercase tracking-wide text-black/50">{text.upload.importFrom}</h3>
            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={openGoogleDrive}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/70 transition-colors duration-150 hover:border-black/35 hover:text-black"
              >
                <Cloud className="h-4 w-4 text-brand-red" />
                Google Drive
              </button>
              <button
                type="button"
                onClick={openDropbox}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/70 transition-colors duration-150 hover:border-black/35 hover:text-black"
              >
                <HardDrive className="h-4 w-4 text-brand-red" />
                Dropbox
              </button>
            </div>
            <div className="mt-5 rounded-md border border-black/10 bg-white p-4 text-sm leading-6 text-black/60">
              {text.upload.cloudHint}
            </div>
            {cloudStatus && <p className="mt-3 text-sm font-semibold text-black/60">{cloudStatus}</p>}
          </aside>
        </div>
        )}
      </div>

      {!uploadOnly && result?.pages?.length > 0 && tool.slug === 'pdf-to-jpg' && (
        <div className="mt-6 rounded-md border border-black/10 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black text-black">{result.pageCount} JPG image{result.pageCount === 1 ? '' : 's'} ready</p>
              <p className="mt-1 text-sm text-black/50">Download pages separately or together as one ZIP file.</p>
            </div>
            <button type="button" onClick={downloadPdfPagesZip} className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-black px-5 py-2.5 text-sm font-bold text-white hover:bg-black/85">
              <Download className="h-5 w-5 text-brand-red" />
              Download all as ZIP
            </button>
          </div>
          {pdfProgress && <p className="mt-3 text-sm font-semibold text-black/60">{pdfProgress}</p>}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.pages.map((page) => (
              <article key={page.pageNumber} className="rounded-md border border-black/10 bg-white p-3 text-center">
                <img src={page.url} alt={`Converted JPG for PDF page ${page.pageNumber}`} title={`PDF page ${page.pageNumber} JPG`} loading="lazy" decoding="async" className="mx-auto max-h-72 w-full rounded border border-black/10 object-contain" />
                <a href={page.url} download={page.fileName} className="focus-ring mt-3 inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-4 py-2.5 text-sm font-bold text-black hover:border-black/35">
                  <Download className="h-4 w-4 text-brand-red" />
                  Download page {page.pageNumber}
                </a>
              </article>
            ))}
          </div>
        </div>
      )}

      {!uploadOnly && result && !result.pages && (
        <div className="mt-6 rounded-md border border-black/10 bg-white p-5 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-brand-red" />
          <p className="mt-2 font-black text-black">{text.upload.ready}</p>
          <p className="mt-1 text-sm text-black/50">{result.fileName}</p>
          {preview === 'image' && (
            <img src={result.downloadUrl} alt="Converted preview" title="Converted file preview" loading="lazy" decoding="async" className="mx-auto mt-4 max-h-64 rounded-md border border-black/10 object-contain" />
          )}
          {preview === 'pdf' && (
            <iframe title="Converted PDF preview" src={result.downloadUrl} className="mx-auto mt-4 h-64 w-full max-w-2xl rounded-md border border-black/10" />
          )}
          <a
            href={result.downloadUrl}
            download={result.fileName}
            className="focus-ring mt-4 inline-flex items-center gap-2 rounded-md bg-black px-5 py-2.5 text-sm font-bold text-white transition-colors duration-150 hover:bg-black/85"
          >
            <Download className="h-5 w-5 text-brand-red" />
            {text.upload.download}
          </a>
        </div>
      )}
    </div>
  );
}
