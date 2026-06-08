import { AlertCircle, CheckCircle2, Download, Loader2, UploadCloud, Wand2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  calculateCompression,
  compressImageByQuality,
  compressImageToTargetKB,
  downloadBlob,
  formatFileSize,
} from '../../utils/compressUtils.js';
import SeoHelmet from '../../components/seo/SeoHelmet.jsx';
import ToolSeoSections from '../../components/seo/ToolSeoSections.jsx';
import { toolSchemas } from '../../components/seo/schema.js';
import { absoluteUrl, getToolSeoBySlug } from '../../data/toolsSeoData.js';
import { useLanguage } from '../../i18n.jsx';

const modeSettings = {
  best: { label: 'Best quality', quality: 0.9 },
  balanced: { label: 'Balanced size', quality: 0.72 },
  fast: { label: 'Fast export', quality: 0.55 },
};

function previewUrl(fileOrBlob) {
  return fileOrBlob ? URL.createObjectURL(fileOrBlob) : '';
}

export default function ImageCompressor({ title = 'Image Compressor', targetKB = null, customTarget = false }) {
  const { text, tSeo, tToolTitle, tToolDescription } = useLanguage();
  const seoSlugByTitle = {
    'Image Compressor': 'compress-image',
    'Image to 20KB': 'photo-to-20kb',
    'Image to 50KB': 'photo-to-50kb',
    'Image to 100KB': 'photo-to-100kb',
    'Custom Image KB Resizer': 'image-kb-resizer',
  };
  const seoSlug = seoSlugByTitle[title] ?? 'compress-image';
  const seo = tSeo(getToolSeoBySlug(seoSlug));
  const localizedTitle = tToolTitle(seoSlug);
  const localizedDescription = tToolDescription(seoSlug);
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [compressedUrl, setCompressedUrl] = useState('');
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState('balanced');
  const [target, setTarget] = useState(targetKB || 80);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const isFixedTarget = Number(targetKB) > 0;
  const activeTarget = isFixedTarget ? Number(targetKB) : Number(target);
  const isProcessing = status === 'processing';
  const reduction = calculateCompression(file?.size, result?.blob?.size);

  const outputName = useMemo(() => {
    if (!result) return 'compressed-image.jpg';
    const base = file?.name?.replace(/\.[^.]+$/, '') || 'compressed-image';
    return `${base}-compressed.${result.extension}`;
  }, [file?.name, result]);

  useEffect(() => () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
  }, [originalUrl, compressedUrl]);

  const resetResult = () => {
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setCompressedUrl('');
    setResult(null);
    setStatus('');
    setError('');
  };

  const handleFile = (selectedFile) => {
    resetResult();
    setWarning('');

    if (!selectedFile) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
      setError(text.image.invalidType);
      setFile(null);
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError(text.image.tooLarge);
      setFile(null);
      return;
    }

    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setFile(selectedFile);
    setOriginalUrl(previewUrl(selectedFile));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files?.[0]);
  };

  const removeFile = (event) => {
    event.preventDefault();
    event.stopPropagation();
    resetResult();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl('');
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const processImage = async () => {
    if (!file) {
      setError(text.image.selectFirst);
      return;
    }

    if ((isFixedTarget || customTarget) && (!activeTarget || activeTarget < 1)) {
      setError(text.image.validTarget);
      return;
    }

    if ((isFixedTarget || customTarget) && activeTarget * 1024 >= file.size) {
      setWarning(text.image.targetWarning);
    } else {
      setWarning('');
    }

    setStatus('processing');
    setError('');

    try {
      const compressed = isFixedTarget || customTarget
        ? await compressImageToTargetKB(file, activeTarget, { preferOriginalType: false })
        : await compressImageByQuality(file, modeSettings[mode].quality, { preferOriginalType: false });

      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
      setResult(compressed);
      setCompressedUrl(previewUrl(compressed.blob));
      setStatus(text.image.success);
    } catch (caughtError) {
      setError(caughtError.message || text.image.failed);
      setStatus('');
    }
  };

  const download = () => {
    if (!result?.blob) return;
    downloadBlob(result.blob, outputName);
    setStatus(text.image.downloaded);
  };

  return (
    <section className="bg-white py-8 sm:py-12">
      <SeoHelmet
        title={seo?.seoTitle ?? `${localizedTitle || title} - FileWalaTool`}
        description={seo?.metaDescription ?? localizedDescription}
        canonical={seo?.canonicalUrl ?? absoluteUrl(seo?.route ?? '/compress-image')}
        keywords={seo ? [seo.primaryKeyword, ...seo.secondaryKeywords, ...seo.longTailKeywords, ...seo.questionKeywords, ...seo.indiaKeywords, ...seo.brandKeywords, ...seo.alternateNames] : [localizedTitle || title, 'compress image']}
        jsonLd={seo ? toolSchemas(seo) : []}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-wide text-green-700">{text.categories.Compress}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-black sm:text-4xl">{seo?.h1 ?? localizedTitle ?? title}</h1>
          <p className="mt-4 text-base leading-7 text-black/60">
            {seo?.shortIntro ?? localizedDescription}
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-6">
            <label
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-black/20 bg-white px-5 py-10 text-center transition-colors hover:border-green-500"
            >
              <UploadCloud className="h-10 w-10 text-green-700" />
              <span className="mt-4 text-lg font-black text-black">{text.image.uploadImage}</span>
              <span className="mt-2 text-sm text-black/55">{file?.name || text.image.uploadHint}</span>
              {file && (
                <span className="mt-4 grid gap-1 text-sm font-semibold text-black/60">
                  <span className="font-black text-green-700">✓ File Selected</span>
                  <span>File Name: {file.name}</span>
                  <span>Size: {formatFileSize(file.size)}</span>
                  <button type="button" onClick={removeFile} className="mt-1 text-sm font-bold text-red-700 underline underline-offset-2">
                    Remove
                  </button>
                </span>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </label>

            <div className="grid gap-4 lg:grid-cols-2">
              <PreviewCard title={text.image.original} url={originalUrl} size={file?.size} />
              <PreviewCard title={text.image.compressed} url={compressedUrl} size={result?.blob?.size} />
            </div>
          </div>

          <aside className="rounded-md border border-black/10 bg-white p-5 lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-sm font-black uppercase tracking-wide text-black/50">{text.common.settings}</h2>
            <div className="mt-4 grid gap-3">
              {Object.entries(modeSettings).map(([key, item]) => (
                <label key={key} className="flex cursor-pointer items-center gap-3 rounded-md border border-black/10 px-3 py-3 text-sm font-bold text-black/70">
                  <input
                    type="radio"
                    name="compress-mode"
                    checked={mode === key}
                    onChange={() => setMode(key)}
                    className="h-4 w-4 accent-black"
                    disabled={isFixedTarget || customTarget}
                  />
                  {text.upload.options[['best', 'balanced', 'fast'].indexOf(key)] ?? item.label}
                </label>
              ))}
            </div>

            {(isFixedTarget || customTarget) && (
              <label className="mt-4 grid gap-2 text-sm font-bold text-black/70">
                {text.image.targetKb}
                <input
                  type="number"
                  min="1"
                  value={activeTarget}
                  readOnly={isFixedTarget}
                  onChange={(event) => setTarget(Number(event.target.value))}
                  className="rounded-md border border-black/10 px-3 py-2"
                />
              </label>
            )}

            {file && (
              <div className="mt-5 grid gap-2 rounded-md border border-black/10 bg-black/[0.015] p-4 text-sm font-semibold text-black/65">
                <span>{text.image.original}: {formatFileSize(file.size)}</span>
                <span>{text.image.compressed}: {formatFileSize(result?.blob?.size || 0)}</span>
                <span>{text.image.reduction}: {reduction}%</span>
              </div>
            )}

            <button
              type="button"
              onClick={processImage}
              disabled={!file || isProcessing}
              className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-black px-5 py-3 text-sm font-bold text-white hover:bg-black/85 disabled:cursor-not-allowed disabled:bg-black/25"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin text-green-400" /> : <Wand2 className="h-4 w-4 text-green-400" />}
              {text.image.compressImage}
            </button>

            <button
              type="button"
              onClick={download}
              disabled={!result?.blob}
              className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-5 py-3 text-sm font-bold text-black hover:border-black/35 disabled:cursor-not-allowed disabled:text-black/30"
            >
              <Download className="h-4 w-4 text-green-700" />
              {text.common.download}
            </button>

            {warning && <p className="mt-3 text-sm font-bold text-orange-700">{warning}</p>}
            {error && (
              <p className="mt-3 flex gap-2 text-sm font-bold text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                {error}
              </p>
            )}
            {status && status !== 'processing' && (
              <p className="mt-3 flex gap-2 text-sm font-bold text-green-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
                {status}
              </p>
            )}
          </aside>
        </div>
        <ToolSeoSections seo={seo} activeTab="Compress" />
      </div>
    </section>
  );
}

function PreviewCard({ title, url, size }) {
  const { text } = useLanguage();
  return (
    <div className="rounded-md border border-black/10 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-black uppercase tracking-wide text-black/50">{title}</h2>
        <span className="text-xs font-bold text-black/50">{formatFileSize(size || 0)}</span>
      </div>
      <div className="mt-3 flex min-h-72 items-center justify-center rounded-md border border-dashed border-black/15 bg-black/[0.015] p-3">
        {url ? <img src={url} alt={`${title} preview`} className="max-h-[420px] max-w-full rounded-md object-contain" /> : <p className="text-center text-sm font-semibold text-black/45">{text.image.previewHint}</p>}
      </div>
    </div>
  );
}
