import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const AboutUs = lazy(() => import('./pages/legal/AboutUs.jsx'));
const ContactUs = lazy(() => import('./pages/legal/ContactUs.jsx'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy.jsx'));
const TermsConditions = lazy(() => import('./pages/legal/TermsConditions.jsx'));
const CompressTools = lazy(() => import('./pages/compress/CompressTools.jsx'));
const CustomImageKBResizer = lazy(() => import('./pages/compress/CustomImageKBResizer.jsx'));
const ImageCompressor = lazy(() => import('./pages/compress/ImageCompressor.jsx'));
const ImageTo100KB = lazy(() => import('./pages/compress/ImageTo100KB.jsx'));
const ImageTo20KB = lazy(() => import('./pages/compress/ImageTo20KB.jsx'));
const ImageTo50KB = lazy(() => import('./pages/compress/ImageTo50KB.jsx'));
const AadhaarPhotoResize = lazy(() => import('./pages/documents/AadhaarPhotoResize.jsx'));
const DocumentScanner = lazy(() => import('./pages/documents/DocumentScanner.jsx'));
const PanPhotoResize = lazy(() => import('./pages/documents/PanPhotoResize.jsx'));
const PassportPhotoMaker = lazy(() => import('./pages/documents/PassportPhotoMaker.jsx'));
const ResumeBuilder = lazy(() => import('./pages/documents/ResumeBuilder.jsx'));
const SignatureResize = lazy(() => import('./pages/documents/SignatureResize.jsx'));
const ViewDocuments = lazy(() => import('./pages/documents/ViewDocuments.jsx'));
const CompressPdf = lazy(() => import('./pages/pdf/CompressPdf.jsx'));
const MergePdf = lazy(() => import('./pages/pdf/MergePdf.jsx'));
const PdfPageDelete = lazy(() => import('./pages/pdf/PdfPageDelete.jsx'));
const PdfRotate = lazy(() => import('./pages/pdf/PdfRotate.jsx'));
const SplitPdf = lazy(() => import('./pages/pdf/SplitPdf.jsx'));
const ToolPage = lazy(() => import('./pages/ToolPage.jsx'));

function PageLoader() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm font-bold text-black/60 sm:px-6 lg:px-8">
        Loading...
      </div>
    </section>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsConditions />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/compress" element={<CompressTools />} />
          <Route path="/compress/image-compressor" element={<ImageCompressor />} />
          <Route path="/compress/image-to-20kb" element={<ImageTo20KB />} />
          <Route path="/compress/image-to-50kb" element={<ImageTo50KB />} />
          <Route path="/compress/image-to-100kb" element={<ImageTo100KB />} />
          <Route path="/compress/custom-image-kb-resizer" element={<CustomImageKBResizer />} />
          <Route path="/documents" element={<ViewDocuments />} />
          <Route path="/documents/passport-photo-maker" element={<PassportPhotoMaker />} />
          <Route path="/documents/signature-resize" element={<SignatureResize />} />
          <Route path="/documents/aadhaar-photo-resize" element={<AadhaarPhotoResize />} />
          <Route path="/documents/pan-photo-resize" element={<PanPhotoResize />} />
          <Route path="/documents/resume-builder" element={<ResumeBuilder />} />
          <Route path="/documents/document-scanner" element={<DocumentScanner />} />
          <Route path="/pdf-tools/merge-pdf" element={<MergePdf />} />
          <Route path="/pdf-tools/split-pdf" element={<SplitPdf />} />
          <Route path="/pdf-tools/compress-pdf" element={<CompressPdf />} />
          <Route path="/pdf-tools/pdf-page-delete" element={<PdfPageDelete />} />
          <Route path="/pdf-tools/pdf-rotate" element={<PdfRotate />} />
          <Route path="/tools/merge-pdf" element={<MergePdf />} />
          <Route path="/tools/split-pdf" element={<SplitPdf />} />
          <Route path="/tools/compress-pdf" element={<CompressPdf />} />
          <Route path="/tools/pdf-page-delete" element={<PdfPageDelete />} />
          <Route path="/tools/rotate-pdf" element={<PdfRotate />} />
          <Route path="/compress/pdf-compressor" element={<CompressPdf />} />
          <Route path="/tools/compress-image" element={<ImageCompressor />} />
          <Route path="/tools/photo-to-20kb" element={<ImageTo20KB />} />
          <Route path="/tools/photo-to-50kb" element={<ImageTo50KB />} />
          <Route path="/tools/photo-to-100kb" element={<ImageTo100KB />} />
          <Route path="/tools/image-kb-resizer" element={<CustomImageKBResizer />} />
          <Route path="/tools/:slug" element={<ToolPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
