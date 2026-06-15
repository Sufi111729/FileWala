import { AlertCircle, CheckCircle2, Download, Eye, EyeOff, Loader2, RotateCcw, ShieldCheck, Wand2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import UploadBox from '../components/UploadBox.jsx';
import SEO from '../components/SEO.jsx';
import ToolSeoSections from '../components/seo/ToolSeoSections.jsx';
import { toolSchemas } from '../components/seo/schema.js';
import { allTools } from '../data/tools.js';
import { absoluteUrl, getToolSeoBySlug } from '../data/toolsSeoData.js';
import { useLanguage } from '../i18n.jsx';
import downloadBlob from '../utils/downloadBlob.js';
import createObjectUrl, { revokeObjectUrl } from '../utils/createObjectUrl.js';
import formatFileSize from '../utils/formatFileSize.js';
import { getFileInfo, validateFile } from '../utils/fileValidation.js';
import { getImageDimensions } from '../utils/imagePreview.js';
import { extractPdfTextPreview } from '../utils/pdfPreview.js';

const definitions = {
  'pdf-to-word': { extensions: ['pdf'], action: 'Convert to Word', loading: 'Converting...', filename: 'converted.docx' },
  'word-to-pdf': { extensions: ['docx'], action: 'Convert to PDF', loading: 'Converting...', filename: 'converted.pdf' },
  'protect-pdf': { extensions: ['pdf'], action: 'Protect PDF', loading: 'Protecting PDF...', filename: 'protected.pdf' },
  'unlock-pdf': { extensions: ['pdf'], action: 'Unlock PDF', loading: 'Unlocking PDF...', filename: 'unlocked.pdf' },
  'watermark-pdf': { extensions: ['pdf'], action: 'Add Watermark', loading: 'Adding watermark...', filename: 'watermarked.pdf' },
  'resize-image': { extensions: ['jpg', 'jpeg', 'png', 'webp'], action: 'Resize Image', loading: 'Resizing image...', filename: 'resized-image.jpg' },
};

const fieldClass = 'rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

function PasswordFields({ confirm, password, setPassword, confirmation, setConfirmation }) {
  const [show, setShow] = useState(false);
  return (
    <div className="grid gap-3">
      <label className="grid gap-2 text-sm font-bold text-black/70">
        Password
        <div className="relative">
          <input type={show ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className={`${fieldClass} w-full pr-10`} />
          <button type="button" onClick={() => setShow((value) => !value)} className="absolute right-2 top-2 text-black/50" aria-label="Show password">
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </label>
      {confirm && (
        <label className="grid gap-2 text-sm font-bold text-black/70">
          Confirm password
          <input type={show ? 'text' : 'password'} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className={fieldClass} />
        </label>
      )}
      <label className="flex items-center gap-2 text-sm font-semibold text-black/60">
        <input type="checkbox" checked={show} onChange={(event) => setShow(event.target.checked)} /> Show password
      </label>
    </div>
  );
}

export default function BrowserToolPage({ slug }) {
  const { tSeo, tToolTitle, tToolDescription } = useLanguage();
  const tool = allTools.find((item) => item.slug === slug);
  const definition = definitions[slug];
  const seo = tSeo(getToolSeoBySlug(slug));
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [output, setOutput] = useState(null);
  const [outputUrl, setOutputUrl] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [textPreview, setTextPreview] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [processing, setProcessing] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [watermark, setWatermark] = useState({ text: 'FileWalaTool', opacity: 0.25, fontSize: 42, rotation: -35, position: 'center', pages: '', imageFile: null, imageSize: 140 });
  const [imageOptions, setImageOptions] = useState({ width: 800, height: 600, keepRatio: true, format: 'image/jpeg', quality: 0.9 });
  const [originalRatio, setOriginalRatio] = useState(4 / 3);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [uploadResetKey, setUploadResetKey] = useState(0);

  useEffect(() => {
    const url = file && (definition.extensions.includes('pdf') || slug === 'resize-image') ? createObjectUrl(file) : '';
    setPreviewUrl(url);
    return () => revokeObjectUrl(url);
  }, [definition.extensions, file, slug]);

  useEffect(() => {
    const url = output ? createObjectUrl(output) : '';
    setOutputUrl(url);
    return () => revokeObjectUrl(url);
  }, [output]);

  useEffect(() => {
    if (!file) return undefined;
    let cancelled = false;

    const preparePreview = async () => {
      setIsPreviewLoading(true);
      try {
        if (slug === 'word-to-pdf') {
          const mammoth = (await import('mammoth')).default;
          const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
          if (!cancelled) setPreviewHtml(result.value || '');
        }
        if (slug === 'pdf-to-word') {
          const result = await extractPdfTextPreview(file);
          if (!cancelled) {
            setTextPreview(result.text);
            if (result.isScanned) setError('This PDF looks like scanned/image PDF. OCR is required for Word conversion.');
          }
        }
      } catch (caughtError) {
        if (!cancelled && slug === 'word-to-pdf') {
          setError('DOCX preview could not be generated, but you can still try converting.');
        } else if (!cancelled && slug === 'pdf-to-word') {
          setError(caughtError?.message || 'Text preview could not be generated. You can still view the PDF.');
        }
      } finally {
        if (!cancelled) setIsPreviewLoading(false);
      }
    };

    preparePreview();
    return () => { cancelled = true; };
  }, [file, slug]);

  useEffect(() => {
    if (slug !== 'resize-image' || !file) return;
    getImageDimensions(file).then((dimensions) => {
      setOriginalRatio(dimensions.width / dimensions.height);
      setOriginalDimensions(dimensions);
      setImageOptions((value) => ({ ...value, width: dimensions.width, height: dimensions.height }));
    }).catch(() => setError('This image could not be opened.'));
  }, [file, slug]);

  useEffect(() => {
    if (!file || (slug !== 'watermark-pdf' && slug !== 'resize-image')) return undefined;
    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setIsPreviewLoading(true);
      try {
        const blob = slug === 'watermark-pdf'
          ? await (await import('../services/pdfEditService.js')).watermarkPdf(file, watermark)
          : await (await import('../services/imageResizeService.js')).resizeImage(file, imageOptions);
        if (!cancelled) setOutput(blob);
      } catch (caughtError) {
        if (!cancelled) setError(caughtError?.message || 'Live preview could not be generated.');
      } finally {
        if (!cancelled) setIsPreviewLoading(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [file, imageOptions, slug, watermark]);

  const previewType = useMemo(() => output?.type === 'application/pdf' ? 'pdf' : output?.type?.startsWith('image/') ? 'image' : '', [output]);
  const estimatedImageSize = useMemo(() => {
    if (slug !== 'resize-image' || !file || !originalDimensions.width) return 0;
    const pixelRatio = (imageOptions.width * imageOptions.height) / (originalDimensions.width * originalDimensions.height);
    const qualityFactor = imageOptions.format === 'image/png' ? 1 : Number(imageOptions.quality);
    return Math.max(1024, Math.round(file.size * pixelRatio * qualityFactor));
  }, [file, imageOptions, originalDimensions, slug]);

  const selectFiles = (files) => {
    const selectedFile = files[0] || null;
    setFile(selectedFile);
    setFileInfo(getFileInfo(selectedFile));
    setOutput(null);
    setPreviewHtml('');
    setTextPreview('');
    setError('');
    setStatus(selectedFile ? 'Selected and ready.' : '');
    setPassword('');
    setConfirmation('');
    setUploadResetKey((value) => value + 1);
  };

  const changeImageDimension = (key, value) => {
    const numeric = Math.max(1, Number(value) || 1);
    setImageOptions((current) => ({
      ...current,
      [key]: numeric,
      ...(current.keepRatio ? { [key === 'width' ? 'height' : 'width']: Math.round(key === 'width' ? numeric / originalRatio : numeric * originalRatio) } : {}),
    }));
  };

  const processFile = async (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    if (processing) return;
    setError('');
    setStatus('');
    setOutput(null);
    setProcessing(true);
    try {
      validateFile(file, definition.extensions);
      let blob;
      if (slug === 'pdf-to-word') {
        const { convertPdfToWord } = await import('../services/pdfToWordService.js');
        blob = await convertPdfToWord(file, setStatus);
      }
      if (slug === 'word-to-pdf') {
        const { convertWordToPdf } = await import('../services/wordToPdfService.js');
        blob = await convertWordToPdf(file, setStatus);
      }
      if (slug === 'protect-pdf') {
        if (password.length < 4) throw new Error('Password must be at least 4 characters.');
        if (password !== confirmation) throw new Error('Passwords do not match.');
        const { protectPdf } = await import('../services/pdfSecurityService.js');
        blob = await protectPdf(file, password);
      }
      if (slug === 'unlock-pdf') {
        if (!password) throw new Error('Please enter the PDF password.');
        const { unlockPdf } = await import('../services/pdfSecurityService.js');
        blob = await unlockPdf(file, password);
      }
      if (slug === 'watermark-pdf') {
        if (!watermark.text.trim() && !watermark.imageFile) throw new Error('Enter watermark text or select a watermark image.');
        const { watermarkPdf } = await import('../services/pdfEditService.js');
        blob = await watermarkPdf(file, watermark);
      }
      if (slug === 'resize-image') {
        if (imageOptions.width < 1 || imageOptions.height < 1) throw new Error('Width and height must be greater than zero.');
        const { resizeImage } = await import('../services/imageResizeService.js');
        blob = await resizeImage(file, imageOptions);
      }
      setOutput(blob);
      setStatus(slug === 'protect-pdf' ? 'Protected PDF is ready.' : 'Your file is ready to download.');
    } catch (caughtError) {
      setError(caughtError?.message || 'Processing failed. Please try another file.');
    } finally {
      setProcessing(false);
    }
  };

  const filename = slug === 'resize-image'
    ? `resized-image.${imageOptions.format.split('/')[1].replace('jpeg', 'jpg')}`
    : definition.filename;

  const showPdfInput = definition.extensions.includes('pdf') && previewUrl;
  const showOutputPdf = outputUrl && output?.type === 'application/pdf' && slug !== 'protect-pdf';

  const resetTool = () => {
    setFile(null);
    setFileInfo(null);
    setOutput(null);
    setPreviewHtml('');
    setTextPreview('');
    setError('');
    setStatus('');
    setPassword('');
    setConfirmation('');
  };

  return (
    <section className="bg-white py-8 sm:py-12">
      <SEO
        title={seo?.seoTitle ?? `${tToolTitle(tool)} - FileWalaTool`}
        description={seo?.metaDescription ?? tToolDescription(tool)}
        canonical={seo?.canonicalUrl ?? absoluteUrl(`/${slug}`)}
        keywords={seo ? [seo.primaryKeyword, ...(seo.secondaryKeywords ?? [])] : [tToolTitle(tool)]}
        image={tool.imageUrl}
        imageAlt={seo?.imageAlt ?? tool.imageAlt}
        ogDescription={seo?.ogDescription}
        twitterDescription={seo?.twitterDescription}
        schema={seo ? toolSchemas({ ...seo, imageUrl: tool.imageUrl }) : []}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-wide text-brand-red">Browser Tool</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-black sm:text-4xl">{seo?.h1 ?? tToolTitle(tool)}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-black/60">{seo?.shortIntro ?? tToolDescription(tool)}</p>
        </div>

        <div className="mt-8 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">
          Files are processed in your browser and are not uploaded to any server.
          {slug === 'unlock-pdf' && <span className="mt-1 block">Only unlock PDFs you own or have permission to access.</span>}
        </div>

        <div className="mt-6">
          <UploadBox key={uploadResetKey} tool={tool} uploadOnly onFilesSelected={selectFiles} />
        </div>

        <form
          className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
          onSubmit={processFile}
          noValidate
        >
          <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-black text-black">Settings</h2>
            <div className="mt-5 grid gap-4">
              {(slug === 'protect-pdf' || slug === 'unlock-pdf') && (
                <PasswordFields confirm={slug === 'protect-pdf'} password={password} setPassword={setPassword} confirmation={confirmation} setConfirmation={setConfirmation} />
              )}

              {slug === 'watermark-pdf' && (
                <>
                  <label className="grid gap-2 text-sm font-bold text-black/70">Watermark text<input className={fieldClass} value={watermark.text} onChange={(event) => setWatermark({ ...watermark, text: event.target.value })} /></label>
                  <label className="grid gap-2 text-sm font-bold text-black/70">Image watermark (PNG/JPG)<input type="file" accept="image/png,image/jpeg" className={fieldClass} onChange={(event) => setWatermark({ ...watermark, imageFile: event.target.files?.[0] || null })} /></label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-bold text-black/70">Font size<input type="number" min="8" max="200" className={fieldClass} value={watermark.fontSize} onChange={(event) => setWatermark({ ...watermark, fontSize: event.target.value })} /></label>
                    <label className="grid gap-2 text-sm font-bold text-black/70">Rotation angle<input type="number" min="-180" max="180" className={fieldClass} value={watermark.rotation} onChange={(event) => setWatermark({ ...watermark, rotation: event.target.value })} /></label>
                    <label className="grid gap-2 text-sm font-bold text-black/70">Position<select className={fieldClass} value={watermark.position} onChange={(event) => setWatermark({ ...watermark, position: event.target.value })}>{['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'tiled'].map((item) => <option key={item}>{item}</option>)}</select></label>
                    <label className="grid gap-2 text-sm font-bold text-black/70">Selected pages (optional)<input className={fieldClass} placeholder="1,3,5-7" value={watermark.pages} onChange={(event) => setWatermark({ ...watermark, pages: event.target.value })} /></label>
                  </div>
                  <label className="grid gap-2 text-sm font-bold text-black/70">Opacity: {watermark.opacity}<input type="range" min="0.05" max="1" step="0.05" value={watermark.opacity} onChange={(event) => setWatermark({ ...watermark, opacity: event.target.value })} /></label>
                  <label className="grid gap-2 text-sm font-bold text-black/70">Image size: {watermark.imageSize}px<input type="range" min="40" max="500" step="10" value={watermark.imageSize} onChange={(event) => setWatermark({ ...watermark, imageSize: event.target.value })} /></label>
                </>
              )}

              {slug === 'resize-image' && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-bold text-black/70">Width<input type="number" min="1" className={fieldClass} value={imageOptions.width} onChange={(event) => changeImageDimension('width', event.target.value)} /></label>
                    <label className="grid gap-2 text-sm font-bold text-black/70">Height<input type="number" min="1" className={fieldClass} value={imageOptions.height} onChange={(event) => changeImageDimension('height', event.target.value)} /></label>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-bold text-black/70"><input type="checkbox" checked={imageOptions.keepRatio} onChange={(event) => setImageOptions({ ...imageOptions, keepRatio: event.target.checked })} /> Keep aspect ratio</label>
                  <label className="grid gap-2 text-sm font-bold text-black/70">Output format<select className={fieldClass} value={imageOptions.format} onChange={(event) => setImageOptions({ ...imageOptions, format: event.target.value })}><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WEBP</option></select></label>
                  {imageOptions.format !== 'image/png' && <label className="grid gap-2 text-sm font-bold text-black/70">Quality: {Math.round(imageOptions.quality * 100)}%<input type="range" min="0.1" max="1" step="0.05" value={imageOptions.quality} onChange={(event) => setImageOptions({ ...imageOptions, quality: event.target.value })} /></label>}
                </>
              )}

              {fileInfo && (
                <div className="grid gap-1 rounded-md border border-black/10 bg-slate-50 p-4 text-sm font-semibold text-black/65">
                  <span className="font-black text-green-700">Selected / Ready</span>
                  <span>File Name: {fileInfo.name}</span>
                  <span>File Size: {formatFileSize(fileInfo.size)}</span>
                  <span>File Type: {fileInfo.type}</span>
                </div>
              )}

              {slug === 'word-to-pdf' && file && (
                <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-800">
                  Basic text, headings, lists, and images are preserved where possible. Complex Word layouts, fonts, columns, and page breaks may change in browser-based conversion.
                </p>
              )}

              {file && (
                <div className="min-h-[300px] w-full rounded-xl border border-black/10 bg-slate-50 p-3 md:min-h-[420px]">
                  <p className="mb-3 text-sm font-black text-black">Preview</p>
                  {isPreviewLoading && <div className="flex min-h-[300px] items-center justify-center text-sm font-bold text-black/55 md:min-h-[380px]"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating preview...</div>}
                  {!isPreviewLoading && showPdfInput && (
                    <div>
                      <iframe src={previewUrl} title="PDF Preview" className="min-h-[300px] w-full rounded-lg bg-white md:min-h-[420px]" />
                      {slug === 'unlock-pdf' && !output && <p className="mt-2 text-sm font-bold text-amber-700">This PDF is password protected. Enter the password to unlock and preview.</p>}
                      <p className="mt-2 text-xs font-semibold text-black/50">PDF preview is not supported in some browsers. You can still process and download the file.</p>
                    </div>
                  )}
                  {!isPreviewLoading && slug === 'word-to-pdf' && previewHtml && (
                    <div className="prose max-h-[500px] max-w-none overflow-auto rounded-lg bg-white p-4 text-black" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                  )}
                  {!isPreviewLoading && slug === 'word-to-pdf' && !previewHtml && <p className="p-4 text-sm font-semibold text-black/60">DOCX preview could not be generated, but you can still try converting.</p>}
                  {!isPreviewLoading && slug === 'resize-image' && previewUrl && <img src={previewUrl} alt="Original preview" title="Original image preview" loading="lazy" decoding="async" className="mx-auto max-h-[420px] max-w-full object-contain" />}
                </div>
              )}

              {slug === 'pdf-to-word' && textPreview && (
                <div className="rounded-md border border-black/10 bg-white p-4">
                  <p className="text-sm font-black text-black">Text preview from PDF</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-black/65">{textPreview}</p>
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-lg border border-black/10 bg-white p-5 shadow-sm lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-sm font-black uppercase tracking-wide text-black/50">Output</h2>
            <div className="mt-4 grid gap-2 rounded-md border border-black/10 bg-slate-50 p-4 text-sm font-semibold text-black/65">
              <span>Original: {formatFileSize(file?.size || 0)}</span>
              <span>Output: {formatFileSize(output?.size || 0)}</span>
              {slug === 'resize-image' && !output && <span>Estimated: {formatFileSize(estimatedImageSize)}</span>}
              {slug === 'resize-image' && <span>Original Dimensions: {originalDimensions.width || '-'} x {originalDimensions.height || '-'}</span>}
              {slug === 'resize-image' && <span>New Dimensions: {imageOptions.width} x {imageOptions.height}</span>}
            </div>
            <button type="submit" disabled={!file || processing} className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-black px-5 py-3 text-sm font-black text-white hover:bg-black/85 disabled:cursor-not-allowed disabled:bg-black/25">
              {processing ? <Loader2 className="h-4 w-4 animate-spin text-brand-red" /> : <Wand2 className="h-4 w-4 text-brand-red" />}
              {processing ? definition.loading : definition.action}
            </button>
            <button type="button" onClick={() => output && downloadBlob(output, filename)} disabled={!output} className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-5 py-3 text-sm font-black text-black hover:border-black/40 disabled:cursor-not-allowed disabled:text-black/30">
              <Download className="h-4 w-4 text-brand-red" /> Download
            </button>
            {slug === 'word-to-pdf' && (
              <button type="button" onClick={resetTool} disabled={!file && !output} className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-5 py-3 text-sm font-black text-black hover:border-black/40 disabled:cursor-not-allowed disabled:text-black/30">
                <RotateCcw className="h-4 w-4 text-brand-red" /> Reset
              </button>
            )}
            {error && <p className="mt-4 flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700"><AlertCircle className="h-4 w-4 flex-none" />{error}</p>}
            {status && !error && <p className="mt-4 flex gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-700"><CheckCircle2 className="h-4 w-4 flex-none" />{status}</p>}
            {showOutputPdf && <iframe title="Output PDF preview" src={outputUrl} className="mt-4 min-h-[300px] w-full rounded-lg border border-black/10 md:min-h-[420px]" />}
            {previewType === 'image' && <img src={outputUrl} alt="Resized preview" title="Processed image preview" loading="lazy" decoding="async" className="mt-4 max-h-72 w-full rounded-md border border-black/10 object-contain" />}
            {(slug === 'protect-pdf' || slug === 'unlock-pdf') && <ShieldCheck className="mx-auto mt-5 h-6 w-6 text-brand-red" />}
          </aside>
        </form>
      </div>
      <ToolSeoSections seo={seo} />
    </section>
  );
}
