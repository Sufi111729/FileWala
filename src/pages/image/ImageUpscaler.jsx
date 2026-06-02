import ImageScaleTool from '../../components/tools/ImageScaleTool.jsx';

const presets = [
  { id: '2x', label: '2x', scale: 2 },
  { id: '3x', label: '3x', scale: 3 },
  { id: '4x', label: '4x', scale: 4 },
  { id: 'custom', label: 'Custom width/height' },
];

export default function ImageUpscaler() {
  return (
    <ImageScaleTool
      mode="upscale"
      title="Image Upscaler"
      description="Increase image dimensions in your browser with canvas resizing."
      presets={presets}
      filenamePrefix="upscaled"
    />
  );
}
