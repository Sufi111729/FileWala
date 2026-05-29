import { Download, Loader2, RotateCcw, RotateCw, SlidersHorizontal, Undo2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  cropAndProcessImage,
  downloadBlob,
  formatFileSize,
  loadImage,
} from '../../utils/documentImageUtils.js';
import { useLanguage } from '../../i18n.jsx';

function getInitialCrop(aspect) {
  const width = aspect >= 1 ? 72 : 44;
  const height = width / aspect;
  if (height <= 72) return { x: (100 - width) / 2, y: (100 - height) / 2, width, height };
  const finalHeight = 72;
  const finalWidth = finalHeight * aspect;
  return { x: (100 - finalWidth) / 2, y: 14, width: finalWidth, height: finalHeight };
}

function clampCrop(crop, aspect) {
  const minWidth = 14;
  const width = Math.max(minWidth, Math.min(crop.width, 96));
  const height = width / aspect;
  const finalHeight = Math.min(height, 96);
  const finalWidth = finalHeight * aspect;
  return {
    x: Math.max(0, Math.min(crop.x, 100 - finalWidth)),
    y: Math.max(0, Math.min(crop.y, 100 - finalHeight)),
    width: finalWidth,
    height: finalHeight,
  };
}

export default function ImageEditor({
  file,
  imageUrl,
  title,
  output,
  cropAspect = 1,
  outputWidth,
  outputHeight,
  targetKB,
  showMakeWhite = false,
  showScannerFilters = false,
}) {
  const { text } = useLanguage();
  const imageRef = useRef(null);
  const actionRef = useRef(null);
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState(() => getInitialCrop(cropAspect));
  const [rotate, setRotate] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [scannerFilter, setScannerFilter] = useState('original');
  const [makeWhiteBackground, setMakeWhiteBackground] = useState(false);
  const [result, setResult] = useState(null);
  const [resultUrl, setResultUrl] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const canDownload = Boolean(result?.blob);

  useEffect(() => {
    let isMounted = true;
    setImage(null);
    setResult(null);
    setResultUrl('');
    setCrop(getInitialCrop(cropAspect));

    loadImage(file)
      .then((loadedImage) => {
        if (isMounted) setImage(loadedImage);
      })
      .catch((caughtError) => {
        if (isMounted) setError(caughtError.message || text.documentTool.imageLoadFailed);
      });

    return () => {
      isMounted = false;
    };
  }, [file, cropAspect]);

  useEffect(() => () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  const outputMeta = useMemo(() => {
    if (!result?.blob) return `${outputWidth} × ${outputHeight}px`;
    return `${outputWidth} × ${outputHeight}px • ${formatFileSize(result.blob.size)}`;
  }, [outputHeight, outputWidth, result]);

  const pointerToPercent = (event) => {
    const rect = imageRef.current.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    };
  };

  const beginMove = (event) => {
    event.preventDefault();
    const start = pointerToPercent(event);
    const origin = crop;
    actionRef.current = { type: 'move', start, origin };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const beginResize = (event) => {
    event.stopPropagation();
    event.preventDefault();
    const start = pointerToPercent(event);
    const origin = crop;
    actionRef.current = { type: 'resize', start, origin };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!actionRef.current) return;
    const point = pointerToPercent(event);
    const { type, start, origin } = actionRef.current;

    if (type === 'move') {
      setCrop(clampCrop({ ...origin, x: origin.x + point.x - start.x, y: origin.y + point.y - start.y }, cropAspect));
      return;
    }

    const nextWidth = origin.width + point.x - start.x;
    setCrop(clampCrop({ ...origin, width: nextWidth }, cropAspect));
  };

  const endPointer = (event) => {
    actionRef.current = null;
    try {
      event.currentTarget?.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released by the browser.
    }
  };

  const resetFilters = () => {
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setScannerFilter('original');
    setMakeWhiteBackground(false);
  };

  const processImage = async () => {
    setStatus('processing');
    setError('');

    try {
      const processed = await cropAndProcessImage({
        image,
        crop,
        outputWidth,
        outputHeight,
        rotate,
        zoom,
        brightness,
        contrast,
        scannerFilter,
        targetKB,
        makeWhiteBackground,
      });

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResult(processed);
      setResultUrl(URL.createObjectURL(processed.blob));
      setStatus(text.documentTool.previewReady);
    } catch (caughtError) {
      setError(caughtError.message || text.documentTool.processingFailed);
      setStatus('');
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="rounded-md border border-black/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-black">{title} {text.documentTool.editorSuffix}</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-black/55">
              {text.documentTool.cropEditorHint}
            </p>
          </div>
          <span className="w-fit rounded-md bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">{outputMeta}</span>
        </div>

        <div className="mt-4 flex min-h-[280px] items-center justify-center rounded-md border border-black/10 bg-black/[0.025] p-3 sm:min-h-[360px]">
          <div className="relative inline-block max-h-[460px] max-w-full select-none overflow-hidden rounded-md bg-white shadow-sm">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Editor preview"
              onPointerMove={handlePointerMove}
              onPointerUp={endPointer}
              onPointerCancel={endPointer}
              className="block max-h-[460px] max-w-full touch-none object-contain"
              style={{ transform: `rotate(${rotate}deg) scale(${zoom})`, filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
              draggable="false"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/42" />
            <div
              role="presentation"
              onPointerDown={beginMove}
              onPointerMove={handlePointerMove}
              onPointerUp={endPointer}
              onPointerCancel={endPointer}
              className="absolute cursor-move border-2 border-blue-500 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.42)]"
              style={{ left: `${crop.x}%`, top: `${crop.y}%`, width: `${crop.width}%`, height: `${crop.height}%` }}
            >
              <span className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 bg-white/45" />
              <span className="absolute left-1/2 top-1/2 h-full w-px -translate-y-1/2 bg-white/45" />
              <button
                type="button"
                aria-label="Resize crop"
                onPointerDown={beginResize}
                className="absolute -bottom-2.5 -right-2.5 h-5 w-5 rounded-full border-2 border-white bg-blue-700 shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <aside className="grid content-start gap-4">
        <div className="rounded-md border border-black/10 bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-black/55">
            <SlidersHorizontal className="h-4 w-4 text-blue-700" />
            {text.documentTool.controls}
          </h2>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button type="button" onClick={() => setRotate((value) => value - 90)} className="focus-ring rounded-md border border-black/10 px-3 py-2 text-sm font-bold text-black/70 hover:bg-black/[0.025]">
              <Undo2 className="mx-auto h-4 w-4" />
            </button>
            <button type="button" onClick={() => setRotate(0)} className="focus-ring rounded-md border border-black/10 px-3 py-2 text-sm font-bold text-black/70 hover:bg-black/[0.025]">
              <RotateCcw className="mx-auto h-4 w-4" />
            </button>
            <button type="button" onClick={() => setRotate((value) => value + 90)} className="focus-ring rounded-md border border-black/10 px-3 py-2 text-sm font-bold text-black/70 hover:bg-black/[0.025]">
              <RotateCw className="mx-auto h-4 w-4" />
            </button>
          </div>

          <RangeControl label={text.documentTool.zoom} min="1" max="2.5" step="0.05" value={zoom} onChange={setZoom} />
          <RangeControl label={text.documentTool.brightness} min="70" max="140" step="1" value={brightness} onChange={setBrightness} suffix="%" />
          <RangeControl label={text.documentTool.contrast} min="70" max="160" step="1" value={contrast} onChange={setContrast} suffix="%" />

          {showScannerFilters && (
            <label className="mt-4 grid gap-2 text-sm font-bold text-black/70">
              {text.documentTool.scannerFilter}
              <select
                value={scannerFilter}
                onChange={(event) => setScannerFilter(event.target.value)}
                className="focus-ring rounded-md border border-black/10 px-3 py-2.5 text-sm font-semibold text-black"
              >
                <option value="original">{text.documentTool.original}</option>
                <option value="grayscale">{text.documentTool.grayscale}</option>
                <option value="black-white">{text.documentTool.blackWhite}</option>
                <option value="enhanced">{text.documentTool.enhanced}</option>
              </select>
            </label>
          )}

          {showMakeWhite && (
            <label className="mt-4 flex items-center gap-3 rounded-md border border-black/10 px-3 py-3 text-sm font-bold text-black/70">
              <input
                type="checkbox"
                checked={makeWhiteBackground}
                onChange={(event) => setMakeWhiteBackground(event.target.checked)}
                className="h-4 w-4 accent-blue-700"
              />
              {text.documentTool.makeBackgroundWhite}
            </label>
          )}

          <button type="button" onClick={resetFilters} className="focus-ring mt-4 w-full rounded-md border border-black/10 px-4 py-2.5 text-sm font-bold text-black/70 hover:bg-black/[0.025]">
            {text.documentTool.resetFilter}
          </button>

          <button
            type="button"
            onClick={processImage}
            disabled={!image || status === 'processing'}
            className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {status === 'processing' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {text.upload.process}
          </button>
        </div>

        <div className="rounded-md border border-black/10 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wide text-black/55">{text.common.preview}</h2>
          <div className="mt-3 flex min-h-36 items-center justify-center rounded-md border border-dashed border-black/10 bg-black/[0.015] p-3">
            {resultUrl ? (
              <img src={resultUrl} alt="Processed preview" className="max-h-48 max-w-full rounded-md object-contain" />
            ) : (
              <p className="text-center text-sm font-semibold text-black/55">{text.documentTool.processedPreviewHint}</p>
            )}
          </div>
          <button
            type="button"
            disabled={!canDownload}
            onClick={() => downloadBlob(result.blob, output.filename)}
            className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            <Download className="h-4 w-4" />
            {text.common.download}
          </button>
          {error && <p className="mt-3 text-sm font-bold text-red-700">{error}</p>}
          {status && status !== 'processing' && <p className="mt-3 text-sm font-bold text-green-700">{status}</p>}
        </div>
      </aside>
    </div>
  );
}

function RangeControl({ label, value, onChange, min, max, step, suffix = '' }) {
  return (
    <label className="mt-4 grid gap-2 text-sm font-bold text-black/70">
      <span className="flex items-center justify-between">
        {label}
        <span className="text-black/55">{value}{suffix}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-blue-700"
      />
    </label>
  );
}
