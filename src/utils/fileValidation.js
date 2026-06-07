const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function validateFile(file, extensions, maxSize = MAX_FILE_SIZE) {
  if (!file) throw new Error('Please select a file first.');
  if (file.size === 0) throw new Error('The selected file is empty.');
  if (file.size > maxSize) throw new Error('File size must be 50 MB or smaller.');
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extensions.includes(extension)) {
    throw new Error(`Please upload a ${extensions.map((item) => `.${item}`).join(' or ')} file.`);
  }
  return file;
}

export function getFileInfo(file) {
  if (!file) return null;
  return {
    name: file.name,
    size: file.size,
    type: file.type || 'Unknown file type',
  };
}
