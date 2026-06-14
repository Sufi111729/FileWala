import PhotoResizeTool from '../../components/tools/PhotoResizeTool.jsx';

export default function AadhaarPhotoResize() {
  return (
    <PhotoResizeTool
      title="Aadhaar Photo"
      description="Resize Aadhaar card photos for online upload."
      requirementTitle="Aadhaar Photo Requirements"
      requirements={[
        'Dimensions: 250 x 350 px',
        'File Format: JPEG',
        'File Size: 10 KB to 100 KB',
        'Background: Plain white or light background',
        'Appearance: Clear recent color photo',
      ]}
      cropRatio={250 / 350}
      outputWidth={250}
      outputHeight={350}
      targetKB={100}
      filename="aadhaar-photo.jpg"
    />
  );
}
