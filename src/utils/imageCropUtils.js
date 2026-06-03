export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];

const extensionByMime = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function isSupportedImage(file) {
  return SUPPORTED_IMAGE_TYPES.includes(file?.type);
}

export function formatFileSize(bytes = 0) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export const formatBytes = formatFileSize;

export function qualityValue(mode) {
  if (mode === 'best') return 0.95;
  if (mode === 'small') return 0.65;
  return 0.82;
}

export function resolveOutputMime(file, outputFormat) {
  if (outputFormat === 'jpg') return 'image/jpeg';
  if (outputFormat === 'png') return 'image/png';
  if (outputFormat === 'webp') return 'image/webp';
  if (file.type === 'image/bmp') return 'image/png';
  return extensionByMime[file.type] ? file.type : 'image/png';
}

export function getOutputFileName(originalName, outputFormat, file) {
  const mimeType = file ? resolveOutputMime(file, outputFormat) : outputFormat;
  const baseName = (originalName || 'cropped-image').replace(/\.[^.]+$/, '');
  return `${baseName}-cropped.${extensionByMime[mimeType] ?? 'png'}`;
}

export function outputFileName(name, mimeType) {
  return getOutputFileName(name, mimeType);
}

export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`${file.name} could not be decoded as an image.`));
    };

    image.src = url;
  });
}

export async function getImageDimensions(file) {
  const image = await loadImage(file);
  return {
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
  };
}

export function getCenterCropArea(imageWidth, imageHeight, targetRatio) {
  if (!targetRatio || targetRatio <= 0) {
    return {
      x: 0,
      y: 0,
      width: Math.round(imageWidth),
      height: Math.round(imageHeight),
    };
  }

  const imageRatio = imageWidth / imageHeight;
  let cropWidth;
  let cropHeight;
  let cropX;
  let cropY;

  if (imageRatio > targetRatio) {
    cropHeight = imageHeight;
    cropWidth = imageHeight * targetRatio;
    cropX = (imageWidth - cropWidth) / 2;
    cropY = 0;
  } else {
    cropWidth = imageWidth;
    cropHeight = imageWidth / targetRatio;
    cropX = 0;
    cropY = (imageHeight - cropHeight) / 2;
  }

  return {
    x: Math.max(0, Math.round(cropX)),
    y: Math.max(0, Math.round(cropY)),
    width: Math.max(1, Math.round(cropWidth)),
    height: Math.max(1, Math.round(cropHeight)),
  };
}

export const getFitCoverCropArea = getCenterCropArea;
export const defaultCropPixels = ({ width, height }, aspectRatio) => getCenterCropArea(width, height, aspectRatio);

export function percentagesToPixels(percentages, dimensions) {
  if (!percentages || !dimensions?.width || !dimensions?.height) return null;

  return {
    x: Math.round((percentages.x / 100) * dimensions.width),
    y: Math.round((percentages.y / 100) * dimensions.height),
    width: Math.round((percentages.width / 100) * dimensions.width),
    height: Math.round((percentages.height / 100) * dimensions.height),
  };
}

function clampCropArea(cropArea, imageWidth, imageHeight) {
  const safeX = Math.max(0, Math.min(Math.round(cropArea.x), imageWidth - 1));
  const safeY = Math.max(0, Math.min(Math.round(cropArea.y), imageHeight - 1));

  return {
    x: safeX,
    y: safeY,
    width: Math.max(1, Math.min(Math.round(cropArea.width), imageWidth - safeX)),
    height: Math.max(1, Math.min(Math.round(cropArea.height), imageHeight - safeY)),
  };
}

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Image crop export failed. Please try a different format.'));
      },
      mimeType,
      mimeType === 'image/png' ? undefined : quality,
    );
  });
}

export async function cropImageToBlob(file, cropArea, outputFormat, quality) {
  const image = await loadImage(file);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const safeCrop = clampCropArea(cropArea, sourceWidth, sourceHeight);
  const mimeType = resolveOutputMime(file, outputFormat);
  const canvas = document.createElement('canvas');
  canvas.width = safeCrop.width;
  canvas.height = safeCrop.height;
  const context = canvas.getContext('2d', { alpha: mimeType !== 'image/jpeg' });

  if (mimeType === 'image/jpeg') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(
    image,
    safeCrop.x,
    safeCrop.y,
    safeCrop.width,
    safeCrop.height,
    0,
    0,
    safeCrop.width,
    safeCrop.height,
  );

  return canvasToBlob(canvas, mimeType, quality);
}

export async function cropImageFile({ file, cropPixels, outputFormat, qualityMode }) {
  const blob = await cropImageToBlob(file, cropPixels, outputFormat, qualityValue(qualityMode));

  return {
    blob,
    fileName: getOutputFileName(file.name, outputFormat, file),
    mimeType: resolveOutputMime(file, outputFormat),
    width: Math.round(cropPixels.width),
    height: Math.round(cropPixels.height),
  };
}
