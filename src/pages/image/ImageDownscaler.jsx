import ImageScaleTool from '../../components/tools/ImageScaleTool.jsx';

const presets = [
  { id: '50', label: '50%', scale: 0.5 },
  { id: '75', label: '75%', scale: 0.75 },
  { id: '1920', label: 'Max width 1920px', maxWidth: 1920 },
  { id: '1280', label: 'Max width 1280px', maxWidth: 1280 },
  { id: '800', label: 'Max width 800px', maxWidth: 800 },
  { id: 'custom', label: 'Custom width/height' },
];

export default function ImageDownscaler() {
  return (
    <ImageScaleTool
      mode="downscale"
      title="Image Downscaler"
      description="Reduce image dimensions in your browser with canvas resizing."
      presets={presets}
      filenamePrefix="downscaled"
    />
  );
}
