export function loadImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Please upload an image file.'));
      return;
    }

    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This image could not be opened. Please try another file.'));
    };
    image.src = url;
  });
}

export async function getImageDimensions(file) {
  const image = await loadImage(file);
  return { width: image.naturalWidth || image.width, height: image.naturalHeight || image.height };
}

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

export function canvasToBlob(canvas, type = 'image/png', quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Image export failed. Please try again.'));
      },
      type,
      quality,
    );
  });
}

export function calculateAspectRatioSize(width, height, targetWidth, targetHeight) {
  const sourceWidth = Math.max(1, Number(width) || 1);
  const sourceHeight = Math.max(1, Number(height) || 1);
  const ratio = sourceWidth / sourceHeight;
  let nextWidth = Math.max(1, Math.round(Number(targetWidth) || sourceWidth));
  let nextHeight = Math.max(1, Math.round(Number(targetHeight) || sourceHeight));

  if (targetWidth && !targetHeight) {
    nextHeight = Math.max(1, Math.round(nextWidth / ratio));
  } else if (!targetWidth && targetHeight) {
    nextWidth = Math.max(1, Math.round(nextHeight * ratio));
  } else if (targetWidth && targetHeight) {
    nextHeight = Math.max(1, Math.round(nextWidth / ratio));
  }

  return { width: nextWidth, height: nextHeight };
}

export async function resizeImageWithCanvas(file, options) {
  const {
    width,
    height,
    type = 'image/png',
    quality = 0.92,
    backgroundColor = '#ffffff',
  } = options || {};

  if (!width || !height) throw new Error('Please choose a valid output size.');

  const image = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (type === 'image/jpeg') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await canvasToBlob(canvas, type, quality);

  return {
    blob,
    width: canvas.width,
    height: canvas.height,
    extension: type === 'image/jpeg' ? 'jpg' : 'png',
  };
}
