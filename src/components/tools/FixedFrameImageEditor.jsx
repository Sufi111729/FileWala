import {
  Download,
  Loader2,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  Undo2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  downloadBlob,
  exportFixedFrameImage,
  formatFileSize,
  loadImage,
} from '../../utils/documentImageUtils.js';
import { useLanguage } from '../../i18n.jsx';

const editorHeight = 400;

function getFrameSize(stageWidth, stageHeight, aspect) {
  const maxWidth = stageWidth * 0.58;
  const maxHeight = stageHeight * 0.72;
  let width = maxWidth;
  let height = width / aspect;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspect;
  }

  return { width, height };
}

function getBaseImageSize(image, frameWidth, frameHeight) {
  const naturalWidth = image?.naturalWidth || image?.width || 1;
  const naturalHeight = image?.naturalHeight || image?.height || 1;
  const scale = Math.max(frameWidth / naturalWidth, frameHeight / naturalHeight);

  return {
    width: naturalWidth * scale,
    height: naturalHeight * scale,
  };
}

export default function FixedFrameImageEditor({
  imageFile,
  file,
  imageUrl,
  title,
  requirementsTitle,
  requirements = [],
  output,
  frameRatio,
  cropAspect = 1,
  outputWidth,
  outputHeight,
  targetKB,
  filename,
  backgroundColor = '#ffffff',
  toolType,
}) {
  const { text } = useLanguage();
  const stageRef = useRef(null);
  const dragRef = useRef(null);
  const [image, setImage] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 760, height: editorHeight });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [result, setResult] = useState(null);
  const [resultUrl, setResultUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const activeFile = imageFile || file;
  const activeFilename = filename || output?.filename || 'processed-image.jpg';
  const activeFrameRatio = frameRatio || cropAspect;
  const previewImageUrl = imageUrl || localImageUrl;

  const frameSize = useMemo(
    () => getFrameSize(stageSize.width, stageSize.height, activeFrameRatio),
    [activeFrameRatio, stageSize],
  );

  const baseImageSize = useMemo(
    () => getBaseImageSize(image, frameSize.width, frameSize.height),
    [frameSize.height, frameSize.width, image],
  );

  const outputMeta = useMemo(() => {
    const size = result?.blob ? ` • ${formatFileSize(result.blob.size)}` : '';
    return `${outputWidth} × ${outputHeight}px${size}`;
  }, [outputHeight, outputWidth, result]);

  const canDownload = Boolean(result?.blob);

  useEffect(() => {
    const measureStage = () => {
      const rect = stageRef.current?.getBoundingClientRect();
      if (rect?.width) setStageSize({ width: rect.width, height: rect.height || editorHeight });
    };

    measureStage();
    window.addEventListener('resize', measureStage, { passive: true });
    return () => window.removeEventListener('resize', measureStage);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let objectUrl = '';
    setImage(null);
    setResult(null);
    setResultUrl('');
    setImagePosition({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setError('');
    setStatus('');

    if (!imageUrl && activeFile) {
      objectUrl = URL.createObjectURL(activeFile);
      setLocalImageUrl(objectUrl);
    } else {
      setLocalImageUrl('');
    }

    loadImage(activeFile)
      .then((loadedImage) => {
        if (isMounted) setImage(loadedImage);
      })
      .catch((caughtError) => {
        if (isMounted) setError(caughtError.message || text.documentTool.imageLoadFailed);
      });

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [activeFile, imageUrl, text.documentTool.imageLoadFailed]);

  useEffect(() => () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const handleStageWheel = (event) => {
      event.preventDefault();
      const direction = event.deltaY > 0 ? -0.05 : 0.05;
      setZoom((value) => Math.max(0.5, Math.min(4, Number((value + direction).toFixed(2)))));
    };

    stage.addEventListener('wheel', handleStageWheel, { passive: false });

    return () => {
      stage.removeEventListener('wheel', handleStageWheel);
    };
  }, []);

  const resetPosition = () => {
    setImagePosition({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const beginPan = (event) => {
    if (!image) return;
    event.preventDefault();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: imagePosition.x,
      originY: imagePosition.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePan = (event) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    const nextX = dragRef.current.originX + event.clientX - dragRef.current.startX;
    const nextY = dragRef.current.originY + event.clientY - dragRef.current.startY;
    setImagePosition({ x: nextX, y: nextY });
  };

  const endPan = (event) => {
    dragRef.current = null;
    try {
      event.currentTarget?.releasePointerCapture(event.pointerId);
    } catch {
      // Browser may release pointer capture before this handler runs.
    }
  };

  const processImage = async () => {
    setStatus('processing');
    setError('');

    try {
      const processed = await exportFixedFrameImage({
        image,
        imagePositionX: imagePosition.x,
        imagePositionY: imagePosition.y,
        zoom,
        rotation,
        brightness,
        contrast,
        frameWidth: frameSize.width,
        frameHeight: frameSize.height,
        imageBaseWidth: baseImageSize.width,
        imageBaseHeight: baseImageSize.height,
        outputWidth,
        outputHeight,
        targetKB,
        filename: activeFilename,
        backgroundColor,
        toolType,
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
              {text.documentTool.fixedEditorHint}
            </p>
          </div>
          <span className="w-fit rounded-md bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
            {outputMeta}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-center rounded-md border border-black/10 bg-black/[0.025] p-3">
          <div
            ref={stageRef}
            role="presentation"
            onPointerDown={beginPan}
            onPointerMove={handlePan}
            onPointerUp={endPan}
            onPointerCancel={endPan}
            className="relative h-[320px] w-full max-w-[680px] cursor-grab touch-none select-none overflow-hidden rounded-md bg-white active:cursor-grabbing sm:h-[380px]"
          >
            {image && (
              <img
                src={previewImageUrl}
                alt="Editor preview"
                title="Image editor preview"
                loading="lazy"
                decoding="async"
                draggable="false"
                className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                style={{
                  width: `${baseImageSize.width}px`,
                  height: `${baseImageSize.height}px`,
                  transform: `translate(-50%, -50%) translate(${imagePosition.x}px, ${imagePosition.y}px) rotate(${rotation}deg) scale(${zoom})`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                }}
              />
            )}

            <div
              className="pointer-events-none absolute left-1/2 top-1/2 border-2 border-blue-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.52)]"
              style={{
                width: `${frameSize.width}px`,
                height: `${frameSize.height}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/50" />
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/50" />
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

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRotation((value) => value - 90)}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-black/10 px-3 py-2 text-sm font-bold text-black/70 hover:bg-black/[0.025]"
            >
              <Undo2 className="h-4 w-4" />
              {text.documentTool.rotateLeft}
            </button>
            <button
              type="button"
              onClick={() => setRotation((value) => value + 90)}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-black/10 px-3 py-2 text-sm font-bold text-black/70 hover:bg-black/[0.025]"
            >
              <RotateCw className="h-4 w-4" />
              {text.documentTool.rotateRight}
            </button>
          </div>

          <RangeControl label={text.documentTool.zoom} min="0.5" max="4" step="0.05" value={zoom} onChange={setZoom} />
          <RangeControl label={text.documentTool.brightness} min="70" max="140" step="1" value={brightness} onChange={setBrightness} suffix="%" />
          <RangeControl label={text.documentTool.contrast} min="70" max="160" step="1" value={contrast} onChange={setContrast} suffix="%" />

          <button
            type="button"
            onClick={resetPosition}
            className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-black/10 px-4 py-2.5 text-sm font-bold text-black/70 hover:bg-black/[0.025]"
          >
            <RotateCcw className="h-4 w-4" />
            {text.documentTool.resetPosition}
          </button>

          <button
            type="button"
            onClick={processImage}
            disabled={!image || status === 'processing'}
            className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {status === 'processing' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {text.common.preview}
          </button>
        </div>

        <div className="rounded-md border border-black/10 bg-blue-50/50 p-4">
          <h2 className="text-lg font-black text-black">{requirementsTitle}</h2>
          <div className="mt-3 grid gap-2">
            {requirements.map((item) => (
              <div key={item} className="rounded-md border border-black/10 bg-white px-3 py-2.5 text-sm font-bold leading-6 text-black/70">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-black/10 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wide text-black/55">{text.common.preview}</h2>
          <div className="mt-3 flex min-h-36 items-center justify-center rounded-md border border-dashed border-black/10 bg-black/[0.015] p-3">
            {resultUrl ? (
              <img src={resultUrl} alt="Processed preview" title="Processed image preview" loading="lazy" decoding="async" className="max-h-48 max-w-full rounded-md object-contain" />
            ) : (
              <p className="text-center text-sm font-semibold text-black/55">{text.documentTool.finalPreviewHint}</p>
            )}
          </div>
          <button
            type="button"
            disabled={!canDownload}
            onClick={() => downloadBlob(result.blob, activeFilename)}
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
