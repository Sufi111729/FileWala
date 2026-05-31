import { lazy, Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import Home from './pages/Home.jsx';

const CategoryToolsPage = lazy(() => import('./pages/CategoryToolsPage.jsx'));
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
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm font-bold text-black/60 sm:px-6 lg:px-8">
        Loading...
      </div>
    </section>
  );
}

function RouteView({ children }) {
  const location = useLocation();

  return (
    <ErrorBoundary resetKey={location.pathname}>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<RouteView><Home /></RouteView>} />
        <Route path="/pdf-tools" element={<RouteView><CategoryToolsPage category="PDF Tools" /></RouteView>} />
        <Route path="/image-tools" element={<RouteView><CategoryToolsPage category="Image Tools" /></RouteView>} />
        <Route path="/privacy-policy" element={<RouteView><PrivacyPolicy /></RouteView>} />
        <Route path="/terms-and-conditions" element={<RouteView><TermsConditions /></RouteView>} />
        <Route path="/about-us" element={<RouteView><AboutUs /></RouteView>} />
        <Route path="/contact-us" element={<RouteView><ContactUs /></RouteView>} />
        <Route path="/compress" element={<RouteView><CompressTools /></RouteView>} />
        <Route path="/compress/image-compressor" element={<RouteView><ImageCompressor /></RouteView>} />
        <Route path="/compress/image-to-20kb" element={<RouteView><ImageTo20KB /></RouteView>} />
        <Route path="/compress/image-to-50kb" element={<RouteView><ImageTo50KB /></RouteView>} />
        <Route path="/compress/image-to-100kb" element={<RouteView><ImageTo100KB /></RouteView>} />
        <Route path="/compress/custom-image-kb-resizer" element={<RouteView><CustomImageKBResizer /></RouteView>} />
        <Route path="/documents" element={<RouteView><ViewDocuments /></RouteView>} />
        <Route path="/documents/passport-photo-maker" element={<RouteView><PassportPhotoMaker /></RouteView>} />
        <Route path="/documents/signature-resize" element={<RouteView><SignatureResize /></RouteView>} />
        <Route path="/documents/aadhaar-photo-resize" element={<RouteView><AadhaarPhotoResize /></RouteView>} />
        <Route path="/documents/pan-photo-resize" element={<RouteView><PanPhotoResize /></RouteView>} />
        <Route path="/documents/resume-builder" element={<RouteView><ResumeBuilder /></RouteView>} />
        <Route path="/documents/document-scanner" element={<RouteView><DocumentScanner /></RouteView>} />
        <Route path="/pdf-tools/merge-pdf" element={<RouteView><MergePdf /></RouteView>} />
        <Route path="/pdf-tools/split-pdf" element={<RouteView><SplitPdf /></RouteView>} />
        <Route path="/pdf-tools/compress-pdf" element={<RouteView><CompressPdf /></RouteView>} />
        <Route path="/pdf-tools/pdf-page-delete" element={<RouteView><PdfPageDelete /></RouteView>} />
        <Route path="/pdf-tools/pdf-rotate" element={<RouteView><PdfRotate /></RouteView>} />
        <Route path="/tools/merge-pdf" element={<RouteView><MergePdf /></RouteView>} />
        <Route path="/tools/split-pdf" element={<RouteView><SplitPdf /></RouteView>} />
        <Route path="/tools/compress-pdf" element={<RouteView><CompressPdf /></RouteView>} />
        <Route path="/tools/pdf-page-delete" element={<RouteView><PdfPageDelete /></RouteView>} />
        <Route path="/tools/rotate-pdf" element={<RouteView><PdfRotate /></RouteView>} />
        <Route path="/compress/pdf-compressor" element={<RouteView><CompressPdf /></RouteView>} />
        <Route path="/tools/compress-image" element={<RouteView><ImageCompressor /></RouteView>} />
        <Route path="/tools/photo-to-20kb" element={<RouteView><ImageTo20KB /></RouteView>} />
        <Route path="/tools/photo-to-50kb" element={<RouteView><ImageTo50KB /></RouteView>} />
        <Route path="/tools/photo-to-100kb" element={<RouteView><ImageTo100KB /></RouteView>} />
        <Route path="/tools/image-kb-resizer" element={<RouteView><CustomImageKBResizer /></RouteView>} />
        <Route path="/tools/:slug" element={<RouteView><ToolPage /></RouteView>} />
      </Route>
    </Routes>
  );
}
