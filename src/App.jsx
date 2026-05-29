import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import CompressTools from './pages/compress/CompressTools.jsx';
import CustomImageKBResizer from './pages/compress/CustomImageKBResizer.jsx';
import ImageCompressor from './pages/compress/ImageCompressor.jsx';
import ImageTo100KB from './pages/compress/ImageTo100KB.jsx';
import ImageTo20KB from './pages/compress/ImageTo20KB.jsx';
import ImageTo50KB from './pages/compress/ImageTo50KB.jsx';
import AadhaarPhotoResize from './pages/documents/AadhaarPhotoResize.jsx';
import DocumentScanner from './pages/documents/DocumentScanner.jsx';
import PanPhotoResize from './pages/documents/PanPhotoResize.jsx';
import PassportPhotoMaker from './pages/documents/PassportPhotoMaker.jsx';
import ResumeBuilder from './pages/documents/ResumeBuilder.jsx';
import SignatureResize from './pages/documents/SignatureResize.jsx';
import ViewDocuments from './pages/documents/ViewDocuments.jsx';
import Home from './pages/Home.jsx';
import AboutUs from './pages/legal/AboutUs.jsx';
import ContactUs from './pages/legal/ContactUs.jsx';
import PrivacyPolicy from './pages/legal/PrivacyPolicy.jsx';
import TermsConditions from './pages/legal/TermsConditions.jsx';
import CompressPdf from './pages/pdf/CompressPdf.jsx';
import MergePdf from './pages/pdf/MergePdf.jsx';
import PdfPageDelete from './pages/pdf/PdfPageDelete.jsx';
import PdfRotate from './pages/pdf/PdfRotate.jsx';
import SplitPdf from './pages/pdf/SplitPdf.jsx';
import ToolPage from './pages/ToolPage.jsx';

export default function App() {
  return (
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
  );
}
