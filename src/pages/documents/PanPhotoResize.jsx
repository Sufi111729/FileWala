import PhotoResizeTool from '../../components/tools/PhotoResizeTool.jsx';

export default function PanPhotoResize() {
  return (
    <PhotoResizeTool
      title="PAN Photo Resize"
      description="Resize PAN card photos for online upload."
      requirementTitle="PAN Photo Requirements"
      requirements={[
        'Dimensions: 213 × 213 px',
        'File Format: JPEG',
        'File Size: Maximum 50 KB',
        'Background: Plain white or light background',
        'Appearance: Clear recent color photo',
      ]}
      cropRatio={1}
      outputWidth={213}
      outputHeight={213}
      targetKB={50}
      filename="pan-photo.jpg"
    />
  );
}
