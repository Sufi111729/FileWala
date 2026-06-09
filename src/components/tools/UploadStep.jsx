import { AlertCircle, ImagePlus, Trash2, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import { useLanguage } from '../../i18n.jsx';
import { formatFileSize, getImageDimensions } from '../../utils/documentImageUtils.js';

const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const maxSize = 10 * 1024 * 1024;

export default function UploadStep({ file, previewUrl, dimensions, onFileReady, onRemove }) {
  const { text } = useLanguage();
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  const handleFile = async (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    if (!acceptedTypes.includes(selectedFile.type)) {
      setError(text.documentTool.invalidImageType);
      return;
    }

    if (selectedFile.size > maxSize) {
      setError(text.documentTool.fileTooLarge);
      return;
    }

    try {
      const imageSize = await getImageDimensions(selectedFile);
      onFileReady(selectedFile, imageSize);
    } catch (caughtError) {
      setError(caughtError.message || text.documentTool.tryAnotherFile);
    }
  };

  return (
    <div className="mx-auto grid max-w-2xl gap-4">
      <label
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleFile(event.dataTransfer.files?.[0]);
        }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-black/15 bg-black/[0.015] px-5 py-7 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/30 sm:py-8"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-blue-700">
          <UploadCloud className="h-6 w-6" />
        </span>
        <span className="mt-4 text-lg font-black text-black">{text.documentTool.dropFile}</span>
        <span className="mt-2 text-sm font-semibold text-black/55">{text.documentTool.acceptedImages}</span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="focus-ring mt-5 inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-800"
        >
          <ImagePlus className="h-4 w-4" />
          {text.upload.select}
        </button>
        {file && (
          <span className="mt-4 grid gap-1 text-sm font-semibold text-black/60">
            <span className="font-black text-green-700">✓ File Selected</span>
            <span>File Name: {file.name}</span>
            <span>Size: {formatFileSize(file.size)}</span>
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </label>

      {error && (
        <p className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {file && (
        <div className="rounded-md border border-black/10 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img src={previewUrl} alt="Uploaded preview" className="mx-auto h-20 w-20 rounded-md border border-black/10 object-cover sm:mx-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-black text-black">{file.name}</p>
              <p className="mt-1 text-sm font-semibold text-black/55">
                {formatFileSize(file.size)} - {dimensions.width} x {dimensions.height} px
              </p>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-black/10 px-3 py-2 text-sm font-bold text-black/70 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              {text.documentTool.removeFile}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
