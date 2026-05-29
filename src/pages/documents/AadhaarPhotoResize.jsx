import PhotoResizeTool from '../../components/tools/PhotoResizeTool.jsx';

export default function AadhaarPhotoResize() {
  return (
    <PhotoResizeTool
      title="Aadhaar Photo Resize"
      description="Resize Aadhaar card photos for online upload."
      requirementTitle="Aadhaar Photo Requirements"
      requirements={[
        'Dimensions: 213 × 213 px',
        'File Format: JPEG',
        'File Size: 10 KB to 100 KB',
        'Background: Plain white or light background',
        'Appearance: Clear recent color photo',
      ]}
      cropRatio={1}
      outputWidth={213}
      outputHeight={213}
      targetKB={100}
      filename="aadhaar-photo.jpg"
    />
  );
}
