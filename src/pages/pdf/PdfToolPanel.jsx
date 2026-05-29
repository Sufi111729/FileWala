import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  UploadCloud,
  Wand2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  basicCompressPdf,
  deletePdfPages,
  downloadBlob,
  formatFileSize,
  getPdfPageCount,
  parsePageRanges,
  rotatePdfPages,
  splitPdfByRanges,
} from '../../utils/pdfUtils.js';
import { useLanguage } from '../../i18n.jsx';

const actionLabels = {
  split: 'Split PDF',
  compress: 'Compress PDF',
  delete: 'Delete Pages',
  rotate: 'Rotate PDF',
};

function outputName(file, suffix) {
  const base = file?.name?.replace(/\.pdf$/i, '') || 'filewalatool';
  return `${base}-${suffix}.pdf`;
}

export default function PdfToolPanel({ title, description, tool }) {
  const { text } = useLanguage();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [rangeInput, setRangeInput] = useState('');
  const [rotationMode, setRotationMode] = useState('all');
  const [rotationDegrees, setRotationDegrees] = useState(90);
  const [outputBlob, setOutputBlob] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const isProcessing = status === 'processing';
  const actionLabel = text.pdf.actions[tool] ?? actionLabels[tool];
  const outputSize = outputBlob?.size || 0;
  const reducedBytes = useMemo(() => Math.max(0, (file?.size || 0) - outputSize), [file?.size, outputSize]);
  const compressionPercent = file?.size && outputSize ? Math.max(0, Math.round((reducedBytes / file.size) * 100)) : 0;

  useEffect(() => {
    setOutputBlob(null);
    setStatus('');
    setError('');
    setWarning('');
  }, [file, rangeInput, rotationMode, rotationDegrees]);

  const handleFile = async (selectedFile) => {
    setFile(null);
    setPageCount(0);
    setRangeInput('');
    setOutputBlob(null);
    setStatus('');
    setError('');
    setWarning('');

    if (!selectedFile) return;

    const looksLikePdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
    if (!looksLikePdf) {
      setError(text.pdf.uploadPdfError);
      return;
    }

    try {
      const count = await getPdfPageCount(selectedFile);
      setFile(selectedFile);
      setPageCount(count);
    } catch (caughtError) {
      setError(caughtError.message);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files?.[0]);
  };

  const processPdf = async () => {
    if (!file) {
      setError(text.pdf.uploadFirst);
      return;
    }

    setStatus('processing');
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
        blob = await basicCompressPdf(file);
        setWarning(
          blob.size < file.size
            ? text.pdf.compressLimited
            : 'This PDF could not be reduced much in the browser.',
        );
      }

      setOutputBlob(blob);
      setStatus(`${title} ${text.pdf.outputReady}`);
    } catch (caughtError) {
      setError(caughtError.message || 'Could not process this PDF.');
      setStatus('');
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
    downloadBlob(outputBlob, outputName(file, suffixes[tool]));
    setStatus(text.pdf.downloaded);
  };

  return (
    <section className="bg-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-wide text-blue-700">{text.categories['PDF Tools']}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-black sm:text-4xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-black/60">{description}</p>
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
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </label>

            <p className="mt-3 text-sm font-semibold text-black/50">
              {text.pdf.browserHint}
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
                  </div>
                </div>
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
                    <option value={90}>90°</option>
                    <option value={180}>180°</option>
                    <option value={270}>270°</option>
                  </select>
                </label>
              </div>
            )}

            {tool === 'compress' && (
              <div className="mt-4 rounded-md border border-black/10 bg-slate-50 p-4 text-sm leading-6 text-black/60">
                {text.pdf.compressLimited}
              </div>
            )}

            <div className="mt-5 grid gap-2 rounded-md border border-black/10 bg-slate-50 p-4 text-sm font-semibold text-black/65">
              <span>{text.pdf.original}: {formatFileSize(file?.size || 0)}</span>
              <span>{text.pdf.output}: {formatFileSize(outputSize)}</span>
              {tool === 'compress' && <span>{text.pdf.reduced}: {compressionPercent}%</span>}
              <span>{text.pdf.totalPages}: {pageCount || '-'}</span>
            </div>

            <button
              type="button"
              onClick={processPdf}
              disabled={isProcessing}
              className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {actionLabel}
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
            {status && status !== 'processing' && (
              <p className="mt-4 flex gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
                {status}
              </p>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
