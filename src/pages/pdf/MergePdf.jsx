import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import SeoHelmet from '../../components/seo/SeoHelmet.jsx';
import ToolSeoSections from '../../components/seo/ToolSeoSections.jsx';
import { toolSchemas } from '../../components/seo/schema.js';
import { absoluteUrl, getToolSeoBySlug } from '../../data/toolsSeoData.js';
import { useLanguage } from '../../i18n.jsx';
import { downloadBlob, formatFileSize, mergePdfFiles } from '../../utils/pdfUtils.js';

function fileId(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function MergePdf() {
  const { text, tLiteral, tSeo } = useLanguage();
  const seo = tSeo(getToolSeoBySlug('merge-pdf'));
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [mergedBlob, setMergedBlob] = useState(null);
  const [mergedUrl, setMergedUrl] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const isMerging = status === 'merging';
  const totalSize = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files]);

  useEffect(() => () => {
    if (mergedUrl) URL.revokeObjectURL(mergedUrl);
  }, [mergedUrl]);

  const clearOutput = () => {
    if (mergedUrl) URL.revokeObjectURL(mergedUrl);
    setMergedBlob(null);
    setMergedUrl('');
    setStatus('');
  };

  const addFiles = (fileList) => {
    const selected = Array.from(fileList ?? []);
    if (selected.length === 0) return;

    clearOutput();
    setError('');
    setWarning('');

    const pdfFiles = selected.filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    const rejectedCount = selected.length - pdfFiles.length;

    setFiles((currentFiles) => {
      const existingIds = new Set(currentFiles.map(fileId));
      const nextFiles = [...currentFiles];

      pdfFiles.forEach((file) => {
        if (!existingIds.has(fileId(file))) {
          nextFiles.push(file);
          existingIds.add(fileId(file));
        }
      });

      return nextFiles;
    });

    if (rejectedCount > 0) {
      setWarning(tLiteral('Only PDF files are accepted. Non-PDF files were skipped.'));
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  };

  const removeFile = (indexToRemove) => {
    clearOutput();
    setFiles((currentFiles) => currentFiles.filter((_, index) => index !== indexToRemove));
  };

  const moveFile = (index, direction) => {
    clearOutput();
    setFiles((currentFiles) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= currentFiles.length) return currentFiles;

      const reordered = [...currentFiles];
      const [movedFile] = reordered.splice(index, 1);
      reordered.splice(nextIndex, 0, movedFile);
      return reordered;
    });
  };

  const handleMerge = async () => {
    setError('');
    setWarning('');

    if (files.length < 2) {
      setWarning(tLiteral('Please select at least 2 PDF files to merge.'));
      return;
    }

    setStatus('merging');

    try {
      const blob = await mergePdfFiles(files);
      if (mergedUrl) URL.revokeObjectURL(mergedUrl);
      setMergedBlob(blob);
      setMergedUrl(URL.createObjectURL(blob));
      setStatus(tLiteral('Merged PDF is ready.'));
    } catch (caughtError) {
      setError(caughtError.message || tLiteral('Unable to merge these PDF files.'));
      setStatus('');
    }
  };

  const handleDownload = () => {
    if (!mergedBlob) return;
    downloadBlob(mergedBlob, 'merged-filewalatool.pdf');
    setStatus(tLiteral('Merged PDF downloaded.'));
  };

  return (
    <section className="bg-slate-50 py-8 sm:py-12">
      <SeoHelmet
        title={seo.seoTitle}
        description={seo.metaDescription}
        canonical={seo.canonicalUrl ?? absoluteUrl(seo.route)}
        keywords={[seo.primaryKeyword, ...seo.secondaryKeywords, ...seo.longTailKeywords, ...seo.questionKeywords, ...seo.indiaKeywords, ...seo.brandKeywords, ...seo.alternateNames]}
        jsonLd={toolSchemas(seo)}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-wide text-blue-700">{text.categories['PDF Tools']}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-black sm:text-4xl">{seo.h1}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-black/60">
            {seo.shortIntro}
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:p-6">
          <label
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center transition-colors hover:border-blue-500 hover:bg-blue-50/40"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-white text-blue-700 ring-1 ring-black/10">
              <UploadCloud className="h-7 w-7" />
            </span>
            <span className="mt-5 text-lg font-black text-black">{text.pdf.uploadPdfFiles}</span>
            <span className="mt-2 max-w-md text-sm leading-6 text-black/55">
              {text.upload.drop}
            </span>
            {files.length > 0 && (
              <span className="mt-4 grid gap-1 text-sm font-semibold text-black/60">
                <span className="font-black text-green-700">✓ {files.length} Files Selected</span>
                <span>Total Size: {formatFileSize(totalSize)}</span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    clearOutput();
                    setFiles([]);
                    if (inputRef.current) inputRef.current.value = '';
                  }}
                  className="mt-1 text-sm font-bold text-red-700 underline underline-offset-2"
                >
                  Remove
                </button>
              </span>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              className="sr-only"
              onChange={(event) => addFiles(event.target.files)}
            />
          </label>

          <p className="mt-3 text-sm font-semibold text-black/50">
            {text.pdf.browserHint}
          </p>

          <div className="mt-6 rounded-lg border border-black/10 bg-white">
            <div className="flex flex-col gap-2 border-b border-black/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-black text-black">{tLiteral('Selected files')}</h2>
                <p className="mt-1 text-sm text-black/50">
                  {files.length} {files.length === 1 ? text.grid.tool : text.upload.filesSelected} - {formatFileSize(totalSize)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="focus-ring inline-flex items-center justify-center rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-bold text-black transition-colors hover:border-blue-400 hover:text-blue-700"
              >
                {tLiteral('Add PDFs')}
              </button>
            </div>

            {files.length > 0 ? (
              <ul className="divide-y divide-black/10">
                {files.map((file, index) => (
                  <li key={fileId(file)} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-blue-50 text-blue-700">
                        <FileText className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-black">{file.name}</p>
                        <p className="mt-1 text-xs font-semibold text-black/50">{formatFileSize(file.size)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:flex-none">
                      <button
                        type="button"
                        onClick={() => moveFile(index, -1)}
                        disabled={index === 0}
                        className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 text-black/70 transition-colors hover:border-blue-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-black/25"
                        aria-label={`Move ${file.name} up`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFile(index, 1)}
                        disabled={index === files.length - 1}
                        className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 text-black/70 transition-colors hover:border-blue-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-black/25"
                        aria-label={`Move ${file.name} down`}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 text-red-700 transition-colors hover:border-red-300 hover:bg-red-50"
                        aria-label={`Remove ${file.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-10 text-center text-sm font-semibold text-black/45">
                {tLiteral('No PDFs selected yet.')}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleMerge}
              disabled={files.length < 2 || isMerging}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isMerging && <Loader2 className="h-4 w-4 animate-spin" />}
              {tLiteral('Merge PDFs')}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!mergedBlob}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-5 py-3 text-sm font-black text-black transition-colors hover:border-blue-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-black/30"
            >
              <Download className="h-4 w-4" />
              {tLiteral('Download Merged PDF')}
            </button>
          </div>

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
          {status && status !== 'merging' && (
            <p className="mt-4 flex gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
              {status}
            </p>
          )}
        </div>
      </div>
      <ToolSeoSections seo={seo} activeTab="PDF Tools" />
    </section>
  );
}

