export function formatFileSize(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 800);
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
      reject(new Error('Upload a valid image file.'));
    };
    image.src = url;
  });
}

export function canvasToBlob(canvas, type = 'image/jpeg', quality = 0.85) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Compression failed. Please try another image.'));
      },
      type,
      quality,
    );
  });
}

function hasTransparency(image) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.min(image.naturalWidth || image.width, 800);
  canvas.height = Math.min(image.naturalHeight || image.height, 800);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const data = context.getImageData(0, 0, canvas.width, canvas.height).data;

  for (let index = 3; index < data.length; index += 4) {
    if (data[index] < 255) return true;
  }
  return false;
}

function drawImageToCanvas(image, maxWidth, maxHeight, outputType) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const scale = Math.min(1, maxWidth / sourceWidth, maxHeight / sourceHeight);
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (outputType === 'image/jpeg') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

function extensionForType(type) {
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  return 'jpg';
}

function outputTypeForFile(file, image, preferOriginalType = false) {
  if (file.type === 'image/png' && hasTransparency(image)) return 'image/png';
  if (preferOriginalType && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return file.type;
  return 'image/jpeg';
}

export async function compressImageByQuality(file, quality = 0.75, options = {}) {
  if (!file?.type?.startsWith('image/')) throw new Error('Please upload a JPG, PNG, or WEBP image.');

  const image = await loadImage(file);
  const outputType = options.outputType || outputTypeForFile(file, image, options.preferOriginalType);
  const maxWidth = Number(options.maxWidth || image.naturalWidth || image.width);
  const maxHeight = Number(options.maxHeight || image.naturalHeight || image.height);
  const canvas = drawImageToCanvas(image, maxWidth, maxHeight, outputType);
  const blob = await canvasToBlob(canvas, outputType, Number(quality));

  return {
    blob,
    width: canvas.width,
    height: canvas.height,
    outputType,
    extension: extensionForType(outputType),
    quality: Number(quality),
  };
}

export async function compressImageToTargetKB(file, targetKB, options = {}) {
  if (!file?.type?.startsWith('image/')) throw new Error('Please upload a JPG, PNG, or WEBP image.');

  const targetBytes = Number(targetKB) * 1024;
  if (!Number.isFinite(targetBytes) || targetBytes < 1024) {
    throw new Error('Enter a valid target size in KB.');
  }

  const image = await loadImage(file);
  const outputType = options.outputType || outputTypeForFile(file, image, options.preferOriginalType);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  let maxWidth = Number(options.maxWidth || sourceWidth);
  let maxHeight = Number(options.maxHeight || sourceHeight);
  let best = null;

  for (let dimensionPass = 0; dimensionPass < 9; dimensionPass += 1) {
    const canvas = drawImageToCanvas(image, maxWidth, maxHeight, outputType);
    let low = outputType === 'image/png' ? 0.5 : 0.1;
    let high = 0.95;

    for (let qualityPass = 0; qualityPass < 10; qualityPass += 1) {
      const quality = (low + high) / 2;
      const blob = await canvasToBlob(canvas, outputType, quality);

      if (!best || blob.size < best.blob.size || (blob.size <= targetBytes && blob.size > best.blob.size)) {
        best = {
          blob,
          width: canvas.width,
          height: canvas.height,
          outputType,
          extension: extensionForType(outputType),
          quality,
        };
      }

      if (blob.size <= targetBytes) {
        best = {
          blob,
          width: canvas.width,
          height: canvas.height,
          outputType,
          extension: extensionForType(outputType),
          quality,
        };
        low = quality;
      } else {
        high = quality;
      }
    }

    if (best?.blob.size <= targetBytes) return best;
    maxWidth *= 0.84;
    maxHeight *= 0.84;
  }

  if (best?.blob.size <= targetBytes * 1.1) return best;
  throw new Error('Could not reach the target KB while keeping the image usable. Try a higher target.');
}

export function calculateCompression(originalSize, compressedSize) {
  if (!originalSize || !compressedSize) return 0;
  return Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));
}
