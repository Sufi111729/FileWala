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
  return { width: image.naturalWidth, height: image.naturalHeight };
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

export function canvasToBlob(canvas, type = 'image/jpeg', quality = 0.9) {
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

export async function compressCanvasToTargetKB(canvas, targetKB) {
  if (!targetKB) return canvasToBlob(canvas, 'image/jpeg', 0.9);

  let bestBlob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
  const targetBytes = targetKB * 1024;
  if (bestBlob.size <= targetBytes) return bestBlob;

  let low = 0.18;
  let high = 0.92;

  for (let index = 0; index < 9; index += 1) {
    const quality = (low + high) / 2;
    const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    if (blob.size <= targetBytes) {
      bestBlob = blob;
      low = quality;
    } else {
      high = quality;
    }
  }

  return bestBlob;
}

export function applyBrightnessContrast(ctx, brightness = 100, contrast = 100) {
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
}

export async function exportFixedFrameImage({
  image,
  imagePositionX = 0,
  imagePositionY = 0,
  zoom = 1,
  rotation = 0,
  brightness = 100,
  contrast = 100,
  frameWidth,
  frameHeight,
  imageBaseWidth,
  imageBaseHeight,
  outputWidth,
  outputHeight,
  targetKB,
  filename,
}) {
  if (!image) throw new Error('Please upload an image first.');
  if (!frameWidth || !frameHeight || !outputWidth || !outputHeight) {
    throw new Error('Image export could not start. Please try again.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, outputWidth, outputHeight);

  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  const baseWidth = imageBaseWidth || naturalWidth;
  const baseHeight = imageBaseHeight || naturalHeight;
  const scaleX = outputWidth / frameWidth;
  const scaleY = outputHeight / frameHeight;

  ctx.save();
  ctx.translate(outputWidth / 2, outputHeight / 2);
  ctx.scale(scaleX, scaleY);
  ctx.translate(imagePositionX, imagePositionY);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(zoom, zoom);
  applyBrightnessContrast(ctx, brightness, contrast);
  ctx.drawImage(image, -baseWidth / 2, -baseHeight / 2, baseWidth, baseHeight);
  ctx.restore();
  ctx.filter = 'none';

  const blob = await compressCanvasToTargetKB(canvas, targetKB);
  const targetBytes = targetKB ? targetKB * 1024 : null;

  if (targetBytes && blob.size > targetBytes) {
    throw new Error(`Compression failed. Please zoom/crop closer or upload a simpler image under ${targetKB}KB.`);
  }

  return { canvas, blob, filename };
}

export function applyScannerFilter(ctx, filterType = 'original') {
  if (filterType === 'original') return;

  const { width, height } = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const gray = 0.299 * red + 0.587 * green + 0.114 * blue;

    if (filterType === 'grayscale') {
      data[index] = gray;
      data[index + 1] = gray;
      data[index + 2] = gray;
    }

    if (filterType === 'black-white') {
      const value = gray > 150 ? 255 : 0;
      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
    }

    if (filterType === 'enhanced') {
      const value = Math.max(0, Math.min(255, (gray - 128) * 1.45 + 138));
      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function whitenNearBackground(ctx) {
  const { width, height } = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const average = (red + green + blue) / 3;
    const spread = Math.max(red, green, blue) - Math.min(red, green, blue);

    if (average > 175 && spread < 55) {
      data[index] = 255;
      data[index + 1] = 255;
      data[index + 2] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export async function cropAndProcessImage({
  image,
  crop,
  outputWidth,
  outputHeight,
  rotate = 0,
  zoom = 1,
  brightness = 100,
  contrast = 100,
  scannerFilter = 'original',
  targetKB,
  makeWhiteBackground = false,
}) {
  if (!image) throw new Error('Please upload an image first.');

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, outputWidth, outputHeight);

  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  const sourceX = (crop.x / 100) * naturalWidth;
  const sourceY = (crop.y / 100) * naturalHeight;
  const sourceWidth = (crop.width / 100) * naturalWidth;
  const sourceHeight = (crop.height / 100) * naturalHeight;

  ctx.save();
  applyBrightnessContrast(ctx, brightness, contrast);
  ctx.translate(outputWidth / 2, outputHeight / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.scale(zoom, zoom);
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    -outputWidth / 2,
    -outputHeight / 2,
    outputWidth,
    outputHeight,
  );
  ctx.restore();
  ctx.filter = 'none';

  if (makeWhiteBackground) whitenNearBackground(ctx);
  applyScannerFilter(ctx, scannerFilter);

  const blob = await compressCanvasToTargetKB(canvas, targetKB);
  return { canvas, blob };
}
