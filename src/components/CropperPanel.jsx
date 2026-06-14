import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { ChevronLeft, ChevronRight, Move, SlidersHorizontal } from 'lucide-react';

export default function CropperPanel({
  images,
  activeIndex,
  onActiveIndexChange,
  aspectRatio,
  activeImage,
  onCropChange,
  onZoomChange,
  onCropSizeChange,
  onCropComplete,
}) {
  if (!activeImage) {
    return (
      <div className="rounded-md border border-dashed border-black/20 bg-white p-8 text-center text-sm font-semibold text-black/50">
        Upload images to open the crop editor.
      </div>
    );
  }

  const cropBoxHeight = aspectRatio ? Math.round(activeImage.cropBoxWidth / aspectRatio) : activeImage.cropBoxHeight;
  const canGoPrevious = activeIndex > 0;
  const canGoNext = activeIndex < images.length - 1;

  return (
    <div className="rounded-lg border border-black/10 bg-white">
      <div className="flex flex-col gap-3 border-b border-black/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-black">Step 3: Crop editor</h2>
          <p className="mt-1 text-sm text-black/55">
            {activeImage.file.name} | {activeImage.width} x {activeImage.height}px
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canGoPrevious}
            onClick={() => onActiveIndexChange(activeIndex - 1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/10 bg-white text-black transition-colors hover:border-black/40 disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-16 text-center text-sm font-black text-black/60">
            {activeIndex + 1} / {images.length}
          </span>
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => onActiveIndexChange(activeIndex + 1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/10 bg-white text-black transition-colors hover:border-black/40 disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_260px]">
        <div className="relative h-[340px] overflow-hidden rounded-md bg-black sm:h-[460px]">
          <Cropper
            image={activeImage.url}
            crop={activeImage.crop}
            zoom={activeImage.zoom}
            aspect={aspectRatio || undefined}
            cropSize={{ width: activeImage.cropBoxWidth, height: cropBoxHeight }}
            onCropChange={(crop) => onCropChange(activeIndex, crop)}
            onZoomChange={(zoom) => onZoomChange(activeIndex, zoom)}
            onCropComplete={(croppedArea, croppedAreaPixels) => onCropComplete(activeIndex, croppedArea, croppedAreaPixels)}
            showGrid
            restrictPosition={false}
            objectFit="contain"
          />
        </div>

        <aside className="rounded-md border border-black/10 bg-zinc-50 p-4">
          <div className="flex items-center gap-2 text-sm font-black text-black">
            <SlidersHorizontal className="h-4 w-4 text-brand-red" />
            Crop controls
          </div>

          <label className="mt-5 block text-sm font-bold text-black/70" htmlFor="crop-zoom">
            Zoom
          </label>
          <input
            id="crop-zoom"
            type="range"
            min="1"
            max="5"
            step="0.01"
            value={activeImage.zoom}
            onChange={(event) => onZoomChange(activeIndex, Number(event.target.value))}
            className="mt-2 w-full accent-black"
          />

          <label className="mt-5 block text-sm font-bold text-black/70" htmlFor="crop-width">
            Crop box width
          </label>
          <input
            id="crop-width"
            type="range"
            min="120"
            max="720"
            step="4"
            value={activeImage.cropBoxWidth}
            onChange={(event) => onCropSizeChange(activeIndex, { cropBoxWidth: Number(event.target.value) })}
            className="mt-2 w-full accent-black"
          />

          {!aspectRatio && (
            <>
              <label className="mt-5 block text-sm font-bold text-black/70" htmlFor="crop-height">
                Crop box height
              </label>
              <input
                id="crop-height"
                type="range"
                min="120"
                max="520"
                step="4"
                value={activeImage.cropBoxHeight}
                onChange={(event) => onCropSizeChange(activeIndex, { cropBoxHeight: Number(event.target.value) })}
                className="mt-2 w-full accent-black"
              />
            </>
          )}

          <div className="mt-5 rounded-md border border-black/10 bg-white p-3 text-sm leading-6 text-black/60">
            <Move className="mr-2 inline h-4 w-4 text-brand-red" />
            Drag the image to move the crop area. Use sliders to resize the crop box and zoom.
          </div>
        </aside>
      </div>

      <div className="border-t border-black/10 p-4">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => onActiveIndexChange(index)}
              className={`w-24 shrink-0 overflow-hidden rounded-md border bg-white text-left ${
                index === activeIndex ? 'border-brand-red ring-2 ring-brand-red/20' : 'border-black/10'
              }`}
            >
              <img src={image.url} alt={image.file.name} title={image.file.name} loading="lazy" decoding="async" className="h-16 w-full object-cover" />
              <span className="block truncate px-2 py-1 text-xs font-bold text-black/65">{image.file.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
