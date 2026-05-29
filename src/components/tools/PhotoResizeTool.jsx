import DocumentImageTool from './DocumentImageTool.jsx';

export default function PhotoResizeTool({
  title,
  description,
  requirementTitle,
  requirements,
  cropRatio,
  outputWidth,
  outputHeight,
  targetKB,
  filename,
  fields = [{ name: 'resize', label: 'Resize', options: ['Resize Selected Area', 'Resize Original'] }],
  defaultValues = { resize: 'Resize Selected Area' },
}) {
  return (
    <DocumentImageTool
      config={{
        title,
        description,
        editorType: 'fixed-frame',
        requirementsTitle: requirementTitle,
        fields,
        defaultValues,
        requirements,
        cropAspect: cropRatio,
        outputWidth,
        outputHeight,
        targetKB,
        output: { filename },
      }}
    />
  );
}
