import { memo, useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n.jsx';
import mergePdfPreview from '../assets/tool-previews/marge pdf.png';
import splitPdfPreview from '../assets/tool-previews/split pdf.png';
import compressPdfPreview from '../assets/tool-previews/compress pdf.png';
import pdfToJpgPreview from '../assets/tool-previews/pdf to jpg.png';
import imageToPdfPreview from '../assets/tool-previews/img to pdf.png';
import pdfToWordPreview from '../assets/tool-previews/pdf to word.png';
import wordToPdfPreview from '../assets/tool-previews/word to pdf.png';
import protectPdfPreview from '../assets/tool-previews/protect pdf.png';
import unlockPdfPreview from '../assets/tool-previews/unlock pdf.png';
import pdfRotatePreview from '../assets/tool-previews/rotate pdf.png';
import pdfPageDeletePreview from '../assets/tool-previews/pdf page delete.png';
import watermarkPdfPreview from '../assets/tool-previews/watermark pdf.png';
import resizeImagePreview from '../assets/tool-previews/img resize.png';
import compressImagePreview from '../assets/tool-previews/compress img.png';
import imageKbResizerPreview from '../assets/tool-previews/kb resizer.png';
import cropImagePreview from '../assets/tool-previews/crop img.png';
import jpgToPngPreview from '../assets/tool-previews/jpg to png.png';
import pngToJpgPreview from '../assets/tool-previews/png to jpg.png';
import backgroundRemoverPreview from '../assets/tool-previews/background remover.png';
import imageUpscalerPreview from '../assets/tool-previews/img upplerscaling.png';
import imageDownscalerPreview from '../assets/tool-previews/img downscaling.png';
import passportPhotoMakerPreview from '../assets/tool-previews/passport photo maker.png';
import signatureResizePreview from '../assets/tool-previews/signature resizer.png';
import imageTo20kbPreview from '../assets/tool-previews/img 20 kb.png';
import imageTo50kbPreview from '../assets/tool-previews/img 50 kb.png';
import imageTo100kbPreview from '../assets/tool-previews/img 100kb.png';
import aadhaarPhotoResizePreview from '../assets/tool-previews/Aadhar photo resizer.png';
import panPhotoResizePreview from '../assets/tool-previews/pan photo resizer.png';
import resumeBuilderPreview from '../assets/tool-previews/resume builder.png';
import documentScannerPreview from '../assets/tool-previews/Doc scanner.png';

const toolPreviewImages = {
  'merge-pdf': mergePdfPreview,
  'split-pdf': splitPdfPreview,
  'compress-pdf': compressPdfPreview,
  'pdf-to-jpg': pdfToJpgPreview,
  'image-to-pdf': imageToPdfPreview,
  'pdf-to-word': pdfToWordPreview,
  'word-to-pdf': wordToPdfPreview,
  'protect-pdf': protectPdfPreview,
  'unlock-pdf': unlockPdfPreview,
  'rotate-pdf': pdfRotatePreview,
  'pdf-page-delete': pdfPageDeletePreview,
  'watermark-pdf': watermarkPdfPreview,
  'resize-image': resizeImagePreview,
  'compress-image': compressImagePreview,
  'image-kb-resizer': imageKbResizerPreview,
  'crop-image': cropImagePreview,
  'batch-image-cropper': cropImagePreview,
  'jpg-to-png': jpgToPngPreview,
  'png-to-jpg': pngToJpgPreview,
  'background-remover': backgroundRemoverPreview,
  'image-upscaler': imageUpscalerPreview,
  'image-downscaler': imageDownscalerPreview,
  'photo-to-20kb': imageTo20kbPreview,
  'photo-to-50kb': imageTo50kbPreview,
  'photo-to-100kb': imageTo100kbPreview,
  'passport-photo-maker': passportPhotoMakerPreview,
  'signature-resize': signatureResizePreview,
  'aadhaar-photo-resize': aadhaarPhotoResizePreview,
  'pan-photo-resize': panPhotoResizePreview,
  'resume-builder': resumeBuilderPreview,
  'document-scanner': documentScannerPreview,
};

const normalizePreviewKey = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const toolPreviewImagesByTitle = {
  'merge-pdf': mergePdfPreview,
  'split-pdf': splitPdfPreview,
  'compress-pdf': compressPdfPreview,
  'pdf-to-jpg': pdfToJpgPreview,
  'image-to-pdf': imageToPdfPreview,
  'pdf-to-word': pdfToWordPreview,
  'word-to-pdf': wordToPdfPreview,
  'protect-pdf': protectPdfPreview,
  'unlock-pdf': unlockPdfPreview,
  'pdf-rotate': pdfRotatePreview,
  'pdf-page-delete': pdfPageDeletePreview,
  'watermark-pdf': watermarkPdfPreview,
  'image-resizer': resizeImagePreview,
  'compress-image': compressImagePreview,
  'custom-kb-resizer': imageKbResizerPreview,
  'crop-image': cropImagePreview,
  'batch-image-cropper': cropImagePreview,
  'jpg-to-png': jpgToPngPreview,
  'png-to-jpg': pngToJpgPreview,
  'background-remover': backgroundRemoverPreview,
  'image-upscaler': imageUpscalerPreview,
  'image-downscaler': imageDownscalerPreview,
  'passport-photo-maker': passportPhotoMakerPreview,
  'signature-resize': signatureResizePreview,
  'image-to-20kb': imageTo20kbPreview,
  'image-to-50kb': imageTo50kbPreview,
  'image-to-100kb': imageTo100kbPreview,
  'aadhaar-photo-resize': aadhaarPhotoResizePreview,
  'pan-photo-resize': panPhotoResizePreview,
  'resume-builder': resumeBuilderPreview,
  'document-scanner': documentScannerPreview,
};

/* ── Color palette ────────────────────────────────── */
const cardColors = {
  Resize: {
    text: 'text-blue-700',
    softBg: 'bg-blue-50',
    border: 'hover:border-blue-300',
    ring: 'focus-visible:ring-blue-700',
    iconBg: 'group-hover:bg-blue-50',
  },
  Compress: {
    text: 'text-green-700',
    softBg: 'bg-green-50',
    border: 'hover:border-green-300',
    ring: 'focus-visible:ring-green-700',
    iconBg: 'group-hover:bg-green-50',
  },
  Convert: {
    text: 'text-orange-700',
    softBg: 'bg-orange-50',
    border: 'hover:border-orange-300',
    ring: 'focus-visible:ring-orange-700',
    iconBg: 'group-hover:bg-orange-50',
  },
  'PDF Tools': {
    text: 'text-red-700',
    softBg: 'bg-red-50',
    border: 'hover:border-red-300',
    ring: 'focus-visible:ring-red-700',
    iconBg: 'group-hover:bg-red-50',
  },
  'Image Tools': {
    text: 'text-purple-700',
    softBg: 'bg-purple-50',
    border: 'hover:border-purple-300',
    ring: 'focus-visible:ring-purple-700',
    iconBg: 'group-hover:bg-purple-50',
  },
  Documents: {
    text: 'text-cyan-700',
    softBg: 'bg-cyan-50',
    border: 'hover:border-cyan-300',
    ring: 'focus-visible:ring-cyan-700',
    iconBg: 'group-hover:bg-cyan-50',
  },
  'All Tools': {
    text: 'text-black',
    softBg: 'bg-black/5',
    border: 'hover:border-black',
    ring: 'focus-visible:ring-black',
    iconBg: 'group-hover:bg-black/5',
  },
  'Passport Tools': {
    text: 'text-cyan-700',
    softBg: 'bg-cyan-50',
    border: 'hover:border-cyan-300',
    ring: 'focus-visible:ring-cyan-700',
    iconBg: 'group-hover:bg-cyan-50',
  },
};

/* ── Tone definitions for previews ─────────────── */
const toneStyles = {
  pdf: { accent: '#ef4444', accent2: '#2563eb', soft: '#fee2e2', pale: '#fff7ed' },
  image: { accent: '#7c3aed', accent2: '#06b6d4', soft: '#ede9fe', pale: '#ecfeff' },
  resize: { accent: '#2563eb', accent2: '#7c3aed', soft: '#dbeafe', pale: '#f5f3ff' },
  compress: { accent: '#16a34a', accent2: '#0891b2', soft: '#dcfce7', pale: '#ecfeff' },
  convert: { accent: '#f97316', accent2: '#2563eb', soft: '#ffedd5', pale: '#eff6ff' },
  document: { accent: '#0891b2', accent2: '#2563eb', soft: '#cffafe', pale: '#eff6ff' },
};

/* ── Preview layout configuration ────────────────── */
const previewConfigs = {
  'merge-pdf': { layout: 'merge', tone: 'pdf', left: ['PDF', 'PDF'], right: 'PDF', badge: 'JOIN' },
  'split-pdf': { layout: 'split', tone: 'pdf', left: 'PDF', right: ['PDF', 'PDF', 'PDF'], badge: 'SPLIT' },
  'compress-pdf': { layout: 'compress-pdf', tone: 'pdf', left: 'PDF', right: 'PDF' },
  'pdf-to-jpg': { layout: 'pdf-to-jpg', tone: 'convert', left: 'PDF', right: 'JPG' },
  'image-to-pdf': { layout: 'image-to-pdf', tone: 'convert', left: 'IMG', right: 'PDF' },
  'pdf-to-word': { layout: 'pdf-to-word', tone: 'convert', left: 'PDF', right: 'DOC' },
  'word-to-pdf': { layout: 'word-to-pdf', tone: 'convert', left: 'DOC', right: 'PDF' },
  'protect-pdf': { layout: 'protect-pdf', tone: 'pdf', left: 'PDF', right: 'PDF' },
  'unlock-pdf': { layout: 'unlock-pdf', tone: 'pdf', left: 'PDF', right: 'PDF' },
  'rotate-pdf': { layout: 'rotate', tone: 'pdf', left: 'PDF', badge: '90' },
  'pdf-page-delete': { layout: 'delete', tone: 'pdf', left: 'PDF', badge: 'DEL' },
  'watermark-pdf': { layout: 'watermark', tone: 'pdf', left: 'PDF', badge: 'MARK' },
  'resize-image': { layout: 'resize', tone: 'image', left: 'IMG', right: 'IMG' },
  'compress-image': { layout: 'compress', tone: 'image', left: 'IMG', right: 'IMG', badge: 'KB' },
  'image-kb-resizer': { layout: 'target', tone: 'resize', left: 'IMG', badge: 'KB' },
  'crop-image': { layout: 'crop', tone: 'image', left: 'IMG' },
  'batch-image-cropper': { layout: 'batch-crop', tone: 'image', left: 'IMG', badge: '16:9' },
  'jpg-to-png': { layout: 'convert', tone: 'convert', left: 'JPG', right: 'PNG', leftKind: 'image', rightKind: 'image' },
  'png-to-jpg': { layout: 'convert', tone: 'convert', left: 'PNG', right: 'JPG', leftKind: 'image', rightKind: 'image' },
  'background-remover': { layout: 'transparent', tone: 'image', left: 'IMG', badge: 'BG' },
  'image-upscaler': { layout: 'upscale', tone: 'resize', left: 'IMG', right: '2X' },
  'image-downscaler': { layout: 'downscale', tone: 'resize', left: 'IMG', right: '50%' },
  'photo-to-20kb': { layout: 'target', tone: 'compress', left: 'PHOTO', badge: '20KB' },
  'photo-to-50kb': { layout: 'target', tone: 'compress', left: 'PHOTO', badge: '50KB' },
  'photo-to-100kb': { layout: 'target', tone: 'compress', left: 'PHOTO', badge: '100KB' },
  'passport-photo-maker': { layout: 'identity', tone: 'document', left: 'PHOTO', right: 'PASS' },
  'signature-resize': { layout: 'signature', tone: 'document', left: 'SIGN', right: 'SIGN' },
  'aadhaar-photo-resize': { layout: 'identity', tone: 'document', left: 'PHOTO', right: 'AAD' },
  'pan-photo-resize': { layout: 'identity', tone: 'document', left: 'PHOTO', right: 'PAN' },
  'resume-builder': { layout: 'resume', tone: 'document', left: 'CV', badge: 'PDF' },
  'document-scanner': { layout: 'scan', tone: 'document', left: 'DOC', badge: 'SCAN' },
};

/* ── Helper functions ────────────────────────────── */
function getPreviewType(tool) {
  if (tool.previewType) return tool.previewType;
  if (tool.groups?.includes('Compress') || tool.slug.includes('compress') || tool.slug.includes('kb')) return 'compress';
  if (tool.groups?.includes('Convert') || tool.slug.includes('-to-')) return 'convert';
  if (tool.category === 'PDF Tools' || tool.groups?.includes('PDF Tools')) return 'pdf';
  if (tool.groups?.includes('Documents') || tool.category === 'Passport Tools') return 'document';
  if (tool.slug.includes('background')) return 'transparent';
  if (tool.slug.includes('crop')) return 'crop';
  if (tool.groups?.includes('Resize') || tool.slug.includes('resize') || tool.slug.includes('upscale') || tool.slug.includes('downscale')) return 'resize';
  return 'image';
}

function getPreviewBackground(type) {
  const backgrounds = {
    compress: 'bg-gradient-to-br from-green-50 via-white to-emerald-50',
    convert: 'bg-gradient-to-br from-orange-50 via-white to-blue-50',
    crop: 'bg-gradient-to-br from-blue-50 via-white to-cyan-50',
    document: 'bg-gradient-to-br from-cyan-50 via-white to-blue-50',
    image: 'bg-gradient-to-br from-purple-50 via-white to-blue-50',
    pdf: 'bg-gradient-to-br from-red-50 via-white to-orange-50',
    resize: 'bg-gradient-to-br from-blue-50 via-white to-purple-50',
    transparent: 'bg-gradient-to-br from-purple-50 via-white to-cyan-50',
  };
  return backgrounds[type] ?? backgrounds.image;
}

function getDefaultPreviewConfig(type) {
  const defaults = {
    compress: { layout: 'compress', tone: 'compress', left: 'FILE', right: 'KB', badge: 'ZIP' },
    convert: { layout: 'convert', tone: 'convert', left: 'FILE', right: 'NEW' },
    crop: { layout: 'crop', tone: 'image', left: 'IMG' },
    document: { layout: 'scan', tone: 'document', left: 'DOC', badge: 'SCAN' },
    image: { layout: 'image', tone: 'image', left: 'IMG' },
    pdf: { layout: 'pdf', tone: 'pdf', left: 'PDF' },
    resize: { layout: 'resize', tone: 'resize', left: 'IMG', right: 'IMG' },
    transparent: { layout: 'transparent', tone: 'image', left: 'IMG', badge: 'BG' },
  };
  return defaults[type] ?? defaults.image;
}

/* ── Reusable SVG building blocks ──────────────── */

function DotGrid({ x, y, color, opacity = 0.18 }) {
  return (
    <g opacity={opacity}>
      {Array.from({ length: 12 }).map((_, index) => (
        <circle key={index} cx={x + (index % 4) * 12} cy={y + Math.floor(index / 4) * 12} r="2.5" fill={color} />
      ))}
    </g>
  );
}

function Badge({ x, y, label, color }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={label.length > 4 ? 58 : 46} height="24" rx="12" fill="#fff" opacity="0.96" />
      <text x={label.length > 4 ? 29 : 23} y="16" textAnchor="middle" fill={color} fontSize={label.length > 4 ? 10 : 11} fontWeight="900" fontFamily="Inter, Arial, sans-serif">
        {label}
      </text>
    </g>
  );
}

function OperationPill({ x, y, label, color }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="18" cy="18" r="18" fill="#fff" opacity="0.96" />
      <text x="18" y="25" textAnchor="middle" fill={color} fontSize="22" fontWeight="900" fontFamily="Inter, Arial, sans-serif">
        {label}
      </text>
    </g>
  );
}

function TargetBadge({ x, y, label, color }) {
  const width = label.length > 4 ? 54 : 46;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="3" y="7" width={width} height="32" rx="16" fill="#0f172a" opacity="0.08" />
      <rect width={width} height="32" rx="16" fill="#fff" opacity="0.98" />
      <text x={width / 2} y="21" textAnchor="middle" fill={color} fontSize={label.length > 4 ? 10 : 12} fontWeight="900" fontFamily="Inter, Arial, sans-serif">
        {label}
      </text>
    </g>
  );
}

function SizeBadge({ x, y, label, color }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="3" y="7" width="56" height="24" rx="12" fill="#0f172a" opacity="0.08" />
      <rect width="56" height="24" rx="12" fill="#fff" opacity="0.98" />
      <text x="28" y="16" textAnchor="middle" fill={color} fontSize="10" fontWeight="900" fontFamily="Inter, Arial, sans-serif">
        {label}
      </text>
    </g>
  );
}

function ArrowLine({ x1, y1, x2, y2 = y1, color, strokeWidth = 4, headSize = 10 }) {
  const startX = Number(x1);
  const startY = Number(y1);
  const endX = Number(x2);
  const endY = Number(y2);
  const isForward = endX >= startX;
  const direction = isForward ? 1 : -1;
  const safeHead = Math.max(7, Math.min(12, Number(headSize)));
  const lineEndX = endX - direction * safeHead;

  return (
    <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
      <line x1={startX} y1={startY} x2={lineEndX} y2={endY} strokeWidth={strokeWidth} />
      <path d={`M ${lineEndX} ${endY - safeHead * 0.7} L ${endX} ${endY} L ${lineEndX} ${endY + safeHead * 0.7}`} strokeWidth={strokeWidth} />
    </g>
  );
}

function LockIcon({ x, y, color, open, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <path d={open ? 'M 22 28 V 18 C 22 8, 36 8, 38 18' : 'M 16 28 V 18 C 16 5, 42 5, 42 18 V 28'} />
      <rect x="8" y="28" width="48" height="38" rx="11" fill="#fff" stroke={color} />
    </g>
  );
}

function DeleteMark({ x, y, color, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={color} strokeWidth="7" strokeLinecap="round">
      <path d="M 0 0 L 38 38" />
      <path d="M 38 0 L 0 38" />
    </g>
  );
}

function ScanCorners({ x, y, color, compact = false }) {
  const width = compact ? 58 : 154;
  const height = compact ? 66 : 122;
  const corner = compact ? 14 : 24;

  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round">
      <path d={`M 0 ${corner} V 0 H ${corner}`} />
      <path d={`M ${width - corner} 0 H ${width} V ${corner}`} />
      <path d={`M ${width} ${height - corner} V ${height} H ${width - corner}`} />
      <path d={`M ${corner} ${height} H 0 V ${height - corner}`} />
    </g>
  );
}

function GuideMark({ x, y, color, compact = false }) {
  const width = compact ? 42 : 52;
  const height = compact ? 44 : 62;

  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round">
      <rect x="0" y="0" width={width} height={height} rx="10" strokeDasharray="7 6" opacity="0.75" />
      <path d={`M ${width / 2} 10 V ${height - 10}`} opacity="0.35" />
      <path d={`M 10 ${height / 2} H ${width - 10}`} opacity="0.35" />
    </g>
  );
}

function ProcessCircle({ x, y, color, children }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ArrowLine x1="-4" y1="46" x2="60" y2="46" color={color} strokeWidth={4} headSize={8} />
      <circle cx="28" cy="24" r="24" fill="#fff" opacity="0.98" />
      <circle cx="28" cy="24" r="23" fill={color} opacity="0.1" />
      {children}
    </g>
  );
}

/* ── Preview layout components ───────────────────── */

function FileCard({ x, y, label, tone, scale = 1, rotate = 0 }) {
  const width = 74 * scale;
  const height = 94 * scale;
  const labelFont = label.length > 4 ? 11 : 16;

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate} ${width / 2} ${height / 2})`}>
      <rect x={3 * scale} y={8 * scale} width={width} height={height} rx={13 * scale} fill="#0f172a" opacity="0.1" />
      <rect width={width} height={height} rx={13 * scale} fill={tone.accent} />
      <path d={`M ${width - 25 * scale} 0 L ${width} ${25 * scale} L ${width - 25 * scale} ${25 * scale} Z`} fill="#fff" opacity="0.9" />
      <rect x={-8 * scale} y={14 * scale} width={50 * scale} height={24 * scale} rx={6 * scale} fill={tone.accent2} />
      <text x={17 * scale} y={31 * scale} textAnchor="middle" fill="#fff" fontSize={labelFont * scale} fontWeight="800" fontFamily="Inter, Arial, sans-serif">
        {label}
      </text>
      <path d={`M ${22 * scale} ${54 * scale} C ${32 * scale} ${30 * scale}, ${40 * scale} ${78 * scale}, ${57 * scale} ${60 * scale}`} fill="none" stroke="#fff" strokeWidth={4 * scale} strokeLinecap="round" opacity="0.9" />
      <rect x={18 * scale} y={72 * scale} width={38 * scale} height={4 * scale} rx={2 * scale} fill="#fff" opacity="0.44" />
      <rect x={18 * scale} y={82 * scale} width={28 * scale} height={4 * scale} rx={2 * scale} fill="#fff" opacity="0.34" />
    </g>
  );
}

function PdfStack({ x, y, label, tone, size }) {
  const scales = { large: 0.96, medium: 0.78, small: 0.64 };
  const scale = scales[size] ?? scales.small;
  const backOffset = size === 'large' ? 14 : 10;

  return (
    <g transform={`translate(${x} ${y})`}>
      <FileCard x={backOffset} y="6" label={label} tone={{ ...tone, accent: tone.soft }} scale={scale} rotate="-6" />
      <FileCard x="0" y="0" label={label} tone={tone} scale={scale} />
    </g>
  );
}

function ProtectedPdf({ x, y, label, tone }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <PdfStack x="0" y="0" label={label} tone={tone} size="medium" />
      <LockIcon x="12" y="42" color={tone.accent2} open={false} scale={0.58} />
    </g>
  );
}

function PageStack({ x, y, tone, count, compact = false }) {
  const scale = compact ? 0.62 : 0.76;
  const offsets = count === 3 ? [[16, 10], [8, 5], [0, 0]] : [[10, 6], [0, 0]];

  return (
    <g transform={`translate(${x} ${y})`}>
      {offsets.map(([dx, dy], index) => (
        <FileCard
          key={`${dx}-${dy}`}
          x={dx}
          y={dy}
          label="PDF"
          tone={{ ...tone, accent: index === offsets.length - 1 ? tone.accent : tone.soft }}
          scale={scale}
        />
      ))}
    </g>
  );
}

function WatermarkedPdf({ x, y, label, tone }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <FileCard x="0" y="0" label={label} tone={tone} scale={0.82} />
      <text x="34" y="70" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="900" fontFamily="Inter, Arial, sans-serif" opacity="0.55" transform="rotate(-18 34 70)">
        WM
      </text>
    </g>
  );
}

function ImageCard({ x, y, label, tone, size = 'medium', muted = false }) {
  const sizes = {
    small: [62, 54],
    medium: [76, 68],
    large: [98, 80],
  };
  const [width, height] = sizes[size] ?? sizes.medium;

  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="3" y="8" width={width} height={height} rx="14" fill="#0f172a" opacity="0.1" />
      <rect width={width} height={height} rx="14" fill="#fff" />
      <rect x="8" y="8" width={width - 16} height={height - 16} rx="10" fill={tone.soft} opacity={muted ? 0.55 : 1} />
      <circle cx={width - 22} cy="24" r="8" fill={tone.accent2} opacity={muted ? 0.35 : 0.75} />
      <path d={`M 12 ${height - 14} L ${width * 0.38} ${height * 0.52} L ${width * 0.58} ${height - 20} L ${width * 0.76} ${height * 0.42} L ${width - 10} ${height - 14} Z`} fill={tone.accent} opacity={muted ? 0.35 : 0.72} />
      <rect x="10" y="10" width={label.length > 3 ? 42 : 34} height="20" rx="5" fill={tone.accent2} />
      <text x={label.length > 3 ? 31 : 27} y="25" textAnchor="middle" fill="#fff" fontSize={label.length > 4 ? 8 : 11} fontWeight="800" fontFamily="Inter, Arial, sans-serif">
        {label}
      </text>
    </g>
  );
}

function PhotoOutputStack({ x, y, label, tone }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ImageCard x="-20" y="14" label={label} tone={tone} size="small" />
      <ImageCard x="6" y="0" label={label} tone={tone} size="medium" />
      <ImageCard x="-2" y="66" label={label} tone={tone} size="small" />
    </g>
  );
}

function PhotoInputStack({ x, y, label, tone }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ImageCard x="4" y="10" label="JPG" tone={tone} size="small" />
      <ImageCard x="34" y="0" label="PNG" tone={{ ...tone, accent: '#7c3aed', accent2: '#06b6d4' }} size="small" />
      <ImageCard x="18" y="62" label={label} tone={{ ...tone, accent: '#f97316', accent2: '#2563eb' }} size="small" />
    </g>
  );
}

function WordDocument({ x, y, label }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="4" y="8" width="72" height="98" rx="14" fill="#0f172a" opacity="0.1" />
      <rect width="72" height="98" rx="14" fill="#fff" />
      <path d="M 48 0 L 72 24 L 48 24 Z" fill="#dbeafe" />
      <rect x="-8" y="14" width="48" height="24" rx="7" fill="#2563eb" />
      <text x="16" y="31" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="900" fontFamily="Inter, Arial, sans-serif">
        {label}
      </text>
      <rect x="16" y="50" width="40" height="5" rx="2.5" fill="#2563eb" opacity="0.35" />
      <rect x="16" y="64" width="32" height="5" rx="2.5" fill="#0f172a" opacity="0.14" />
      <rect x="16" y="76" width="38" height="5" rx="2.5" fill="#0f172a" opacity="0.14" />
      <path d="M 19 88 L 24 93 L 34 82" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.72" />
    </g>
  );
}

function ResumeCard({ x, y, tone }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="3" y="8" width="92" height="108" rx="15" fill="#0f172a" opacity="0.1" />
      <rect width="92" height="108" rx="15" fill="#fff" />
      <circle cx="28" cy="30" r="13" fill={tone.soft} />
      <rect x="48" y="22" width="28" height="6" rx="3" fill={tone.accent2} opacity="0.85" />
      <rect x="48" y="34" width="22" height="5" rx="2.5" fill="#0f172a" opacity="0.12" />
      <rect x="18" y="58" width="56" height="5" rx="2.5" fill={tone.accent} opacity="0.28" />
      <rect x="18" y="72" width="48" height="5" rx="2.5" fill="#0f172a" opacity="0.12" />
      <rect x="18" y="86" width="58" height="5" rx="2.5" fill="#0f172a" opacity="0.12" />
    </g>
  );
}

function InputLines({ x, y, color }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="3" y="8" width="62" height="68" rx="14" fill="#0f172a" opacity="0.08" />
      <rect width="62" height="68" rx="14" fill="#fff" opacity="0.98" />
      <circle cx="20" cy="22" r="7" fill={color} opacity="0.75" />
      <rect x="34" y="17" width="18" height="5" rx="2.5" fill={color} opacity="0.55" />
      <rect x="14" y="40" width="36" height="5" rx="2.5" fill="#0f172a" opacity="0.12" />
      <rect x="14" y="52" width="28" height="5" rx="2.5" fill="#0f172a" opacity="0.12" />
    </g>
  );
}

function CheckerCard({ x, y, tone }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="3" y="8" width="78" height="78" rx="14" fill="#0f172a" opacity="0.1" />
      <rect width="78" height="78" rx="14" fill="#fff" />
      {Array.from({ length: 16 }).map((_, index) => (
        <rect
          key={index}
          x={8 + (index % 4) * 15}
          y={8 + Math.floor(index / 4) * 15}
          width="15"
          height="15"
          fill={index % 2 ? '#eef2ff' : '#fff'}
        />
      ))}
      <circle cx="40" cy="40" r="20" fill={tone.accent} opacity="0.72" />
    </g>
  );
}

function IdPhotoCard({ x, y, label, tone }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="3" y="8" width="58" height="82" rx="12" fill="#0f172a" opacity="0.1" />
      <rect width="58" height="82" rx="12" fill="#fff" />
      <rect x="8" y="8" width="42" height="50" rx="8" fill={tone.soft} />
      <circle cx="29" cy="25" r="10" fill={tone.accent2} opacity="0.72" />
      <path d="M 14 54 C 18 40, 40 40, 44 54" fill={tone.accent} opacity="0.7" />
      <rect x="10" y="64" width="38" height="12" rx="6" fill={tone.accent2} />
      <text x="29" y="73" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="900" fontFamily="Inter, Arial, sans-serif">
        {label}
      </text>
    </g>
  );
}

function SignatureCard({ x, y, label, tone, wide = false }) {
  const width = wide ? 86 : 68;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="3" y="8" width={width} height="42" rx="11" fill="#0f172a" opacity="0.1" />
      <rect width={width} height="42" rx="11" fill="#fff" />
      <path d={`M 14 26 C 22 8, 28 34, 38 18 C 48 5, 54 34, ${width - 12} 22`} fill="none" stroke={tone.accent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="10" y="8" width={label.length > 4 ? 42 : 34} height="15" rx="5" fill={tone.accent2} />
      <text x={label.length > 4 ? 31 : 27} y="19" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="900" fontFamily="Inter, Arial, sans-serif">
        {label}
      </text>
    </g>
  );
}

function RawDocument({ x, y, tone }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-7 36 46)`}>
      <rect x="4" y="8" width="72" height="92" rx="13" fill="#0f172a" opacity="0.1" />
      <rect width="72" height="92" rx="13" fill="#fff" />
      <rect x="12" y="16" width="48" height="54" rx="8" fill={tone.soft} opacity="0.72" />
      <path d="M 16 66 L 56 24" stroke={tone.accent} strokeWidth="5" strokeLinecap="round" opacity="0.28" />
      <rect x="14" y="76" width="42" height="5" rx="2.5" fill="#0f172a" opacity="0.12" />
    </g>
  );
}

function CleanDocument({ x, y, tone }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="4" y="8" width="72" height="92" rx="13" fill="#0f172a" opacity="0.1" />
      <rect width="72" height="92" rx="13" fill="#fff" />
      <rect x="12" y="16" width="48" height="38" rx="8" fill={tone.soft} />
      <rect x="14" y="64" width="44" height="5" rx="2.5" fill={tone.accent2} opacity="0.42" />
      <rect x="14" y="76" width="36" height="5" rx="2.5" fill="#0f172a" opacity="0.12" />
    </g>
  );
}

function PreviewEndpoint({ kind, x, y, label, tone }) {
  const fileLabels = ['PDF', 'DOC', 'CV', 'FILE'];
  const resolvedKind = kind ?? (fileLabels.includes(label) ? 'file' : 'image');

  if (resolvedKind === 'file') {
    return <FileCard x={x} y={y - 6} label={label} tone={tone} scale={0.82} />;
  }
  return <ImageCard x={x} y={y} label={label} tone={tone} />;
}

/* ── Flow graphics ──────────────────────────────── */

function MergeArrows({ color }) {
  return (
    <g fill="none" stroke={color} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 118 68 C 132 68, 142 78, 154 90" />
      <path d="M 118 112 C 132 112, 142 102, 154 90" />
      <ArrowLine x1="186" y1="90" x2="214" y2="90" color={color} strokeWidth={4.5} headSize={8} />
    </g>
  );
}

function SplitArrows({ color }) {
  return (
    <g fill="none" stroke={color} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
      <ArrowLine x1="124" y1="90" x2="166" y2="90" color={color} strokeWidth={4.5} headSize={8} />
      <path d="M 180 90 C 195 70, 205 54, 222 46" />
      <path d="M 180 90 H 224" />
      <path d="M 180 90 C 195 110, 205 128, 222 136" />
      <path d="M 212 40 L 222 46 L 211 52" />
      <path d="M 214 82 L 224 90 L 214 98" />
      <path d="M 211 130 L 222 136 L 212 144" />
    </g>
  );
}

function CompressFlow({ color }) {
  return (
    <g>
      <ArrowLine x1="136" y1="104" x2="202" y2="104" color={color} strokeWidth={4} headSize={9} />
      <g transform="translate(146 50)">
        <circle cx="20" cy="20" r="20" fill="#fff" opacity="0.98" />
        <circle cx="20" cy="20" r="19" fill={color} opacity="0.1" />
        <path d="M 10 12 L 18 20 L 10 28" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 30 12 L 22 20 L 30 28" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
}

function ConvertFlow({ color }) {
  return (
    <g>
      <ArrowLine x1="138" y1="104" x2="202" y2="104" color={color} strokeWidth={4} headSize={9} />
      <g transform="translate(146 52)">
        <circle cx="20" cy="18" r="18" fill="#fff" opacity="0.98" />
        <circle cx="20" cy="18" r="17" fill={color} opacity="0.1" />
        <path d="M 12 18 H 27 M 22 12 L 28 18 L 22 24" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
}

function SecurityFlow({ color, accent }) {
  return (
    <g>
      <ArrowLine x1="136" y1="104" x2="212" y2="104" color={color} />
      <ShieldCheckMark x="162" y="38" color={color} accent={accent} scale={0.72} />
    </g>
  );
}

function UnlockFlowGraphic({ color, accent }) {
  return (
    <g>
      <ArrowLine x1="136" y1="104" x2="212" y2="104" color={color} />
      <g transform="translate(162 42)">
        <circle cx="28" cy="28" r="28" fill="#fff" opacity="0.98" />
        <circle cx="28" cy="28" r="27" fill={color} opacity="0.1" />
        <LockIcon x="5" y="0" color={color} open scale={0.62} />
        <circle cx="48" cy="12" r="8" fill={accent} opacity="0.78" />
      </g>
    </g>
  );
}

function ShieldCheckMark({ x, y, color, accent, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M 28 0 L 54 10 V 30 C 54 48, 42 62, 28 68 C 14 62, 2 48, 2 30 V 10 Z" fill="#fff" opacity="0.98" />
      <path d="M 28 0 L 54 10 V 30 C 54 48, 42 62, 28 68 C 14 62, 2 48, 2 30 V 10 Z" fill={color} opacity="0.14" />
      <path d="M 18 34 L 26 42 L 40 24" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="10" r="8" fill={accent} opacity="0.78" />
    </g>
  );
}

function RotateProcess({ x, y, color }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="28" cy="24" r="24" fill="#fff" opacity="0.98" />
      <circle cx="28" cy="24" r="23" fill={color} opacity="0.1" />
      <g transform="translate(12 8)" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 8 18 C 12 6, 30 5, 37 15" />
        <path d="M 37 15 L 38 6 L 46 13" />
        <path d="M 42 28 C 36 40, 18 41, 10 31" opacity="0.55" />
      </g>
    </g>
  );
}

function RemoveProcess({ x, y, color, accent }) {
  return (
    <ProcessCircle x={x} y={y} color={accent}>
      <DeleteMark x="12" y="8" color={color} scale={0.7} />
    </ProcessCircle>
  );
}

function ApplyProcess({ x, y, label, color }) {
  return (
    <ProcessCircle x={x} y={y} color={color}>
      <text x="28" y="29" textAnchor="middle" fill={color} fontSize="13" fontWeight="900" fontFamily="Inter, Arial, sans-serif">
        {label}
      </text>
    </ProcessCircle>
  );
}

function ResizeProcess({ x, y, color, compact = false }) {
  return (
    <ProcessCircle x={x} y={y} color={color}>
      <g transform="translate(13 10)" fill="none" stroke={color} strokeWidth={compact ? 3 : 4} strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="6" width="24" height="20" rx="5" strokeDasharray="5 4" />
        <path d="M 0 0 L 12 0 M 0 0 L 0 12" />
        <path d="M 44 32 L 32 32 M 44 32 L 44 20" />
      </g>
    </ProcessCircle>
  );
}

function ScaleProcess({ x, y, color, label, shrink = false }) {
  return (
    <ProcessCircle x={x} y={y} color={color}>
      <text x="28" y="29" textAnchor="middle" fill={color} fontSize={label.length > 2 ? 11 : 13} fontWeight="900" fontFamily="Inter, Arial, sans-serif">
        {label}
      </text>
      <path d={shrink ? 'M 15 14 L 25 24 M 41 34 L 31 24' : 'M 25 24 L 14 13 M 31 24 L 42 13'} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    </ProcessCircle>
  );
}

function CropProcess({ x, y, color }) {
  return (
    <ProcessCircle x={x} y={y} color={color}>
      <g transform="translate(14 10)" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round">
        <path d="M 2 2 V 28 H 40" />
        <path d="M 16 -4 V 16 H 46" opacity="0.65" />
      </g>
    </ProcessCircle>
  );
}

function RemoveBgProcess({ x, y, color }) {
  return (
    <ProcessCircle x={x} y={y} color={color}>
      <g transform="translate(12 9)" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 4 24 L 24 4 L 40 20 L 20 40 Z" fill="#fff" />
        <path d="M 24 4 L 40 20" opacity="0.7" />
      </g>
    </ProcessCircle>
  );
}

function BuildProcess({ x, y, color }) {
  return (
    <ProcessCircle x={x} y={y} color={color}>
      <g transform="translate(14 10)" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 10 22 L 20 32 L 40 8" />
        <path d="M 8 8 H 28" opacity="0.45" />
      </g>
    </ProcessCircle>
  );
}

function ScanProcess({ x, y, color }) {
  return (
    <ProcessCircle x={x} y={y} color={color}>
      <ScanCorners x="11" y="5" color={color} compact />
      <path d="M 16 29 H 40" stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.65" />
    </ProcessCircle>
  );
}

/* ── Main preview rendering ─────────────────────── */

function renderPreviewLayout(config, tone) {
  switch (config.layout) {
    case 'merge':
      return (
        <>
          <FileCard x="42" y="34" label={config.left[0]} tone={tone} scale={0.62} rotate="-7" />
          <FileCard x="66" y="66" label={config.left[1]} tone={tone} scale={0.62} rotate="6" />
          <MergeArrows color={tone.accent2} />
          <OperationPill x="154" y="78" label="+" color={tone.accent2} />
          <FileCard x="224" y="42" label={config.right} tone={tone} scale={0.86} />
          <Badge x="224" y="126" label={config.badge} color={tone.accent2} />
        </>
      );
    case 'split':
      return (
        <>
          <FileCard x="42" y="44" label={config.left} tone={tone} scale={0.9} />
          <OperationPill x="144" y="78" label="/" color={tone.accent2} />
          <SplitArrows color={tone.accent2} />
          <FileCard x="226" y="22" label={config.right[0]} tone={tone} scale={0.48} />
          <FileCard x="236" y="72" label={config.right[1]} tone={tone} scale={0.48} />
          <FileCard x="226" y="122" label={config.right[2]} tone={tone} scale={0.48} />
        </>
      );
    case 'compress':
      return (
        <>
          <ImageCard x="50" y="42" label={config.left} tone={tone} size="large" />
          <CompressFlow color={tone.accent2} />
          <ImageCard x="226" y="62" label={config.right} tone={tone} size="small" />
          <Badge x="212" y="126" label={config.badge} color={tone.accent} />
        </>
      );
    case 'compress-pdf':
      return (
        <>
          <PdfStack x="42" y="38" label={config.left} tone={tone} size="large" />
          <SizeBadge x="52" y="126" label="2.4MB" color={tone.accent2} />
          <CompressFlow color={tone.accent2} />
          <PdfStack x="228" y="58" label={config.right} tone={tone} size="small" />
          <SizeBadge x="220" y="126" label="700KB" color={tone.accent} />
        </>
      );
    case 'convert':
      return (
        <>
          <PreviewEndpoint kind={config.leftKind} x="58" y="50" label={config.left} tone={tone} side="left" />
          <ArrowLine x1="138" y1="90" x2="190" y2="90" color={tone.accent2} />
          <PreviewEndpoint kind={config.rightKind} x="212" y="50" label={config.right} tone={tone} side="right" />
          {config.badge && <Badge x="216" y="122" label={config.badge} color={tone.accent} />}
        </>
      );
    case 'pdf-to-jpg':
      return (
        <>
          <PdfStack x="48" y="46" label={config.left} tone={{ ...tone, accent: '#ef4444', soft: '#fee2e2' }} size="medium" />
          <ConvertFlow color={tone.accent2} />
          <PhotoOutputStack x="218" y="42" label={config.right} tone={tone} />
        </>
      );
    case 'image-to-pdf':
      return (
        <>
          <PhotoInputStack x="42" y="42" label={config.left} tone={tone} />
          <ConvertFlow color={tone.accent2} />
          <PdfStack x="226" y="46" label={config.right} tone={{ ...tone, accent: '#ef4444', soft: '#fee2e2' }} size="medium" />
        </>
      );
    case 'pdf-to-word':
      return (
        <>
          <PdfStack x="52" y="46" label={config.left} tone={{ ...tone, accent: '#ef4444', soft: '#fee2e2' }} size="medium" />
          <ConvertFlow color={tone.accent2} />
          <WordDocument x="222" y="42" label={config.right} />
        </>
      );
    case 'word-to-pdf':
      return (
        <>
          <WordDocument x="54" y="42" label={config.left} />
          <ConvertFlow color={tone.accent2} />
          <PdfStack x="226" y="46" label={config.right} tone={{ ...tone, accent: '#ef4444', soft: '#fee2e2' }} size="medium" />
        </>
      );
    case 'protect-pdf':
      return (
        <>
          <PdfStack x="48" y="46" label={config.left} tone={tone} size="medium" />
          <SecurityFlow color={tone.accent2} accent={tone.accent} />
          <ProtectedPdf x="226" y="46" label={config.right} tone={tone} />
        </>
      );
    case 'unlock-pdf':
      return (
        <>
          <ProtectedPdf x="48" y="46" label={config.left} tone={tone} />
          <UnlockFlowGraphic color={tone.accent2} accent={tone.accent} />
          <PdfStack x="226" y="46" label={config.right} tone={tone} size="medium" />
        </>
      );
    case 'rotate':
      return (
        <>
          <FileCard x="48" y="44" label={config.left} tone={tone} scale={0.82} />
          <ArrowLine x1="134" y1="104" x2="208" y2="104" color={tone.accent2} />
          <RotateProcess x="142" y="54" color={tone.accent2} />
          <FileCard x="226" y="48" label={config.left} tone={tone} scale={0.82} rotate="90" />
          <Badge x="222" y="126" label={config.badge} color={tone.accent} />
        </>
      );
    case 'delete':
      return (
        <>
          <PageStack x="48" y="42" tone={tone} count={3} />
          <RemoveProcess x="144" y="66" color={tone.accent} accent={tone.accent2} />
          <PageStack x="222" y="48" tone={tone} count={2} compact />
          <Badge x="218" y="126" label={config.badge} color={tone.accent} />
        </>
      );
    case 'watermark':
      return (
        <>
          <FileCard x="54" y="44" label={config.left} tone={tone} scale={0.86} />
          <ApplyProcess x="146" y="66" label="WM" color={tone.accent2} />
          <WatermarkedPdf x="220" y="44" label={config.left} tone={tone} />
          <Badge x="208" y="128" label={config.badge} color={tone.accent2} />
        </>
      );
    case 'resize':
      return (
        <>
          <ImageCard x="52" y="50" label={config.left} tone={tone} size="medium" />
          <ResizeProcess x="144" y="64" color={tone.accent2} />
          <ImageCard x="218" y="56" label={config.right} tone={tone} size="small" />
        </>
      );
    case 'upscale':
      return (
        <>
          <ImageCard x="54" y="64" label={config.left} tone={tone} size="small" muted />
          <ScaleProcess x="144" y="66" color={tone.accent2} label="2X" />
          <ImageCard x="210" y="40" label={config.left} tone={tone} size="large" />
          <Badge x="206" y="124" label={config.right} color={tone.accent} />
        </>
      );
    case 'downscale':
      return (
        <>
          <ImageCard x="50" y="38" label={config.left} tone={tone} size="large" />
          <ScaleProcess x="146" y="66" color={tone.accent2} label="50%" shrink />
          <ImageCard x="226" y="66" label={config.left} tone={tone} size="small" />
          <Badge x="198" y="124" label={config.right} color={tone.accent} />
        </>
      );
    case 'target':
      return (
        <>
          <ImageCard x="54" y="50" label={config.left} tone={tone} />
          <ArrowLine x1="136" y1="104" x2="218" y2="104" color={tone.accent2} />
          <TargetBadge x="148" y="42" label={config.badge} color={tone.accent2} />
          <ImageCard x="236" y="62" label={config.badge} tone={tone} size="small" />
        </>
      );
    case 'crop':
      return (
        <>
          <ImageCard x="54" y="44" label={config.left} tone={tone} size="large" />
          <CropProcess x="142" y="62" color={tone.accent2} />
          <ImageCard x="222" y="60" label="CROP" tone={tone} size="small" />
        </>
      );
    case 'batch-crop':
      return (
        <>
          <ImageCard x="44" y="62" label={config.left} tone={tone} size="medium" muted />
          <ImageCard x="112" y="42" label={config.left} tone={tone} size="large" />
          <GuideMark x="130" y="54" color={tone.accent2} compact />
          <ImageCard x="224" y="66" label="CROP" tone={tone} size="small" />
          <Badge x="224" y="126" label={config.badge} color={tone.accent2} />
        </>
      );
    case 'transparent':
      return (
        <>
          <ImageCard x="54" y="46" label={config.left} tone={tone} />
          <RemoveBgProcess x="144" y="64" color={tone.accent2} />
          <CheckerCard x="216" y="50" tone={tone} />
        </>
      );
    case 'identity':
      return (
        <>
          <ImageCard x="46" y="48" label={config.left} tone={tone} />
          <ArrowLine x1="128" y1="104" x2="208" y2="104" color={tone.accent2} />
          <GuideMark x="138" y="36" color={tone.accent2} />
          <IdPhotoCard x="220" y="42" label={config.right} tone={tone} />
        </>
      );
    case 'signature':
      return (
        <>
          <SignatureCard x="48" y="62" label={config.left} tone={tone} wide />
          <ResizeProcess x="146" y="66" color={tone.accent2} compact />
          <SignatureCard x="214" y="70" label={config.right} tone={tone} />
        </>
      );
    case 'resume':
      return (
        <>
          <InputLines x="52" y="56" color={tone.accent2} />
          <BuildProcess x="142" y="66" color={tone.accent2} />
          <ResumeCard x="206" y="36" tone={tone} />
          <Badge x="208" y="126" label={config.badge} color={tone.accent2} />
        </>
      );
    case 'scan':
      return (
        <>
          <RawDocument x="54" y="48" tone={tone} />
          <ScanProcess x="140" y="56" color={tone.accent2} />
          <CleanDocument x="226" y="44" tone={tone} />
          <Badge x="222" y="126" label={config.badge} color={tone.accent2} />
        </>
      );
    case 'pdf':
      return <FileCard x="112" y="40" label={config.left} tone={tone} scale={1} />;
    case 'image':
    default:
      return <ImageCard x="92" y="42" label={config.left} tone={tone} size="large" />;
  }
}

function ToolPreviewSvg({ config, tone }) {
  return (
    <svg viewBox="0 0 320 180" width="320" height="180" className="h-full w-full" role="img" aria-hidden="true">
      <rect width="320" height="180" fill={tone.pale} opacity="0.82" />
      <circle cx="164" cy="90" r="72" fill={tone.soft} opacity="0.38" />
      <circle cx="36" cy="144" r="46" fill="#ffffff" opacity="0.52" />
      <circle cx="284" cy="28" r="54" fill="#ffffff" opacity="0.46" />
      <DotGrid x="28" y="24" color={tone.accent2} />
      <DotGrid x="248" y="136" color={tone.accent} opacity="0.24" />
      {renderPreviewLayout(config, tone)}
    </svg>
  );
}

function FallbackPreview({ tool, type }) {
  const config = previewConfigs[tool.slug] ?? getDefaultPreviewConfig(type);
  const tone = toneStyles[config.tone] ?? toneStyles.image;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <ToolPreviewSvg config={config} tone={tone} />
    </div>
  );
}

/* ── Main exported component ────────────────────── */

function useNearViewport(enabled) {
  const ref = useRef(null);
  const [isNearViewport, setIsNearViewport] = useState(enabled);

  useEffect(() => {
    if (enabled || isNearViewport) return undefined;

    const node = ref.current;
    if (!node) return undefined;

    if (!('IntersectionObserver' in window)) {
      setIsNearViewport(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '900px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, isNearViewport]);

  return [ref, isNearViewport];
}

function ToolCard({ tool, activeTab = 'All Tools', eagerPreview = false }) {
  const { text, tLiteral } = useLanguage();
  const Icon = tool.icon;
  const translatedTool = text.tools?.[tool.slug] ?? [tool.title, tool.description];
  const colorKey =
    activeTab === 'All Tools'
      ? tool.groups?.find((group) => cardColors[group]) ?? tool.category
      : activeTab;
  const color = cardColors[colorKey] ?? cardColors['All Tools'];
  const categoryLabel = (text.categories[tool.category] ?? tool.category).replace(' Tools', '');
  const previewBadge = tLiteral(tool.previewBadge ?? categoryLabel);
  const previewType = getPreviewType(tool);
  const resolvedPreviewImage = tool.previewImage || tool.preview || toolPreviewImages[tool.slug] || toolPreviewImagesByTitle[normalizePreviewKey(tool.title)];
  const previewAlt = tool.imageAlt || `${translatedTool[0]} online tool preview`;
  const previewTitle = tool.imageTitle || `${translatedTool[0]} - FileWalaTool`;
  const [previewRef, shouldRenderPreview] = useNearViewport(eagerPreview || Boolean(tool.previewImage));

  return (
    <Link
      to={tool.href ?? `/tools/${tool.slug}`}
      aria-label={`Open ${translatedTool[0]} tool`}
      className={`group block h-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.055)] ${color.border} focus:outline-none focus-visible:ring-2 ${color.ring} focus-visible:ring-offset-2`}
    >
      <div className="flex h-full flex-col">
        <div className="p-3 pb-0">
          <div ref={previewRef} className={`relative h-36 overflow-hidden rounded-xl border border-gray-100 bg-white sm:h-44 ${resolvedPreviewImage ? '' : getPreviewBackground(previewType)}`}>
            {shouldRenderPreview && resolvedPreviewImage ? (
              <img
                src={resolvedPreviewImage}
                alt={previewAlt}
                title={previewTitle}
                width="800"
                height="500"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            ) : shouldRenderPreview ? (
              <FallbackPreview tool={tool} type={previewType} />
            ) : null}
          </div>
          <p className="sr-only">{tool.imageCaption || translatedTool[1]}</p>
        </div>

        <div className="flex flex-1 flex-col p-5 pt-4">
          <div className="flex items-center justify-between gap-3">
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${color.softBg} ${color.text}`}>
              {previewBadge}
            </span>
            <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.035] ${color.text}`}>
              <Icon className="h-4 w-4" />
            </span>
          </div>

          <h3 className="mt-4 text-lg font-black leading-tight tracking-tight text-black">{translatedTool[0]}</h3>
          <p className="mt-2 flex-1 text-sm leading-6 text-black/60">{translatedTool[1]}</p>

          <span className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-900 active:scale-[0.98] group-focus-visible:ring-2 group-focus-visible:ring-red-500 group-focus-visible:ring-offset-2">
            {text.common.openTool}
            <ArrowRight className="h-4 w-4 text-white" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default memo(ToolCard);
