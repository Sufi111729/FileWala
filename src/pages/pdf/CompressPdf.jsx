import PdfToolPanel from './PdfToolPanel.jsx';

export default function CompressPdf() {
  return (
    <PdfToolPanel
      title="Compress PDF"
      description="Reduce PDF file size with basic browser-side optimization."
      tool="compress"
    />
  );
}
