import { AlertCircle, CheckCircle2, Download, Loader2, UploadCloud, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { calculateCompression, downloadBlob, formatFileSize } from '../../utils/compressUtils.js';
import { useLanguage } from '../../i18n.jsx';

export default function PdfCompressor() {
  const { text } = useLanguage();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const reduction = calculateCompression(file?.size, result?.size);

  const handleFile = (selectedFile) => {
    setError('');
    setStatus('');
    setResult(null);

    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      setError(text.pdf.uploadPdfError);
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError(text.errors.fileTooLarge);
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files?.[0]);
  };

  const removeFile = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setFile(null);
    setResult(null);
    setStatus('');
    setError('');
  };

  const processPdf = async () => {
    if (!file) {
      setError(text.pdf.uploadFirst);
      return;
    }

    setStatus('processing');
    setError('');

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const source = new TextDecoder('latin1').decode(bytes);
      const cleaned = source
        .replace(/\/Producer\s*\([^)]*\)/g, '/Producer (FileWalaTool)')
        .replace(/\/Creator\s*\([^)]*\)/g, '/Creator (FileWalaTool)')
        .replace(/\r\n/g, '\n');
      const output = new Blob([new TextEncoder().encode(cleaned)], { type: 'application/pdf' });
      setResult(output.size < file.size ? output : new Blob([bytes], { type: 'application/pdf' }));
      setStatus(text.pdf.compressLimited);
    } catch {
      setError(text.errors.processingFailed);
      setStatus('');
    }
  };

  const download = () => {
    if (!result) return;
    const base = file?.name?.replace(/\.pdf$/i, '') || 'compressed-pdf';
    downloadBlob(result, `${base}-compressed.pdf`);
    setStatus(text.image.downloaded);
  };

  return (
    <section className="bg-white py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-wide text-green-700">{text.categories.Compress}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-black sm:text-4xl">{text.tools['compress-pdf'][0]}</h1>
        <p className="mt-4 text-base leading-7 text-black/60">
          {text.tools['compress-pdf'][1]}
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <label
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-black/20 bg-white px-5 py-12 text-center transition-colors hover:border-green-500"
          >
            <UploadCloud className="h-10 w-10 text-green-700" />
            <span className="mt-4 text-lg font-black text-black">{text.pdf.uploadPdf}</span>
            <span className="mt-2 text-sm text-black/55">{file?.name || text.upload.drop}</span>
            {file && (
              <span className="mt-4 grid gap-1 text-sm font-semibold text-black/60">
                <span className="font-black text-green-700">✓ File Selected</span>
                <span>File Name: {file.name}</span>
                <span>Size: {formatFileSize(file.size)}</span>
                <button type="button" onClick={removeFile} className="mt-1 text-sm font-bold text-red-700 underline underline-offset-2">
                  Remove
                </button>
              </span>
            )}
            <input type="file" accept="application/pdf" className="sr-only" onChange={(event) => handleFile(event.target.files?.[0])} />
          </label>

          <aside className="rounded-md border border-black/10 bg-white p-5">
            <h2 className="text-sm font-black uppercase tracking-wide text-black/50">{text.pdf.pdfDetails}</h2>
            <div className="mt-4 grid gap-2 rounded-md border border-black/10 bg-black/[0.015] p-4 text-sm font-semibold text-black/65">
              <span>{text.legal.name}: {file?.name || text.errors.noFileSelected}</span>
              <span>{text.pdf.original}: {formatFileSize(file?.size || 0)}</span>
              <span>{text.pdf.output}: {formatFileSize(result?.size || 0)}</span>
              <span>{text.image.reduction}: {reduction}%</span>
            </div>
            <button type="button" onClick={processPdf} disabled={!file || status === 'processing'} className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-black px-5 py-3 text-sm font-bold text-white hover:bg-black/85 disabled:bg-black/25">
              {status === 'processing' ? <Loader2 className="h-4 w-4 animate-spin text-green-400" /> : <Wand2 className="h-4 w-4 text-green-400" />}
              {text.pdf.actions.compress}
            </button>
            <button type="button" onClick={download} disabled={!result} className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-5 py-3 text-sm font-bold text-black hover:border-black/35 disabled:cursor-not-allowed disabled:text-black/30">
              <Download className="h-4 w-4 text-green-700" />
              {text.pdf.downloadPdf}
            </button>
            {error && <p className="mt-3 flex gap-2 text-sm font-bold text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 flex-none" />{error}</p>}
            {status && status !== 'processing' && <p className="mt-3 flex gap-2 text-sm font-bold text-green-700"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />{status}</p>}
          </aside>
        </div>
      </div>
    </section>
  );
}
