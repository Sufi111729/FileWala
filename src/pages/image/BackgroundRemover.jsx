import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Image as ImageIcon,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import SeoHelmet from '../../components/seo/SeoHelmet.jsx';
import ToolSeoSections from '../../components/seo/ToolSeoSections.jsx';
import { toolSchemas } from '../../components/seo/schema.js';
import { getToolSeoBySlug } from '../../data/toolsSeoData.js';

const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxFileSize = 15 * 1024 * 1024;
const checkerboardStyle = {
  backgroundColor: '#f3f4f6',
  backgroundImage: 'linear-gradient(45deg, #d1d5db 25%, transparent 25%), linear-gradient(-45deg, #d1d5db 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d1d5db 75%), linear-gradient(-45deg, transparent 75%, #d1d5db 75%)',
  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
  backgroundSize: '20px 20px',
};

function revokeUrl(url) {
  if (url) URL.revokeObjectURL(url);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not prepare the processed image.'));
    image.src = url;
  });
}

export default function BackgroundRemover() {
  const inputRef = useRef(null);
  const originalUrlRef = useRef('');
  const resultUrlRef = useRef('');
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [resultBlob, setResultBlob] = useState(null);
  const [resultUrl, setResultUrl] = useState('');
  const [background, setBackground] = useState('transparent');
  const [customColor, setCustomColor] = useState('#e5e7eb');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => () => {
    revokeUrl(originalUrlRef.current);
    revokeUrl(resultUrlRef.current);
  }, []);

  const clearResult = () => {
    revokeUrl(resultUrlRef.current);
    resultUrlRef.current = '';
    setResultUrl('');
    setResultBlob(null);
    setBackground('transparent');
  };

  const selectFile = (selectedFile) => {
    setError('');
    clearResult();

    if (!selectedFile) return;
    if (!acceptedTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }
    if (selectedFile.size > maxFileSize) {
      setError('File is too large. Please upload an image smaller than 15 MB.');
      return;
    }

    revokeUrl(originalUrlRef.current);
    const nextUrl = URL.createObjectURL(selectedFile);
    originalUrlRef.current = nextUrl;
    setFile(selectedFile);
    setOriginalUrl(nextUrl);
  };

  const handleInput = (event) => {
    selectFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    selectFile(event.dataTransfer.files?.[0]);
  };

  const removeBackground = async () => {
    if (!file || isProcessing) return;
    setIsProcessing(true);
    setError('');
    clearResult();

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 404 || response.status === 502 || response.status === 503) {
          throw new Error('Background removal backend is not available. Please start or deploy the FastAPI service.');
        }
        throw new Error(data.detail || data.error || 'Background removal failed. Please try another image.');
      }

      const blob = await response.blob();
      if (!blob.size) throw new Error('The background removal service returned an empty image.');
      const nextUrl = URL.createObjectURL(blob);
      resultUrlRef.current = nextUrl;
      setResultBlob(blob);
      setResultUrl(nextUrl);
    } catch (caughtError) {
      const offline = caughtError instanceof TypeError;
      setError(offline
        ? 'Background removal backend is not available. Please start or deploy the FastAPI service.'
        : caughtError.message || 'Processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = async () => {
    if (!resultBlob || !resultUrl) return;
    let downloadUrl = resultUrl;

    try {
      if (background !== 'transparent') {
        const image = await loadImage(resultUrl);
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d');
        context.fillStyle = background === 'white' ? '#ffffff' : customColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);
        const composedBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (!composedBlob) throw new Error('Could not prepare the download.');
        downloadUrl = URL.createObjectURL(composedBlob);
      }

      const anchor = document.createElement('a');
      const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
      anchor.href = downloadUrl;
      anchor.download = `${baseName}-background-removed.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch (caughtError) {
      setError(caughtError.message || 'Could not download the image.');
    } finally {
      if (downloadUrl !== resultUrl) revokeUrl(downloadUrl);
    }
  };

  const reset = () => {
    revokeUrl(originalUrlRef.current);
    originalUrlRef.current = '';
    setOriginalUrl('');
    setFile(null);
    clearResult();
    setError('');
    setIsProcessing(false);
  };

  const resultBackground = background === 'white'
    ? '#ffffff'
    : background === 'custom'
      ? customColor
      : 'transparent';
  const seo = getToolSeoBySlug('background-remover');

  return (
    <section className="bg-white py-10 sm:py-14">
      <SeoHelmet
        title={seo.seoTitle}
        description={seo.metaDescription}
        canonical={seo.canonicalUrl}
        keywords={[seo.primaryKeyword, ...seo.secondaryKeywords, ...seo.longTailKeywords]}
        jsonLd={toolSchemas(seo)}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-black">
            <Sparkles className="h-4 w-4 text-brand-red" /> Image Tool
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-black sm:text-5xl">{seo.h1}</h1>
          <p className="mt-4 text-base leading-7 text-black/60 sm:text-lg sm:leading-8">
            {seo.shortIntro}
          </p>
        </div>

        <div className="mx-auto mt-9 max-w-6xl rounded-xl border border-black/10 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          {!file ? (
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="rounded-xl border-2 border-dashed border-black/15 bg-black/[0.015] px-5 py-12 text-center sm:py-16"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-white text-brand-red shadow-sm ring-1 ring-black/10">
                <UploadCloud className="h-7 w-7" />
              </span>
              <h2 className="mt-5 text-xl font-black text-black">Upload an image</h2>
              <p className="mt-2 text-sm leading-6 text-black/55">Drag and drop or select JPG, JPEG, PNG, or WEBP up to 15 MB.</p>
              <button type="button" onClick={() => inputRef.current?.click()} className="focus-ring mt-5 rounded-lg bg-brand-red px-5 py-3 text-sm font-black text-white hover:bg-black">
                Choose Image
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="flex flex-col gap-3 rounded-lg border border-black/10 bg-black/[0.015] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-white text-brand-red ring-1 ring-black/10"><ImageIcon className="h-5 w-5" /></span>
                  <div className="min-w-0"><p className="truncate text-sm font-black text-black">{file.name}</p><p className="mt-1 text-xs font-semibold text-black/45">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
                </div>
                <button type="button" onClick={() => inputRef.current?.click()} disabled={isProcessing} className="focus-ring rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-bold text-black hover:bg-black hover:text-white disabled:opacity-50">Change Image</button>
              </div>

              <div className={`grid gap-5 ${resultUrl ? 'lg:grid-cols-2' : 'mx-auto w-full max-w-xl'}`}>
                <figure className="overflow-hidden rounded-xl border border-black/10 bg-white">
                  <figcaption className="border-b border-black/10 px-4 py-3 text-sm font-black text-black">Before</figcaption>
                  <div className="flex min-h-72 items-center justify-center bg-black/[0.02] p-4"><img src={originalUrl} alt="Original upload" title="Original image" loading="lazy" decoding="async" className="max-h-[480px] w-full object-contain" /></div>
                </figure>
                {resultUrl && (
                  <figure className="overflow-hidden rounded-xl border border-black/10 bg-white">
                    <figcaption className="flex items-center justify-between border-b border-black/10 px-4 py-3 text-sm font-black text-black"><span>After</span><span className="text-xs font-bold text-green-700">Background removed</span></figcaption>
                    <div className="flex min-h-72 items-center justify-center p-4" style={checkerboardStyle}>
                      <div className="flex min-h-64 w-full items-center justify-center" style={{ backgroundColor: resultBackground }}><img src={resultUrl} alt="Background removed result" title="Background removed image" loading="lazy" decoding="async" className="max-h-[480px] w-full object-contain" /></div>
                    </div>
                  </figure>
                )}
              </div>

              {!resultUrl ? (
                <button type="button" onClick={removeBackground} disabled={isProcessing} className="focus-ring mx-auto inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-lg bg-brand-red px-6 py-3.5 text-sm font-black text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60">
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isProcessing ? 'Removing background...' : 'Remove Background'}
                </button>
              ) : (
                <div className="grid gap-5 rounded-xl border border-black/10 bg-black/[0.015] p-4 sm:p-5">
                  <div>
                    <h2 className="text-base font-black text-black">Background</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[['transparent', 'Transparent'], ['white', 'White background'], ['custom', 'Custom color']].map(([value, label]) => (
                        <button key={value} type="button" onClick={() => setBackground(value)} className={`focus-ring rounded-md border px-4 py-2.5 text-sm font-bold ${background === value ? 'border-brand-red bg-red-50 text-brand-red' : 'border-black/10 bg-white text-black/65 hover:text-black'}`}>{label}</button>
                      ))}
                    </div>
                    {background === 'custom' && <label className="mt-4 flex w-fit items-center gap-3 text-sm font-bold text-black/70">Choose color <input type="color" value={customColor} onChange={(event) => setCustomColor(event.target.value)} className="h-10 w-14 cursor-pointer rounded border border-black/10 bg-white p-1" /></label>}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button type="button" onClick={downloadResult} className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-brand-red px-5 py-3 text-sm font-black text-white hover:bg-black"><Download className="h-4 w-4" /> Download PNG</button>
                    <button type="button" onClick={reset} className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-5 py-3 text-sm font-black text-black hover:bg-black hover:text-white"><RotateCcw className="h-4 w-4" /> Reset</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={handleInput} className="sr-only" />
          {error && <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
        </div>

        <div className="mx-auto mt-6 flex max-w-4xl items-start gap-3 rounded-lg border border-black/10 bg-black/[0.015] px-4 py-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-brand-red" />
          <p className="text-sm font-semibold leading-6 text-black/60">Images are processed only for background removal and are not stored permanently.</p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3">
          {['Upload a supported image', 'Remove the background automatically', 'Choose a background and download PNG'].map((item) => (
            <div key={item} className="rounded-lg border border-black/10 bg-white p-5 shadow-sm"><CheckCircle2 className="h-5 w-5 text-brand-red" /><p className="mt-3 text-sm font-bold leading-6 text-black/70">{item}</p></div>
          ))}
        </div>
        <ToolSeoSections seo={seo} activeTab="Image Tools" />
      </div>
    </section>
  );
}
