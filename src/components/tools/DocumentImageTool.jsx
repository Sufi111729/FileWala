import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '../../i18n.jsx';
import FixedFrameImageEditor from './FixedFrameImageEditor.jsx';
import ImageEditor from './ImageEditor.jsx';
import RequirementStep from './RequirementStep.jsx';
import StepTabs from './StepTabs.jsx';
import ToolPageLayout from '../layouts/ToolPageLayout.jsx';
import UploadStep from './UploadStep.jsx';
import { getToolSeoBySlug } from '../../data/toolsSeoData.js';

const steps = ['Upload', 'Requirement', 'Editor'];

export default function DocumentImageTool({ config }) {
  const { text } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [values, setValues] = useState(config.defaultValues || {});

  useEffect(() => () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  const handleFileReady = (selectedFile, imageSize) => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(selectedFile);
    setDimensions(imageSize);
    setImageUrl(URL.createObjectURL(selectedFile));
  };

  const removeFile = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(null);
    setImageUrl('');
    setDimensions({ width: 0, height: 0 });
    setActiveStep(0);
  };

  const canGoNext = activeStep === 0 ? Boolean(file) : true;

  const seoSlug = config.output?.filename
    ?.replace('.jpg', '')
    .replace('aadhaar-photo', 'aadhaar-photo-resize')
    .replace('pan-photo', 'pan-photo-resize')
    .replace('passport-photo', 'passport-photo-maker')
    .replace('signature', 'signature-resize')
    .replace('scanned-document', 'document-scanner');
  const seo = getToolSeoBySlug(seoSlug);
  const translatedTool = text.tools?.[seoSlug] ?? [config.title, config.description];
  const pageTitle = translatedTool[0];
  const pageDescription = translatedTool[1];

  return (
    <ToolPageLayout title={pageTitle} description={pageDescription} seo={seo}>
        <div>
          <StepTabs steps={text.documentTool.steps} activeStep={activeStep} />
        </div>

        <div className="mt-5">
          {activeStep === 0 && (
            <UploadStep
              file={file}
              previewUrl={imageUrl}
              dimensions={dimensions}
              onFileReady={handleFileReady}
              onRemove={removeFile}
            />
          )}

          {activeStep === 1 && (
            <RequirementStep
              title={config.requirementsTitle}
              fields={config.fields}
              requirements={config.requirements}
              values={values}
              onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))}
            />
          )}

          {activeStep === 2 && file && config.editorType === 'fixed-frame' && (
            <FixedFrameImageEditor
              file={file}
              imageUrl={imageUrl}
              title={pageTitle}
              requirementsTitle={config.requirementsTitle}
              requirements={config.requirements}
              output={config.output}
              cropAspect={config.cropAspect}
              outputWidth={config.outputWidth}
              outputHeight={config.outputHeight}
              targetKB={config.targetKB}
              backgroundColor={config.backgroundColor}
              toolType={config.title}
            />
          )}

          {activeStep === 2 && file && config.editorType !== 'fixed-frame' && (
            <ImageEditor
              file={file}
              imageUrl={imageUrl}
              title={pageTitle}
              output={config.output}
              cropAspect={config.cropAspect}
              outputWidth={config.outputWidth}
              outputHeight={config.outputHeight}
              targetKB={config.targetKB}
              showMakeWhite={config.showMakeWhite}
              showScannerFilters={config.showScannerFilters}
            />
          )}
        </div>

        <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => setActiveStep((step) => Math.max(0, step - 1))}
            disabled={activeStep === 0}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 py-2.5 text-sm font-bold text-black/70 shadow-sm hover:bg-black/[0.025] disabled:cursor-not-allowed disabled:text-black/25"
          >
            <ArrowLeft className="h-4 w-4" />
            {text.common.previous}
          </button>
          <button
            type="button"
            onClick={() => setActiveStep((step) => Math.min(2, step + 1))}
            disabled={activeStep === 2 || !canGoNext}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {text.common.next}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
    </ToolPageLayout>
  );
}
