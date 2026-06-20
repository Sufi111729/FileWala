import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  FileText,
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
import {
  FileSelectedStatus,
  StickyActionBar,
  StickyDesktopActionPanel,
  ToolResultCard,
} from '../../components/tools/ToolWorkflow.jsx';

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
    <section className="bg-slate-50 py-4 sm:py-6">
      <SeoHelmet
        title={seo.seoTitle}
        description={seo.metaDescription}
        canonical={seo.canonicalUrl ?? absoluteUrl(seo.route)}
        keywords={[seo.primaryKeyword, ...seo.secondaryKeywords, ...seo.longTailKeywords, ...seo.questionKeywords, ...seo.indiaKeywords, ...seo.brandKeywords, ...seo.alternateNames]}
        jsonLd={toolSchemas(seo)}
      />
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-0">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-wide text-blue-700">{text.categories['PDF Tools']}</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-black sm:text-3xl">{seo.h1}</h1>
          <p className="mt-2 text-sm leading-6 text-black/60 sm:text-base">
            {seo.shortIntro}
          </p>
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:p-5">
          {files.length === 0 && (
            <label
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center transition-colors hover:border-blue-500 hover:bg-blue-50/40 sm:py-8"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-blue-700 ring-1 ring-black/10">
                <UploadCloud className="h-6 w-6" />
              </span>
              <span className="mt-4 text-base font-black text-black sm:text-lg">{text.pdf.uploadPdfFiles}</span>
              <span className="mt-2 max-w-md text-sm leading-6 text-black/55">{text.upload.drop}</span>
              <span className="mt-5 inline-flex min-h-12 items-center rounded-md bg-blue-700 px-5 py-3 text-sm font-black text-white">Select PDFs</span>
              <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="sr-only" onChange={(event) => addFiles(event.target.files)} />
            </label>
          )}
          <div className={files.length ? '' : 'mt-4'}>
            <FileSelectedStatus
              files={files}
              onChange={() => inputRef.current?.click()}
              onRemove={(event) => {
                event.preventDefault();
                event.stopPropagation();
                clearOutput();
                setFiles([]);
                if (inputRef.current) inputRef.current.value = '';
              }}
              meta={`Total size: ${formatFileSize(totalSize)}`}
            />
            {files.length > 0 && <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="sr-only" onChange={(event) => addFiles(event.target.files)} />}
          </div>

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

        </div>

          <StickyDesktopActionPanel
            primaryLabel={files.length < 2 ? 'Select File' : tLiteral('Merge PDFs')}
            onPrimary={files.length < 2 ? () => inputRef.current?.click() : handleMerge}
            primaryDisabled={false}
            processing={isMerging}
            processingLabel={tLiteral('Merging PDFs...')}
            downloadLabel={tLiteral('Download Merged PDF')}
            onDownload={handleDownload}
            downloadDisabled={!mergedBlob}
            helperText={files.length < 2 ? tLiteral('Choose at least 2 PDFs to enable merge.') : mergedBlob ? 'Done! Your file is ready.' : `${files.length} PDFs selected`}
            done={Boolean(mergedBlob)}
          >
            <h2 className="text-sm font-black uppercase tracking-wide text-black/50">Output</h2>
            <div className="mt-4 grid gap-2 rounded-md border border-black/10 bg-slate-50 p-4 text-sm font-semibold text-black/65">
              <span>Files: {files.length}</span>
              <span>Total Size: {formatFileSize(totalSize)}</span>
              <span>Output: {formatFileSize(mergedBlob?.size || 0)}</span>
            </div>
            {mergedBlob && (
              <div className="mt-4">
                <ToolResultCard title="Merged PDF ready" fileName="merged-filewalatool.pdf" fileSize={formatFileSize(mergedBlob.size)} />
              </div>
            )}

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
          </StickyDesktopActionPanel>
        </div>
      </div>
      <ToolSeoSections seo={seo} activeTab="PDF Tools" />
      <StickyActionBar
        primaryLabel={files.length < 2 ? 'Select File' : tLiteral('Merge PDFs')}
        onPrimary={files.length < 2 ? () => inputRef.current?.click() : handleMerge}
        primaryDisabled={false}
        processing={isMerging}
        processingLabel={tLiteral('Merging PDFs...')}
        downloadLabel={tLiteral('Download Merged PDF')}
        onDownload={handleDownload}
        downloadDisabled={!mergedBlob}
        helperText={files.length < 2 ? tLiteral('Choose at least 2 PDFs to enable merge.') : mergedBlob ? tLiteral('Merged PDF is ready.') : `${files.length} PDFs selected`}
        done={Boolean(mergedBlob)}
      />
    </section>
  );
}

