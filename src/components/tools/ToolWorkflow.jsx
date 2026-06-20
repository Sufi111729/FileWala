import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  RotateCcw,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function ToolShell({
  eyebrow,
  title,
  description,
  breadcrumb = 'All tools',
  breadcrumbTo = '/',
  children,
  className = '',
}) {
  return (
    <section className={`bg-white py-4 sm:py-6 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-0">
        <div className="mb-4">
          <Link to={breadcrumbTo} className="focus-ring text-sm font-bold text-black/55 hover:text-black">
            {breadcrumb}
          </Link>
          {eyebrow && <p className="mt-3 text-xs font-black uppercase tracking-wide text-blue-700">{eyebrow}</p>}
          <h1 className="mt-1 text-2xl font-black tracking-tight text-black sm:text-3xl">{title}</h1>
          {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-black/60 sm:text-base">{description}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

export const CompactToolHeader = ({ eyebrow, title, description }) => (
  <div className="max-w-3xl">
    {eyebrow && <p className="text-xs font-black uppercase tracking-wide text-blue-700">{eyebrow}</p>}
    <h1 className="mt-1 text-2xl font-black tracking-tight text-black sm:text-3xl">{title}</h1>
    {description && <p className="mt-2 text-sm leading-6 text-black/60 sm:text-base">{description}</p>}
  </div>
);

export function SelectedFileCard({ file, files, label = 'File selected successfully', onRemove, onChange, meta }) {
  const list = files || (file ? [file] : []);
  if (!list.length) return null;
  const totalSize = list.reduce((sum, item) => sum + (item.size || 0), 0);
  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm shadow-sm">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-green-700" />
        <div className="min-w-0 flex-1">
          <p className="font-black text-green-800">{label}</p>
          <p className="mt-1 truncate font-bold text-black/75">
            {list.length === 1 ? list[0].name : `${list.length} files selected`}
          </p>
          <p className="mt-1 text-xs font-semibold text-black/55">
            {formatSize(totalSize)}{list.length === 1 && list[0].type ? ` - ${list[0].type}` : ''}
          </p>
          {meta && <p className="mt-1 text-xs font-semibold text-black/55">{meta}</p>}
        </div>
        {(onRemove || onChange) && (
          <div className="flex flex-none gap-2">
            {onChange && (
              <button
                type="button"
                onClick={onChange}
                className="focus-ring inline-flex h-9 items-center justify-center rounded-md border border-green-200 bg-white px-3 text-xs font-black text-black hover:border-black/20"
              >
                Change
              </button>
            )}
            <button
              type="button"
              onClick={onRemove}
              className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-green-200 bg-white text-red-700 hover:border-red-200 hover:bg-red-50"
              aria-label="Remove selected file"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export const FileSelectedStatus = SelectedFileCard;

export function UniversalFilePicker({ children, className = '' }) {
  return (
    <div className={`rounded-md border border-black/10 bg-white p-3 shadow-sm sm:p-4 ${className}`}>
      {children}
    </div>
  );
}

export const FileUploadBox = UniversalFilePicker;

export function CompactPreview({ title = 'Preview', children, className = '' }) {
  return (
    <div className={`rounded-md border border-black/10 bg-white p-3 shadow-sm sm:p-4 ${className}`}>
      <h2 className="text-sm font-black uppercase tracking-wide text-black/50">{title}</h2>
      <div className="mt-3 max-h-[260px] overflow-auto sm:max-h-[340px]">{children}</div>
    </div>
  );
}

export const ToolPreviewCard = CompactPreview;

export function ToolSettingsAccordion({ title = 'Settings', children, className = '', defaultOpen = true }) {
  return (
    <details className={`rounded-md border border-black/10 bg-white shadow-sm ${className}`} open={defaultOpen}>
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black uppercase tracking-wide text-black/55 marker:hidden">
        {title}
      </summary>
      <div className="border-t border-black/5 p-4">{children}</div>
    </details>
  );
}

export const ToolSettingsPanel = ToolSettingsAccordion;

export function ProcessingState({ text = 'Processing...' }) {
  return (
    <p className="flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-800">
      <Loader2 className="h-4 w-4 animate-spin" />
      {text}
    </p>
  );
}

export function ErrorState({ children }) {
  if (!children) return null;
  return (
    <p className="flex gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
      {children}
    </p>
  );
}

export function ToolResultCard({ title = 'Output ready', fileName, fileSize, children }) {
  return (
    <div className="rounded-md border border-green-200 bg-green-50 p-4">
      <p className="flex items-center gap-2 font-black text-green-800">
        <CheckCircle2 className="h-5 w-5" />
        {title || 'Done! Your file is ready.'}
      </p>
      {fileName && <p className="mt-2 truncate text-sm font-bold text-black/75">{fileName}</p>}
      {fileSize && <p className="mt-1 text-xs font-semibold text-black/55">{fileSize}</p>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function StickyDesktopActionPanel({
  primaryLabel,
  onPrimary,
  primaryDisabled,
  processing,
  processingLabel = 'Processing...',
  downloadLabel = 'Download',
  onDownload,
  downloadDisabled = true,
  onReset,
  resetDisabled,
  helperText,
  done,
  children,
  tone = 'blue',
}) {
  const primaryClass = tone === 'green'
    ? 'bg-black hover:bg-black/85 disabled:bg-black/25'
    : 'bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300';
  const iconColor = tone === 'green' ? 'text-green-400' : 'text-white';

  const actionIsAvailable = !primaryDisabled || primaryLabel === 'Select File';

  return (
    <aside className="hidden rounded-md border border-black/10 bg-white p-4 shadow-sm lg:sticky lg:top-[90px] lg:block lg:self-start">
      {children}
      {helperText && <p className="mb-3 text-sm font-semibold leading-6 text-black/55">{helperText}</p>}
      <button
        type="button"
        onClick={onPrimary}
        disabled={!actionIsAvailable || processing}
        className={`focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-black text-white transition-colors disabled:cursor-not-allowed ${primaryClass}`}
      >
        {processing ? <Loader2 className={`h-4 w-4 animate-spin ${iconColor}`} /> : <UploadCloud className={`h-4 w-4 ${iconColor}`} />}
        {processing ? processingLabel : primaryLabel}
      </button>
      {onDownload && (
        <button
          type="button"
          onClick={onDownload}
          disabled={downloadDisabled}
          className={`focus-ring mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-black transition-colors disabled:cursor-not-allowed ${
            done && !downloadDisabled
              ? 'bg-green-700 text-white hover:bg-green-800 disabled:bg-green-200'
              : 'border border-black/10 bg-white text-black hover:border-black/35 disabled:text-black/30'
          }`}
        >
          <Download className="h-4 w-4" />
          {downloadLabel}
        </button>
      )}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          disabled={resetDisabled}
          className="focus-ring mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-5 py-3 text-sm font-black text-black hover:border-black/35 disabled:cursor-not-allowed disabled:text-black/30"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      )}
    </aside>
  );
}

export const ToolActionPanel = StickyDesktopActionPanel;

export function StickyMobileActionBar({
  primaryLabel,
  onPrimary,
  primaryDisabled,
  processing,
  processingLabel = 'Processing...',
  downloadLabel = 'Download',
  onDownload,
  downloadDisabled = true,
  onReset,
  resetDisabled,
  helperText,
  done,
}) {
  const actionIsAvailable = !primaryDisabled || primaryLabel === 'Select File';

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.10)] backdrop-blur lg:hidden" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      {helperText && <p className="mb-2 truncate text-xs font-bold text-black/55">{helperText}</p>}
      <div className="flex gap-2">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            disabled={resetDisabled}
            className="focus-ring inline-flex h-12 w-12 flex-none items-center justify-center rounded-md border border-black/10 bg-white text-black disabled:text-black/25"
            aria-label="Reset"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        )}
        <button
          type="button"
          onClick={done && onDownload ? onDownload : onPrimary}
          disabled={done && onDownload ? downloadDisabled : !actionIsAvailable || processing}
          className={`focus-ring inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed ${
            done && onDownload && !downloadDisabled ? 'bg-green-700 hover:bg-green-800 disabled:bg-green-200' : 'bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300'
          }`}
        >
          {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : done && onDownload ? <Download className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          {processing ? processingLabel : done && onDownload ? downloadLabel : primaryLabel}
        </button>
      </div>
    </div>
  );
}

export const ToolPageLayout = ToolShell;
export const StickyActionBar = StickyMobileActionBar;
export const ResultSummaryCard = ToolResultCard;
