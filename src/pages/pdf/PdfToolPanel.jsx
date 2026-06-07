import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  SlidersHorizontal,
  UploadCloud,
  Wand2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  compressPdfToTarget,
  deletePdfPages,
  downloadBlob,
  formatFileSize,
  getPdfPageCount,
  parsePageRanges,
  rotatePdfPages,
  splitPdfByRanges,
} from '../../utils/pdfUtils.js';
import SeoHelmet from '../../components/seo/SeoHelmet.jsx';
import ToolSeoSections from '../../components/seo/ToolSeoSections.jsx';
import { toolSchemas } from '../../components/seo/schema.js';
import { absoluteUrl, getToolSeoBySlug } from '../../data/toolsSeoData.js';
import { useLanguage } from '../../i18n.jsx';
import createObjectUrl, { revokeObjectUrl } from '../../utils/createObjectUrl.js';

const actionLabels = {
  split: 'Split PDF',
  compress: 'Compress PDF',
  delete: 'Delete Pages',
  rotate: 'Rotate PDF',
};

const targetSizePresets = [
  { value: '100', label: 'PDF to 100 KB' },
  { value: '300', label: 'PDF to 300 KB' },
  { value: '500', label: 'PDF to 500 KB' },
  { value: 'custom', label: 'Custom KB' },
];

function outputName(file, suffix) {
  const base = file?.name?.replace(/\.pdf$/i, '') || 'filewalatool';
  return `${base}-${suffix}.pdf`;
}

export default function PdfToolPanel({ title, description, tool }) {
  const { text, tLiteral, tSeo, tToolTitle, tToolDescription } = useLanguage();
  const slugByTool = {
    split: 'split-pdf',
    compress: 'compress-pdf',
    delete: 'pdf-page-delete',
    rotate: 'rotate-pdf',
  };
  const seo = tSeo(getToolSeoBySlug(slugByTool[tool]));
  const localizedTitle = tToolTitle(slugByTool[tool]);
  const localizedDescription = tToolDescription(slugByTool[tool]);
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [rangeInput, setRangeInput] = useState('');
  const [targetPreset, setTargetPreset] = useState('300');
  const [targetSizeKB, setTargetSizeKB] = useState('300');
  const [rotationMode, setRotationMode] = useState('all');
  const [rotationDegrees, setRotationDegrees] = useState(90);
  const [outputBlob, setOutputBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [outputUrl, setOutputUrl] = useState('');
  const [status, setStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const isProcessing = ['uploading', 'processing', 'preparing'].includes(status);
  const actionLabel = text.pdf.actions[tool] ?? actionLabels[tool];
  const outputSize = outputBlob?.size || 0;
  const targetSizeBytes = Number(targetSizeKB) > 0 ? Number(targetSizeKB) * 1024 : 0;
  const reducedBytes = useMemo(() => Math.max(0, (file?.size || 0) - outputSize), [file?.size, outputSize]);
  const compressionPercent = file?.size && outputSize ? Math.max(0, Math.round((reducedBytes / file.size) * 100)) : 0;

  useEffect(() => {
    setOutputBlob(null);
    setStatus('');
    setStatusMessage('');
    setError('');
    setWarning('');
  }, [file, rangeInput, targetSizeKB, rotationMode, rotationDegrees]);

  useEffect(() => {
    const url = file ? createObjectUrl(file) : '';
    setPreviewUrl(url);
    return () => revokeObjectUrl(url);
  }, [file]);

  useEffect(() => {
    const url = outputBlob ? createObjectUrl(outputBlob) : '';
    setOutputUrl(url);
    return () => revokeObjectUrl(url);
  }, [outputBlob]);

  const handleTargetPreset = (preset) => {
    setTargetPreset(preset);
    if (preset !== 'custom') {
      setTargetSizeKB(preset);
    }
  };

  const handleFile = async (selectedFile) => {
    setFile(null);
    setPageCount(0);
    setRangeInput('');
    setOutputBlob(null);
    setStatus('');
    setStatusMessage('');
    setError('');
    setWarning('');

    if (!selectedFile) return;

    const looksLikePdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
    if (!looksLikePdf) {
      setError(text.pdf.uploadPdfError);
      return;
    }

    if (selectedFile.size === 0) {
      setError('Empty file. Please upload a PDF with content.');
      return;
    }

    try {
      setStatus('uploading');
      setStatusMessage('Reading PDF...');
      const count = await getPdfPageCount(selectedFile);
      setFile(selectedFile);
      setPageCount(count);
      setStatus('');
      setStatusMessage('');
    } catch (caughtError) {
      setError(caughtError.message || 'Invalid PDF. The file may be corrupted or password-protected.');
      setStatus('');
      setStatusMessage('');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files?.[0]);
  };

  const removeFile = (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const processPdf = async () => {
    if (!file) {
      setError(text.pdf.uploadFirst);
      return;
    }

    setStatus('processing');
    setStatusMessage(tool === 'compress' ? 'Compressing PDF...' : 'Processing PDF...');
    setError('');
    setWarning('');
    setOutputBlob(null);

    try {
      let blob;

      if (tool === 'split') {
        const pages = parsePageRanges(rangeInput, pageCount);
        blob = await splitPdfByRanges(file, pages);
      }

      if (tool === 'delete') {
        const pages = parsePageRanges(rangeInput, pageCount);
        blob = await deletePdfPages(file, pages);
      }

      if (tool === 'rotate') {
        const pages = rotationMode === 'all' ? 'all' : parsePageRanges(rangeInput, pageCount);
        blob = await rotatePdfPages(file, pages, rotationDegrees);
      }

      if (tool === 'compress') {
        const targetKB = Number(targetSizeKB);
        if (!Number.isFinite(targetKB) || targetKB <= 0) {
          throw new Error('Enter a valid target size in KB.');
        }

        const result = await compressPdfToTarget(file, targetKB, {
          onProgress: ({ phase, pageNumber, pageCount: totalPages }) => {
            if (phase === 'preparing') {
              setStatus('preparing');
              setStatusMessage('Preparing download...');
              return;
            }
            if (phase === 'checking') {
              setStatusMessage('Compressing PDF... checking size');
              return;
            }
            setStatusMessage(`Compressing PDF... ${pageNumber}/${totalPages}`);
          },
        });
        blob = result.blob;
        if (!result.reachedTarget) {
          setWarning('Closest possible size achieved while preserving document readability.');
        } else if (blob.size >= file.size) {
          setWarning(tLiteral('This PDF was already optimized, so the compressed file is not smaller.'));
        }
      }

      setOutputBlob(blob);
      setStatus('success');
      setStatusMessage(tool === 'compress' ? 'PDF compressed successfully' : `${localizedTitle} ${text.pdf.outputReady}`);
    } catch (caughtError) {
      setError(caughtError.message || (tool === 'compress' ? 'Compression failed. Please try another PDF.' : tLiteral('Could not process this PDF.')));
      setStatus('');
      setStatusMessage('');
    }
  };

  const downloadOutput = () => {
    if (!outputBlob) return;

    const suffixes = {
      split: 'split',
      compress: 'optimized',
      delete: 'pages-removed',
      rotate: 'rotated',
    };
    const fixedNames = { delete: 'pages-deleted.pdf', rotate: 'rotated.pdf' };
    downloadBlob(outputBlob, fixedNames[tool] || outputName(file, suffixes[tool]));
    setStatus(text.pdf.downloaded);
    setStatusMessage(text.pdf.downloaded);
  };

  return (
    <section className="bg-slate-50 py-8 sm:py-12">
      <SeoHelmet
        title={seo?.seoTitle ?? `${localizedTitle || title} - FileWalaTool`}
        description={seo?.metaDescription ?? localizedDescription ?? description}
        canonical={seo?.canonicalUrl ?? absoluteUrl(seo?.route ?? '/pdf-tools')}
        keywords={seo ? [seo.primaryKeyword, ...seo.secondaryKeywords, ...seo.longTailKeywords, ...seo.questionKeywords, ...seo.indiaKeywords, ...seo.brandKeywords, ...seo.alternateNames] : [localizedTitle || title, 'pdf tools']}
        jsonLd={seo ? toolSchemas(seo) : []}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-wide text-blue-700">{text.categories['PDF Tools']}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-black sm:text-4xl">{seo?.h1 ?? localizedTitle ?? title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-black/60">{seo?.shortIntro ?? localizedDescription ?? description}</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:p-6">
            <label
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center transition-colors hover:border-blue-500 hover:bg-blue-50/40"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-white text-blue-700 ring-1 ring-black/10">
                <UploadCloud className="h-7 w-7" />
              </span>
              <span className="mt-5 text-lg font-black text-black">{text.pdf.uploadPdf}</span>
              <span className="mt-2 max-w-md text-sm leading-6 text-black/55">
                {file?.name || text.pdf.uploadFirst}
              </span>
              {file && (
                <span className="mt-4 grid gap-1 text-sm font-semibold text-black/60">
                  <span className="font-black text-green-700">Ready: File Selected</span>
                  <span>File Name: {file.name}</span>
                  <span>Size: {formatFileSize(file.size)}</span>
                  <span>Type: {file.type || 'application/pdf'}</span>
                  <button type="button" onClick={removeFile} className="mt-1 text-sm font-bold text-red-700 underline underline-offset-2">
                    Remove
                  </button>
                </span>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </label>

            <p className="mt-3 text-sm font-semibold text-black/50">
              {tool === 'compress'
                ? 'PDF pages are compressed in your browser and rebuilt as a smaller optimized PDF.'
                : 'Files are processed in your browser and are not uploaded to any server.'}
            </p>

            {file && (
              <div className="mt-6 rounded-lg border border-black/10 bg-white p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-blue-50 text-blue-700">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-black">{file.name}</p>
                    <p className="mt-1 text-xs font-semibold text-black/50">
                      {formatFileSize(file.size)} - {pageCount} {pageCount === 1 ? text.pdf.page : text.pdf.pages}
                    </p>
                    {(tool === 'rotate' || tool === 'delete') && (
                      <p className="mt-2 break-words text-xs font-semibold leading-5 text-black/50">
                        Pages: {Array.from({ length: pageCount }, (_, index) => index + 1).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                {(tool === 'rotate' || tool === 'delete') && (
                  <div className="mt-4 min-h-[300px] w-full rounded-xl border border-black/10 bg-slate-50 p-2 md:min-h-[420px]">
                    <iframe
                      src={outputUrl || previewUrl}
                      title={outputUrl ? 'Processed PDF preview' : 'PDF preview'}
                      className="min-h-[300px] w-full rounded-lg bg-white md:min-h-[420px]"
                    />
                    <p className="mt-2 px-2 text-xs font-semibold text-black/50">
                      PDF preview is not supported in some browsers. You can still process and download the file.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="rounded-lg border border-black/10 bg-white p-5 shadow-sm lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-sm font-black uppercase tracking-wide text-black/50">{text.common.settings}</h2>

            {(tool === 'split' || tool === 'delete' || (tool === 'rotate' && rotationMode === 'custom')) && (
              <label className="mt-4 grid gap-2 text-sm font-bold text-black/70">
                {tool === 'delete' ? text.pdf.pagesToDelete : text.pdf.pageRange}
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(event) => setRangeInput(event.target.value)}
                  placeholder={text.pdf.pageRangePlaceholder}
                  className="rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            )}

            {tool === 'rotate' && (
              <div className="mt-4 grid gap-4">
                <fieldset className="grid gap-2">
                  <legend className="text-sm font-bold text-black/70">{text.pdf.pageSelection}</legend>
                  <label className="flex items-center gap-3 rounded-md border border-black/10 px-3 py-2 text-sm font-bold text-black/70">
                    <input
                      type="radio"
                      name="rotation-mode"
                      value="all"
                      checked={rotationMode === 'all'}
                      onChange={() => setRotationMode('all')}
                      className="h-4 w-4 accent-blue-700"
                    />
                    {text.pdf.allPages}
                  </label>
                  <label className="flex items-center gap-3 rounded-md border border-black/10 px-3 py-2 text-sm font-bold text-black/70">
                    <input
                      type="radio"
                      name="rotation-mode"
                      value="custom"
                      checked={rotationMode === 'custom'}
                      onChange={() => setRotationMode('custom')}
                      className="h-4 w-4 accent-blue-700"
                    />
                    {text.pdf.customPages}
                  </label>
                </fieldset>

                <label className="grid gap-2 text-sm font-bold text-black/70">
                  {text.pdf.rotation}
                  <select
                    value={rotationDegrees}
                    onChange={(event) => setRotationDegrees(Number(event.target.value))}
                    className="rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value={90}>Right 90 degrees</option>
                    <option value={180}>180°</option>
                    <option value={270}>Left 90 degrees</option>
                  </select>
                </label>
              </div>
            )}

            {tool === 'compress' && (
              <div className="mt-4 grid gap-3">
                <fieldset className="grid gap-2">
                  <legend className="flex items-center gap-2 text-sm font-bold text-black/70">
                    <SlidersHorizontal className="h-4 w-4 text-blue-700" />
                    Target size
                  </legend>
                  {targetSizePresets.map((preset) => (
                    <label key={preset.value} className="flex items-center gap-3 rounded-md border border-black/10 bg-slate-50 px-3 py-2 text-sm font-bold text-black/70">
                      <input
                        type="radio"
                        name="target-size"
                        value={preset.value}
                        checked={targetPreset === preset.value}
                        onChange={() => handleTargetPreset(preset.value)}
                        className="h-4 w-4 accent-blue-700"
                      />
                      {preset.label}
                    </label>
                  ))}
                </fieldset>

                {targetPreset === 'custom' && (
                  <label className="grid gap-2 text-sm font-bold text-black/70">
                    Target size in KB
                    <input
                      type="number"
                      min="10"
                      step="1"
                      value={targetSizeKB}
                      onChange={(event) => setTargetSizeKB(event.target.value)}
                      placeholder="Example: 1024"
                      className="rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                )}
              </div>
            )}

            <div className="mt-5 grid gap-2 rounded-md border border-black/10 bg-slate-50 p-4 text-sm font-semibold text-black/65">
              <span>{text.pdf.original}: {formatFileSize(file?.size || 0)}</span>
              {tool === 'compress' && <span>Target: {formatFileSize(targetSizeBytes)}</span>}
              <span>{text.pdf.output}: {formatFileSize(outputSize)}</span>
              {tool === 'compress' && <span>{text.pdf.reduced}: {compressionPercent}%</span>}
              <span>{text.pdf.totalPages}: {pageCount || '-'}</span>
            </div>

            {tool === 'compress' && outputBlob && (
              <div className="mt-4 grid gap-2 rounded-md border border-blue-100 bg-blue-50 p-4 text-sm font-black text-black/75">
                <span>Original Size: {formatFileSize(file?.size || 0)}</span>
                <span>Target Size: {formatFileSize(targetSizeBytes)}</span>
                <span>Final Size: {formatFileSize(outputSize)}</span>
                <span>Saved: {compressionPercent}%</span>
              </div>
            )}

            <button
              type="button"
              onClick={processPdf}
              disabled={!file || isProcessing}
              className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {isProcessing ? statusMessage : actionLabel}
            </button>

            <button
              type="button"
              onClick={downloadOutput}
              disabled={!outputBlob}
              className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-5 py-3 text-sm font-black text-black transition-colors hover:border-blue-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-black/30"
            >
              <Download className="h-4 w-4" />
              {text.pdf.downloadPdf}
            </button>

            {warning && (
              <p className="mt-4 flex gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                {warning}
              </p>
            )}
            {error && (
              <p className="mt-4 flex gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                {error}
              </p>
            )}
            {statusMessage && status !== 'processing' && status !== 'preparing' && status !== 'uploading' && (
              <p className="mt-4 flex gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
                {statusMessage}
              </p>
            )}
          </aside>
        </div>
      </div>
      <ToolSeoSections seo={seo} activeTab="PDF Tools" />
    </section>
  );
}
