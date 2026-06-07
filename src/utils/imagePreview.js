export async function getImageDimensions(file) {
  if ('createImageBitmap' in window) {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  }

  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error('This image could not be opened.'));
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function isPreviewableImage(file) {
  return Boolean(file?.type?.startsWith('image/'));
}
