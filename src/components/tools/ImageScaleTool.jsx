import { AlertCircle, CheckCircle2, Download, ImagePlus, Loader2, Wand2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import SeoHelmet from '../seo/SeoHelmet.jsx';
import ToolSeoSections from '../seo/ToolSeoSections.jsx';
import { toolSchemas } from '../seo/schema.js';
import { absoluteUrl, getToolSeoBySlug } from '../../data/toolsSeoData.js';
import {
  calculateAspectRatioSize,
  downloadBlob,
  formatFileSize,
  getImageDimensions,
  resizeImageWithCanvas,
} from '../../utils/imageResizeUtils.js';
import { useLanguage } from '../../i18n.jsx';

const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const maxSize = 10 * 1024 * 1024;

function makePreviewUrl(fileOrBlob) {
  return fileOrBlob ? URL.createObjectURL(fileOrBlob) : '';
}

export default function ImageScaleTool({
  mode,
  title,
  description,
  presets,
  filenamePrefix,
}) {
  const { text, tLiteral, tSeo, tToolTitle, tToolDescription } = useLanguage();
  const inputRef = useRef(null);
  const seoSlug = mode === 'upscale' ? 'image-upscaler' : 'image-downscaler';
  const seo = tSeo(getToolSeoBySlug(seoSlug));
  const localizedTitle = tToolTitle(seoSlug);
  const localizedDescription = tToolDescription(seoSlug);
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [originalDimensions, setOriginalDimensions] = useState(null);
  const [result, setResult] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(presets[0]?.id || 'custom');
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [outputType, setOutputType] = useState('image/png');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const isProcessing = status === 'processing';
  const selectedOption = presets.find((preset) => preset.id === selectedPreset);
  const outputName = useMemo(() => {
    const base = file?.name?.replace(/\.[^.]+$/, '') || filenamePrefix;
    const extension = outputType === 'image/jpeg' ? 'jpg' : 'png';
    return `${filenamePrefix}-${base}.${extension}`;
  }, [file?.name, filenamePrefix, outputType]);

  useEffect(() => () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [originalUrl, resultUrl]);

  const clearResult = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl('');
    setResult(null);
    setStatus('');
  };

  const handleFile = async (selectedFile) => {
    setError('');
    clearResult();
    if (!selectedFile) return;

    if (!acceptedTypes.includes(selectedFile.type)) {
      setFile(null);
      setOriginalDimensions(null);
      setError(tLiteral('Please upload a JPG, JPEG, PNG, or WEBP image.'));
      return;
    }

    if (selectedFile.size > maxSize) {
      setFile(null);
      setOriginalDimensions(null);
      setError(tLiteral('Please upload an image under 10MB.'));
      return;
    }

    try {
      const dimensions = await getImageDimensions(selectedFile);
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      setFile(selectedFile);
      setOriginalDimensions(dimensions);
      setOriginalUrl(makePreviewUrl(selectedFile));
      setCustomWidth(String(dimensions.width));
      setCustomHeight(String(dimensions.height));
    } catch (caughtError) {
      setError(caughtError.message || tLiteral('This image could not be opened. Please try another file.'));
    }
  };

  const removeFile = (event) => {
    event.preventDefault();
    event.stopPropagation();
    clearResult();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl('');
    setFile(null);
    setOriginalDimensions(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const syncCustomWidth = (value) => {
    const width = Math.max(1, Number(value) || 1);
    setCustomWidth(String(width));
    setSelectedPreset('custom');
    if (keepAspectRatio && originalDimensions) {
      setCustomHeight(String(calculateAspectRatioSize(originalDimensions.width, originalDimensions.height, width, null).height));
    }
  };

  const syncCustomHeight = (value) => {
    const height = Math.max(1, Number(value) || 1);
    setCustomHeight(String(height));
    setSelectedPreset('custom');
    if (keepAspectRatio && originalDimensions) {
      setCustomWidth(String(calculateAspectRatioSize(originalDimensions.width, originalDimensions.height, null, height).width));
    }
  };

  const getOutputSize = () => {
    if (!originalDimensions) return null;
    const { width, height } = originalDimensions;

    if (selectedOption?.scale) {
      return {
        width: Math.max(1, Math.round(width * selectedOption.scale)),
        height: Math.max(1, Math.round(height * selectedOption.scale)),
      };
    }

    if (selectedOption?.maxWidth) {
      const nextWidth = Math.min(width, selectedOption.maxWidth);
      return calculateAspectRatioSize(width, height, nextWidth, null);
    }

    const targetWidth = Math.max(1, Number(customWidth) || width);
    const targetHeight = Math.max(1, Number(customHeight) || height);
    return keepAspectRatio
      ? calculateAspectRatioSize(width, height, targetWidth, targetHeight)
      : { width: targetWidth, height: targetHeight };
  };

  const processImage = async () => {
    if (!file) {
      setError(tLiteral('Please upload an image first.'));
      return;
    }

    const outputSize = getOutputSize();
    if (!outputSize?.width || !outputSize?.height) {
      setError(tLiteral('Please choose a valid output size.'));
      return;
    }

    setStatus('processing');
    setError('');

    try {
      const processed = await resizeImageWithCanvas(file, {
        width: outputSize.width,
        height: outputSize.height,
        type: outputType,
        quality: 0.92,
      });

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResult(processed);
      setResultUrl(makePreviewUrl(processed.blob));
      setStatus(tLiteral('Image processed successfully.'));
    } catch (caughtError) {
      setError(caughtError.message || tLiteral('Image processing failed. Please try again.'));
      setStatus('');
    }
  };

  const download = () => {
    if (!result?.blob) return;
    downloadBlob(result.blob, outputName);
  };

  return (
    <section className="bg-white py-8 sm:py-12">
      <SeoHelmet
        title={seo?.seoTitle ?? `${localizedTitle || title} - FileWalaTool`}
        description={seo?.metaDescription ?? localizedDescription ?? description}
        canonical={seo?.canonicalUrl ?? absoluteUrl(`/tools/${seoSlug}`)}
        keywords={seo ? [seo.primaryKeyword, ...seo.secondaryKeywords, ...seo.longTailKeywords, ...seo.questionKeywords, ...seo.indiaKeywords, ...seo.brandKeywords, ...seo.alternateNames] : [localizedTitle || title]}
        jsonLd={seo ? toolSchemas(seo) : []}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-wide text-green-700">{text.categories['Image Tools']}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-black sm:text-4xl">{seo?.h1 ?? localizedTitle ?? title}</h1>
          <p className="mt-4 text-base leading-7 text-black/60">
            {seo?.shortIntro ?? localizedDescription ?? description}
          </p>
          {mode === 'upscale' && (
            <p className="mt-2 text-sm font-bold text-black/55">{tLiteral('Browser-side image upscaling')}</p>
          )}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-6">
            <label
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleFile(event.dataTransfer.files?.[0]);
              }}
              className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-black/20 bg-white px-5 py-10 text-center transition-colors hover:border-green-500"
            >
              <ImagePlus className="h-10 w-10 text-green-700" />
              <span className="mt-4 text-lg font-black text-black">{text.image.uploadImage}</span>
              <span className="mt-2 text-sm text-black/55">{file?.name || tLiteral('JPG, JPEG, PNG, or WEBP up to 10MB')}</span>
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
              <PreviewCard title={text.image.original} url={originalUrl} size={file?.size} dimensions={originalDimensions} />
              <PreviewCard title={tLiteral('Result')} url={resultUrl} size={result?.blob?.size} dimensions={result} />
            </div>
          </div>

          <aside className="rounded-md border border-black/10 bg-white p-5 lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-sm font-black uppercase tracking-wide text-black/50">{text.common.settings}</h2>
            <div className="mt-4 grid gap-3">
              {presets.map((preset) => (
                <label key={preset.id} className="flex cursor-pointer items-center gap-3 rounded-md border border-black/10 px-3 py-3 text-sm font-bold text-black/70">
                  <input
                    type="radio"
                    name={`${mode}-preset`}
                    checked={selectedPreset === preset.id}
                    onChange={() => setSelectedPreset(preset.id)}
                    className="h-4 w-4 accent-black"
                  />
                  {tLiteral(preset.label)}
                </label>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="grid gap-2 text-sm font-bold text-black/70">
                {tLiteral('Width')}
                <input
                  type="number"
                  min="1"
                  value={customWidth}
                  onChange={(event) => syncCustomWidth(event.target.value)}
                  className="rounded-md border border-black/10 px-3 py-2"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-black/70">
                {tLiteral('Height')}
                <input
                  type="number"
                  min="1"
                  value={customHeight}
                  onChange={(event) => syncCustomHeight(event.target.value)}
                  className="rounded-md border border-black/10 px-3 py-2"
                />
              </label>
            </div>

            <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-md border border-black/10 px-3 py-3 text-sm font-bold text-black/70">
              <input
                type="checkbox"
                checked={keepAspectRatio}
                onChange={(event) => setKeepAspectRatio(event.target.checked)}
                className="h-4 w-4 accent-black"
              />
              {tLiteral('Keep aspect ratio')}
            </label>

            <label className="mt-4 grid gap-2 text-sm font-bold text-black/70">
              {tLiteral('Download format')}
              <select
                value={outputType}
                onChange={(event) => setOutputType(event.target.value)}
                className="rounded-md border border-black/10 bg-white px-3 py-2"
              >
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPEG</option>
              </select>
            </label>

            {file && (
              <div className="mt-5 grid gap-2 rounded-md border border-black/10 bg-black/[0.015] p-4 text-sm font-semibold text-black/65">
                <span>{text.image.original}: {originalDimensions?.width || 0} x {originalDimensions?.height || 0}px</span>
                <span>{tLiteral('Original file')}: {formatFileSize(file.size)}</span>
                <span>{tLiteral('Output')}: {result?.width || 0} x {result?.height || 0}px</span>
                <span>{tLiteral('Output file')}: {formatFileSize(result?.blob?.size || 0)}</span>
              </div>
            )}

            <button
              type="button"
              onClick={processImage}
              disabled={!file || isProcessing}
              className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-black px-5 py-3 text-sm font-bold text-white hover:bg-black/85 disabled:cursor-not-allowed disabled:bg-black/25"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin text-green-400" /> : <Wand2 className="h-4 w-4 text-green-400" />}
              {tLiteral('Process image')}
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
        <ToolSeoSections seo={seo} />
      </div>
    </section>
  );
}

function PreviewCard({ title, url, size, dimensions }) {
  const { text } = useLanguage();

  return (
    <div className="rounded-md border border-black/10 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-black uppercase tracking-wide text-black/50">{title}</h2>
        <span className="text-xs font-bold text-black/50">{formatFileSize(size || 0)}</span>
      </div>
      <div className="mt-3 flex min-h-72 items-center justify-center rounded-md border border-dashed border-black/15 bg-black/[0.015] p-3">
        {url ? <img src={url} alt={`${title} preview`} title={`${title} preview`} loading="lazy" decoding="async" className="max-h-[420px] max-w-full rounded-md object-contain" /> : <p className="text-center text-sm font-semibold text-black/45">{text.image.previewHint}</p>}
      </div>
      {dimensions?.width && dimensions?.height && (
        <p className="mt-3 text-sm font-bold text-black/55">{dimensions.width} x {dimensions.height}px</p>
      )}
    </div>
  );
}
