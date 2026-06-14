import PhotoResizeTool from '../../components/tools/PhotoResizeTool.jsx';

export default function PassportPhotoMaker() {
  return (
    <PhotoResizeTool
      title="Passport Photo"
      description="Create passport-size photos for online applications."
      requirementTitle="Passport Photo Requirements"
      requirements={[
        'Dimensions: 3.5 cm × 2.5 cm',
        'Resolution: 200 DPI',
        'File Format: JPEG',
        'File Size: Maximum 50 KB',
        'Background: Plain white or light background',
        'Appearance: Color photo, recent, and taken with a neutral expression',
      ]}
      cropRatio={2.5 / 3.5}
      outputWidth={250}
      outputHeight={350}
      targetKB={50}
      filename="passport-photo.jpg"
      fields={[
        { name: 'website', label: 'Application Website', options: ['UTI', 'NSDL'] },
        { name: 'type', label: 'Photo type', options: ['Photograph'] },
        { name: 'resize', label: 'Resize', options: ['Resize Original', 'Resize Selected Area'] },
      ]}
      defaultValues={{ website: 'NSDL', type: 'Photograph', resize: 'Resize Selected Area' }}
    />
  );
}
