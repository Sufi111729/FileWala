import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Grid3X3,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import SeoHelmet from '../components/seo/SeoHelmet.jsx';
import ToolSeoSections from '../components/seo/ToolSeoSections.jsx';
import { toolSchemas } from '../components/seo/schema.js';
import UploadBox from '../components/UploadBox.jsx';
import { StickyActionBar } from '../components/tools/ToolWorkflow.jsx';
import { absoluteUrl } from '../data/siteMetadata.js';
import { getToolSeoBySlug } from '../data/toolsSeoData.js';
import { cropImageToBlob, formatFileSize, getImageDimensions, getSafeOutputDimensions, isSupportedImage } from '../utils/imageCropUtils.js';

const MAX_BATCH_FILES = 20;
const MAX_BATCH_BYTES = 150 * 1024 * 1024;
const MOBILE_SAFE_OUTPUT_LIMITS = { maxDimension: 4096, maxPixels: 16_000_000 };

const aspectOptions = [
  { id: 'free', label: 'Free Crop', value: null },
  { id: '1-1', label: '1:1', value: 1 },
  { id: '4-3', label: '4:3', value: 4 / 3 },
  { id: '3-2', label: '3:2', value: 3 / 2 },
  { id: '16-9', label: '16:9', value: 16 / 9 },
  { id: '9-16', label: '9:16', value: 9 / 16 },
  { id: '2-1', label: '2:1', value: 2 },
  { id: '21-9', label: '21:9', value: 21 / 9 },
  { id: 'custom', label: 'Custom Ratio', value: 'custom' },
];

const cropperTool = {
  title: 'Batch Image Cropper',
  slug: 'batch-image-cropper',
  description: 'Crop multiple areas from one image or sheet.',
};
const cropperSeo = getToolSeoBySlug('batch-image-cropper');

function dimensionsText(width, height) {
  return `${Math.round(width)} x ${Math.round(height)}px`;
}

function imageId(file) {
  return `${file.name}-${file.lastModified}-${file.size}`;
}

function createImageItem(file, dimensions) {
  return {
    id: imageId(file),
    file,
    url: URL.createObjectURL(file),
    width: dimensions.width,
    height: dimensions.height,
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeBox(box) {
  const width = clamp(box.widthPercent, 2, 100);
  const height = clamp(box.heightPercent, 2, 100);
  return {
    ...box,
    xPercent: clamp(box.xPercent, 0, 100 - width),
    yPercent: clamp(box.yPercent, 0, 100 - height),
    widthPercent: width,
    heightPercent: height,
  };
}

function applyAspect(box, aspectRatio, imageWidth, imageHeight) {
  if (!aspectRatio) return normalizeBox({ ...box, aspectRatio: null });
  const pixelWidth = (box.widthPercent / 100) * imageWidth;
  const pixelHeight = pixelWidth / aspectRatio;
  const heightPercent = (pixelHeight / imageHeight) * 100;
  return normalizeBox({ ...box, heightPercent, aspectRatio });
}

function cropAreaFromBox(box, image) {
  return {
    x: (box.xPercent * image.width) / 100,
    y: (box.yPercent * image.height) / 100,
    width: (box.widthPercent * image.width) / 100,
    height: (box.heightPercent * image.height) / 100,
  };
}

function outputFileName(originalName, index, imageIndex = null) {
  const baseName = (originalName || 'image').replace(/\.[^.]+$/, '');
  const imagePart = imageIndex === null ? '' : `-image-${imageIndex + 1}`;
  return `${baseName}${imagePart}-crop-${index + 1}.png`;
}

export default function BatchImageCropper() {
  const [images, setImages] = useState([]);
  const [activeImageId, setActiveImageId] = useState('');
  const [selectionsByImage, setSelectionsByImage] = useState({});
  const [activeSelectionId, setActiveSelectionId] = useState('');
  const [aspectId, setAspectId] = useState('free');
  const [customRatio, setCustomRatio] = useState({ width: 16, height: 10 });
  const [applyRatioToAll, setApplyRatioToAll] = useState(false);
  const [gridConfig, setGridConfig] = useState({ columns: 2, rows: 5, gap: 0, padding: 0 });
  const [results, setResults] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const imageWrapRef = useRef(null);
  const batchInputRef = useRef(null);
  const dragRef = useRef(null);
  const imagesRef = useRef([]);
  const resultsRef = useRef([]);
  const openedUrlsRef = useRef([]);

  const activeImage = images.find((image) => image.id === activeImageId) || images[0];
  const selections = activeImage ? selectionsByImage[activeImage.id] ?? [] : [];
  const activeSelection = selections.find((selection) => selection.id === activeSelectionId) || selections[0];
  const selectedAspect = aspectOptions.find((option) => option.id === aspectId);
  const aspectRatio = useMemo(() => {
    if (selectedAspect?.value === 'custom') {
      const width = Number(customRatio.width);
      const height = Number(customRatio.height);
      return width > 0 && height > 0 ? width / height : null;
    }
    return selectedAspect?.value ?? null;
  }, [customRatio.height, customRatio.width, selectedAspect]);
  const activeLightboxResult = lightboxIndex === null ? null : results[lightboxIndex];
  const progressPercent = progress.total ? Math.round((progress.current / progress.total) * 100) : 0;

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => () => {
    imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    resultsRef.current.forEach((result) => URL.revokeObjectURL(result.url));
    openedUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const clearResults = () => {
    results.forEach((result) => URL.revokeObjectURL(result.url));
    setResults([]);
    setLightboxIndex(null);
    setLightboxZoom(1);
  };

  const updateSelections = (updater) => {
    if (!activeImage) return;
    setSelectionsByImage((current) => ({
      ...current,
      [activeImage.id]: updater(current[activeImage.id] ?? []),
    }));
  };

  const makeSelection = (index = selections.length) => {
    const base = {
      id: `crop-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: `Crop ${index + 1}`,
      xPercent: 8 + (index % 5) * 4,
      yPercent: 8 + (index % 5) * 4,
      widthPercent: 28,
      heightPercent: 22,
      aspectRatio,
    };
    return activeImage ? applyAspect(base, aspectRatio, activeImage.width, activeImage.height) : base;
  };

  const handleFilesSelected = async (files) => {
    setError('');
    clearResults();
    const invalidFiles = files.filter((file) => !isSupportedImage(file));
    if (invalidFiles.length) {
      setError('Please upload only JPG, JPEG, PNG, or WEBP images.');
      return;
    }
    if (files.length > MAX_BATCH_FILES) {
      setError(`Please upload no more than ${MAX_BATCH_FILES} images at once.`);
      return;
    }
    if (files.reduce((total, file) => total + file.size, 0) > MAX_BATCH_BYTES) {
      setError('The selected images exceed the 150 MB batch limit. Please use a smaller batch.');
      return;
    }

    setIsPreparing(true);
    const nextImages = [];
    try {
      for (const file of files) {
        nextImages.push(createImageItem(file, await getImageDimensions(file)));
        await new Promise((resolve) => window.setTimeout(resolve, 0));
      }
      images.forEach((image) => URL.revokeObjectURL(image.url));
      setImages(nextImages);
      setActiveImageId(nextImages[0]?.id ?? '');
      setSelectionsByImage({});
      setActiveSelectionId('');
    } catch (caughtError) {
      nextImages.forEach((image) => URL.revokeObjectURL(image.url));
      setError(caughtError.message);
    } finally {
      setIsPreparing(false);
    }
  };

  const addSelection = () => {
    if (!activeImage) return;
    const nextSelection = makeSelection();
    updateSelections((current) => [...current, nextSelection]);
    setActiveSelectionId(nextSelection.id);
  };

  const duplicateSelection = (sourceSelection = activeSelection) => {
    if (!sourceSelection) return;
    const duplicate = normalizeBox({
      ...sourceSelection,
      id: `crop-${Date.now()}`,
      name: `Crop ${selections.length + 1}`,
      xPercent: sourceSelection.xPercent + 3,
      yPercent: sourceSelection.yPercent + 3,
    });
    updateSelections((current) => [...current, duplicate]);
    setActiveSelectionId(duplicate.id);
  };

  const deleteSelection = () => {
    if (!activeSelection) return;
    updateSelections((current) => current.filter((selection) => selection.id !== activeSelection.id));
    setActiveSelectionId('');
  };

  const clearSelections = () => {
    updateSelections(() => []);
    setActiveSelectionId('');
  };

  const updateActiveSelection = (patch) => {
    if (!activeSelection) return;
    updateSelections((current) =>
      current.map((selection) =>
        selection.id === activeSelection.id ? normalizeBox({ ...selection, ...patch }) : selection,
      ),
    );
  };

  const applyAspectToSelections = (nextAspect = aspectRatio) => {
    if (!activeImage) return;
    updateSelections((current) => current.map((selection) => applyAspect(selection, nextAspect, activeImage.width, activeImage.height)));
  };

  const handleAspectChange = (nextAspectId) => {
    setAspectId(nextAspectId);
    const option = aspectOptions.find((item) => item.id === nextAspectId);
    const nextAspect = option?.value === 'custom'
      ? Number(customRatio.width) / Number(customRatio.height)
      : option?.value ?? null;

    if (applyRatioToAll) {
      applyAspectToSelections(nextAspect);
    } else if (activeSelection && activeImage) {
      updateSelections((current) =>
        current.map((selection) =>
          selection.id === activeSelection.id ? applyAspect(selection, nextAspect, activeImage.width, activeImage.height) : selection,
        ),
      );
    }
  };

  const createGridSelections = () => {
    if (!activeImage) return;
    const columns = Math.max(1, Number(gridConfig.columns) || 1);
    const rows = Math.max(1, Number(gridConfig.rows) || 1);
    const gap = Math.max(0, Number(gridConfig.gap) || 0);
    const padding = Math.max(0, Number(gridConfig.padding) || 0);
    const usableWidth = Math.max(1, 100 - padding * 2 - gap * (columns - 1));
    const usableHeight = Math.max(1, 100 - padding * 2 - gap * (rows - 1));
    const cellWidth = usableWidth / columns;
    const cellHeight = usableHeight / rows;
    const nextSelections = [];

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const index = row * columns + column;
        nextSelections.push(normalizeBox({
          id: `grid-${Date.now()}-${index}`,
          name: `Crop ${index + 1}`,
          xPercent: padding + column * (cellWidth + gap),
          yPercent: padding + row * (cellHeight + gap),
          widthPercent: cellWidth,
          heightPercent: cellHeight,
          aspectRatio: null,
        }));
      }
    }

    setSelectionsByImage((current) => ({ ...current, [activeImage.id]: nextSelections }));
    setActiveSelectionId(nextSelections[0]?.id ?? '');
  };

  const pointerPercent = (event) => {
    const rect = imageWrapRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100),
    };
  };

  const startPointerAction = (event, selection, action) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveSelectionId(selection.id);
    dragRef.current = {
      action,
      start: pointerPercent(event),
      box: selection,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current || !activeImage) return;
    const point = pointerPercent(event);
    const { action, start, box } = dragRef.current;
    const dx = point.x - start.x;
    const dy = point.y - start.y;
    let nextBox = { ...box };

    if (action === 'move') {
      nextBox.xPercent = box.xPercent + dx;
      nextBox.yPercent = box.yPercent + dy;
    } else {
      const leftResize = action.includes('w');
      const topResize = action.includes('n');
      if (leftResize) {
        nextBox.xPercent = box.xPercent + dx;
        nextBox.widthPercent = box.widthPercent - dx;
      } else {
        nextBox.widthPercent = box.widthPercent + dx;
      }
      if (topResize) {
        nextBox.yPercent = box.yPercent + dy;
        nextBox.heightPercent = box.heightPercent - dy;
      } else {
        nextBox.heightPercent = box.heightPercent + dy;
      }

      if (aspectRatio) {
        const pixelWidth = (nextBox.widthPercent / 100) * activeImage.width;
        nextBox.heightPercent = ((pixelWidth / aspectRatio) / activeImage.height) * 100;
      }
    }

    nextBox = normalizeBox(nextBox);
    updateSelections((current) => current.map((selection) => (selection.id === box.id ? nextBox : selection)));
  };

  const stopPointerAction = () => {
    dragRef.current = null;
  };

  const cropAllSelections = async () => {
    const exportQueue = images.flatMap((image, imageIndex) =>
      (selectionsByImage[image.id] ?? []).map((selection, selectionIndex) => ({ image, imageIndex, selection, selectionIndex })),
    );
    if (!exportQueue.length || isExporting) return;
    setError('');
    clearResults();
    setIsExporting(true);
    setProgress({ current: 0, total: exportQueue.length });

    try {
      const nextResults = [];
      for (let index = 0; index < exportQueue.length; index += 1) {
        const { image, imageIndex, selection, selectionIndex } = exportQueue[index];
        const cropArea = cropAreaFromBox(selection, image);
        const outputSize = getSafeOutputDimensions(cropArea.width, cropArea.height, MOBILE_SAFE_OUTPUT_LIMITS);
        const blob = await cropImageToBlob(image.file, cropArea, 'png', 1, MOBILE_SAFE_OUTPUT_LIMITS);
        nextResults.push({
          id: `${image.id}-${selection.id}`,
          cropName: selection.name,
          fileName: outputFileName(image.file.name, selectionIndex, images.length > 1 ? imageIndex : null),
          dimensions: dimensionsText(outputSize.width, outputSize.height),
          size: blob.size,
          blob,
          url: URL.createObjectURL(blob),
        });
        setProgress({ current: index + 1, total: exportQueue.length });
        await new Promise((resolve) => window.setTimeout(resolve, 0));
      }
      setResults(nextResults);
    } catch (caughtError) {
      setError(caughtError.message || 'Could not export crop selections.');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadAllAsZip = async () => {
    if (!results.length) return;
    setIsExporting(true);
    try {
      const [zipModule, fileSaverModule] = await Promise.all([import('jszip'), import('file-saver')]);
      const JSZip = zipModule.default;
      const saveAs = fileSaverModule.saveAs ?? fileSaverModule.default?.saveAs ?? fileSaverModule.default;
      const zip = new JSZip();
      results.forEach((result) => zip.file(result.fileName, result.blob));
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'filewalatool-batch-cropped-images.zip');
    } catch (caughtError) {
      setError(caughtError.message || 'Could not create the ZIP download.');
    } finally {
      setIsExporting(false);
    }
  };

  const openInBrowser = (result) => {
    const blobUrl = URL.createObjectURL(result.blob);
    openedUrlsRef.current.push(blobUrl);
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
      openedUrlsRef.current = openedUrlsRef.current.filter((url) => url !== blobUrl);
    }, 60_000);
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxZoom(1);
  };

  const showPreviousResult = () => {
    setLightboxIndex((index) => (index === null ? null : (index - 1 + results.length) % results.length));
    setLightboxZoom(1);
  };

  const showNextResult = () => {
    setLightboxIndex((index) => (index === null ? null : (index + 1) % results.length));
    setLightboxZoom(1);
  };

  return (
    <section className="bg-zinc-50 py-6 sm:py-8">
      <SeoHelmet
        title={cropperSeo.seoTitle}
        description={cropperSeo.metaDescription}
        canonical={absoluteUrl('/batch-image-cropper')}
        keywords={[cropperSeo.primaryKeyword, ...cropperSeo.secondaryKeywords, ...cropperSeo.longTailKeywords]}
        image={cropperSeo.imageUrl}
        imageAlt={cropperSeo.imageAlt}
        ogDescription={cropperSeo.ogDescription}
        twitterDescription={cropperSeo.twitterDescription}
        jsonLd={toolSchemas(cropperSeo)}
      />

      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-0">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-wide text-brand-red">Image Tools / Editor</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-black sm:text-4xl">{cropperSeo.h1}</h1>
          <p className="mt-4 text-base leading-7 text-black/60">
            Batch crop multiple images, preview every result, and download individual crops or one ZIP file.
          </p>
        </div>

        <div className="mt-8 grid gap-6">
          <div className="rounded-lg border border-black/10 bg-white p-4 sm:p-5">
            <h2 className="text-lg font-black text-black">Step 1: Upload image sheet</h2>
            <p className="mt-1 text-sm text-black/55">Multiple uploads are allowed, but crop selections are created on the opened image.</p>
            <div className="mt-4">
              <UploadBox
                tool={cropperTool}
                uploadOnly
                onFilesSelected={handleFilesSelected}
                helperText="Select or drop up to 20 JPG, JPEG, PNG, or WEBP images."
              />
              <input
                ref={batchInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                multiple
                className="sr-only"
                onChange={(event) => {
                  handleFilesSelected(Array.from(event.target.files || []));
                  event.target.value = '';
                }}
              />
            </div>
            {isPreparing && (
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-black/60">
                <Loader2 className="h-4 w-4 animate-spin text-brand-red" />
                Preparing image previews...
              </p>
            )}
            {error && <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
          </div>

          {images.length > 0 && (
            <div className="rounded-lg border border-black/10 bg-white p-4 sm:p-5">
              <h2 className="text-lg font-black text-black">Opened image</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {images.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => {
                      setActiveImageId(image.id);
                      setActiveSelectionId((selectionsByImage[image.id] ?? [])[0]?.id ?? '');
                      clearResults();
                    }}
                    className={`rounded-md border p-2 text-left ${activeImage?.id === image.id ? 'border-brand-red bg-red-50' : 'border-black/10 bg-white'}`}
                  >
                    <img src={image.url} alt={image.file.name} title={image.file.name} loading="lazy" decoding="async" className="h-28 w-full rounded object-cover" />
                    <span className="mt-2 block truncate text-sm font-black text-black">{image.file.name}</span>
                    <span className="text-xs font-semibold text-black/50">{dimensionsText(image.width, image.height)}</span>
                    <span className="block text-xs font-semibold text-black/50">Original size: {formatFileSize(image.file.size)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeImage && (
            <>
              <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="rounded-lg border border-black/10 bg-white p-4 sm:p-5">
                  <h2 className="text-lg font-black text-black">Step 2: Aspect ratio</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {aspectOptions.map((option) => (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm font-bold ${
                          aspectId === option.id ? 'border-brand-red bg-red-50 text-black' : 'border-black/10 bg-white text-black/70'
                        }`}
                      >
                        <input
                          type="radio"
                          name="aspect-ratio"
                          checked={aspectId === option.id}
                          onChange={() => handleAspectChange(option.id)}
                          className="h-4 w-4 accent-black"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                  {aspectId === 'custom' && (
                    <div className="mt-4 grid gap-3 rounded-md border border-black/10 bg-zinc-50 p-4 sm:grid-cols-2">
                      <label className="text-sm font-bold text-black/70">
                        Width ratio
                        <input
                          type="number"
                          min="1"
                          value={customRatio.width}
                          onChange={(event) => setCustomRatio((ratio) => ({ ...ratio, width: event.target.value }))}
                          className="mt-2 w-full rounded-md border border-black/10 px-3 py-2 text-black outline-none focus:border-black"
                        />
                      </label>
                      <label className="text-sm font-bold text-black/70">
                        Height ratio
                        <input
                          type="number"
                          min="1"
                          value={customRatio.height}
                          onChange={(event) => setCustomRatio((ratio) => ({ ...ratio, height: event.target.value }))}
                          className="mt-2 w-full rounded-md border border-black/10 px-3 py-2 text-black outline-none focus:border-black"
                        />
                      </label>
                    </div>
                  )}
                  <label className="mt-4 flex items-center gap-3 text-sm font-bold text-black/70">
                    <input
                      type="checkbox"
                      checked={applyRatioToAll}
                      onChange={(event) => setApplyRatioToAll(event.target.checked)}
                      className="h-4 w-4 accent-brand-red"
                    />
                    Apply this ratio to all crop selections
                  </label>
                  <button
                    type="button"
                    onClick={() => applyAspectToSelections()}
                    className="mt-4 rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-black text-black hover:border-black"
                  >
                    Apply ratio now
                  </button>
                </div>

                <div className="rounded-lg border border-black/10 bg-white p-4 sm:p-5">
                  <h2 className="text-lg font-black text-black">Auto Create Grid Selections</h2>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {[
                      ['columns', 'Columns'],
                      ['rows', 'Rows'],
                      ['gap', 'Gap %'],
                      ['padding', 'Padding %'],
                    ].map(([key, label]) => (
                      <label key={key} className="text-sm font-bold text-black/70">
                        {label}
                        <input
                          type="number"
                          min="0"
                          value={gridConfig[key]}
                          onChange={(event) => setGridConfig((config) => ({ ...config, [key]: event.target.value }))}
                          className="mt-2 w-full rounded-md border border-black/10 px-3 py-2 text-black outline-none focus:border-black"
                        />
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={createGridSelections}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-3 text-sm font-black text-white hover:bg-black/85"
                  >
                    <Grid3X3 className="h-4 w-4 text-brand-red" />
                    Create {Math.max(1, Number(gridConfig.columns) || 1) * Math.max(1, Number(gridConfig.rows) || 1)} Crop Areas
                  </button>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                <div className="rounded-lg border border-black/10 bg-white p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-black text-black">Step 3: Multiple crop selections</h2>
                      <p className="mt-1 text-sm text-black/55">{selections.length} crop selection{selections.length === 1 ? '' : 's'} on this image.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={addSelection} className="inline-flex items-center gap-2 rounded-md bg-black px-3 py-2 text-sm font-black text-white hover:bg-black/85">
                        <Plus className="h-4 w-4 text-brand-red" />
                        Add Crop Selection
                      </button>
                      <button type="button" onClick={duplicateSelection} disabled={!activeSelection} className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-black text-black hover:border-black disabled:opacity-40">
                        <Copy className="h-4 w-4 text-brand-red" />
                        Duplicate Current Selection
                      </button>
                      <button type="button" onClick={deleteSelection} disabled={!activeSelection} className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-black text-black hover:border-black disabled:opacity-40">
                        <Trash2 className="h-4 w-4 text-brand-red" />
                        Delete Selected Selection
                      </button>
                      <button type="button" onClick={clearSelections} disabled={!selections.length} className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-black text-black hover:border-black disabled:opacity-40">
                        Reset Crop Selections
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 overflow-auto rounded-md border border-black/10 bg-zinc-100 p-3">
                    <div
                      ref={imageWrapRef}
                      className="relative mx-auto w-fit touch-none select-none"
                      onPointerMove={handlePointerMove}
                      onPointerUp={stopPointerAction}
                      onPointerCancel={stopPointerAction}
                    >
                      <img src={activeImage.url} alt={activeImage.file.name} title={activeImage.file.name} loading="lazy" decoding="async" className="max-h-[72vh] max-w-full rounded object-contain" draggable="false" />
                      {selections.map((selection, index) => {
                        const isActive = activeSelection?.id === selection.id;
                        return (
                          <div
                            key={selection.id}
                            role="button"
                            tabIndex={0}
                            onPointerDown={(event) => startPointerAction(event, selection, 'move')}
                            className={`absolute cursor-move border ${isActive ? 'border-4 border-brand-red' : 'border-2 border-red-300'} bg-red-500/5`}
                            style={{
                              left: `${selection.xPercent}%`,
                              top: `${selection.yPercent}%`,
                              width: `${selection.widthPercent}%`,
                              height: `${selection.heightPercent}%`,
                            }}
                          >
                            <span className="absolute left-0 top-0 rounded-br bg-brand-red px-2 py-1 text-[11px] font-black text-white">
                              {selection.name || `Crop ${index + 1}`}
                            </span>
                            {['nw', 'ne', 'sw', 'se'].map((handle) => (
                              <span
                                key={handle}
                                onPointerDown={(event) => startPointerAction(event, selection, handle)}
                                className={`absolute h-6 w-6 rounded-full border-2 border-white bg-brand-red sm:h-4 sm:w-4 ${
                                  handle.includes('n') ? '-top-3 sm:-top-2' : '-bottom-3 sm:-bottom-2'
                                } ${handle.includes('w') ? '-left-3 sm:-left-2' : '-right-3 sm:-right-2'}`}
                              />
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <aside className="rounded-lg border border-black/10 bg-white p-4 sm:p-5">
                  <h2 className="text-lg font-black text-black">Crop box list</h2>
                  <div className="mt-4 grid gap-3">
                    {selections.length === 0 && (
                      <p className="rounded-md border border-dashed border-black/20 p-4 text-sm font-semibold text-black/50">
                        Add manual selections or create a grid to begin.
                      </p>
                    )}
                    {selections.map((selection, index) => (
                      <div key={selection.id} className={`rounded-md border p-3 ${activeSelection?.id === selection.id ? 'border-brand-red bg-red-50' : 'border-black/10 bg-white'}`}>
                        <input
                          value={selection.name}
                          onChange={(event) => updateSelections((current) => current.map((item) => (item.id === selection.id ? { ...item, name: event.target.value } : item)))}
                          className="w-full rounded-md border border-black/10 px-3 py-2 text-sm font-black text-black outline-none focus:border-black"
                          aria-label={`Rename selection ${index + 1}`}
                        />
                        <p className="mt-2 text-xs font-semibold text-black/50">
                          {selection.widthPercent.toFixed(1)}% x {selection.heightPercent.toFixed(1)}%
                        </p>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <button type="button" onClick={() => setActiveSelectionId(selection.id)} className="rounded-md bg-black px-2 py-2 text-xs font-black text-white">Select</button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSelectionId(selection.id);
                              duplicateSelection(selection);
                            }}
                            className="rounded-md border border-black/10 bg-white px-2 py-2 text-xs font-black text-black hover:border-black"
                          >
                            Duplicate
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateSelections((current) => current.filter((item) => item.id !== selection.id));
                              if (activeSelectionId === selection.id) setActiveSelectionId('');
                            }}
                            className="rounded-md border border-black/10 bg-white px-2 py-2 text-xs font-black text-black hover:border-black"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>

              <div className="rounded-lg border border-black/10 bg-white p-4 sm:p-5">
                <h2 className="text-lg font-black text-black">Step 4: Export selections</h2>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={cropAllSelections}
                    disabled={!images.some((image) => (selectionsByImage[image.id] ?? []).length) || isExporting}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-black px-5 py-3 text-sm font-black text-white hover:bg-black/85 disabled:cursor-not-allowed disabled:bg-black/25"
                  >
                    {isExporting ? <Loader2 className="h-4 w-4 animate-spin text-brand-red" /> : <Plus className="h-4 w-4 text-brand-red" />}
                    {isExporting ? `Processing ${progress.current} / ${progress.total} crops...` : 'Crop All Images'}
                  </button>
                  <button
                    type="button"
                    onClick={downloadAllAsZip}
                    disabled={!results.length}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-5 py-3 text-sm font-black text-black hover:border-black disabled:opacity-40"
                  >
                    <Archive className="h-4 w-4 text-brand-red" />
                    Download all crops as ZIP
                  </button>
                </div>
                {isExporting && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-black uppercase tracking-wide text-black/50">
                      <span>Processing {progress.current} / {progress.total}</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-zinc-100">
                      <div className="h-full rounded-full bg-brand-red" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {results.length > 0 && (
            <div className="rounded-lg border border-black/10 bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-black text-black">Output preview</h2>
                  <p className="mt-1 text-sm text-black/55">{results.length} cropped image files created.</p>
                </div>
                <button type="button" onClick={downloadAllAsZip} className="inline-flex w-fit items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-black text-white hover:bg-black/85">
                  <Archive className="h-4 w-4 text-brand-red" />
                  Download all crops as ZIP
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((result, index) => (
                  <div key={result.id} className="rounded-md border border-black/10 bg-white p-3">
                    <button type="button" onClick={() => openLightbox(index)} className="block w-full">
                      <img src={result.url} alt={result.fileName} title={result.fileName} loading="lazy" decoding="async" className="h-44 w-full rounded-md border border-black/10 object-contain" />
                    </button>
                    <h3 className="mt-3 truncate text-sm font-black text-black">{result.cropName}</h3>
                    <p className="truncate text-sm text-black/60">{result.fileName}</p>
                    <p className="mt-1 text-sm text-black/60">Dimensions: {result.dimensions}</p>
                    <p className="text-sm text-black/60">File size: {formatFileSize(result.size)}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <button type="button" onClick={() => openLightbox(index)} className="rounded-md border border-black/10 bg-white px-3 py-2 text-xs font-black text-black hover:border-black">Preview</button>
                      <button type="button" onClick={() => openInBrowser(result)} className="rounded-md border border-black/10 bg-white px-3 py-2 text-xs font-black text-black hover:border-black">Open</button>
                      <a href={result.url} download={result.fileName} className="rounded-md bg-black px-3 py-2 text-center text-xs font-black text-white hover:bg-black/85">Download</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ToolSeoSections seo={cropperSeo} activeTab="Image Tools" />

      {activeLightboxResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white">
            <div className="flex flex-col gap-3 border-b border-black/10 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h2 className="truncate text-base font-black text-black">{activeLightboxResult.fileName}</h2>
                <p className="text-sm text-black/55">{lightboxIndex + 1} / {results.length} | {activeLightboxResult.dimensions}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={showPreviousResult} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/10 bg-white hover:border-black" aria-label="Previous image">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button type="button" onClick={showNextResult} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/10 bg-white hover:border-black" aria-label="Next image">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => setLightboxZoom((zoom) => Math.max(0.5, zoom - 0.25))} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/10 bg-white hover:border-black" aria-label="Zoom out">
                  <ZoomOut className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => setLightboxZoom((zoom) => Math.min(4, zoom + 0.25))} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/10 bg-white hover:border-black" aria-label="Zoom in">
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => setLightboxZoom(1)} className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-black text-black hover:border-black">
                  <RotateCcw className="h-4 w-4 text-brand-red" />
                  Reset
                </button>
                <button type="button" onClick={() => openInBrowser(activeLightboxResult)} className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-black text-black hover:border-black">
                  <ExternalLink className="h-4 w-4 text-brand-red" />
                  Open
                </button>
                <a href={activeLightboxResult.url} download={activeLightboxResult.fileName} className="inline-flex items-center gap-2 rounded-md bg-black px-3 py-2 text-sm font-black text-white hover:bg-black/85">
                  <Download className="h-4 w-4 text-brand-red" />
                  Download
                </a>
                <button type="button" onClick={() => setLightboxIndex(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/10 bg-white hover:border-black" aria-label="Close preview">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-zinc-50 p-4 text-center">
              <img
                src={activeLightboxResult.url}
                alt={activeLightboxResult.fileName}
                title={activeLightboxResult.fileName}
                loading="lazy"
                decoding="async"
                className="mx-auto max-h-[72vh] origin-center rounded-md object-contain transition-transform duration-150"
                style={{ transform: `scale(${lightboxZoom})` }}
              />
            </div>
          </div>
        </div>
      )}
      <StickyActionBar
        primaryLabel={!images.length ? 'Select File' : 'Crop All Images'}
        onPrimary={!images.length ? () => batchInputRef.current?.click() : cropAllSelections}
        primaryDisabled={images.length > 0 && !images.some((image) => (selectionsByImage[image.id] ?? []).length)}
        processing={isExporting}
        processingLabel={progress.total ? `Processing ${progress.current} / ${progress.total} crops...` : 'Processing crops...'}
        downloadLabel="Download ZIP"
        onDownload={downloadAllAsZip}
        downloadDisabled={!results.length}
        helperText={!images.length ? 'Choose images to begin.' : results.length ? `${results.length} crops ready.` : `${selections.length} crop selections`}
        done={results.length > 0}
      />
    </section>
  );
}
