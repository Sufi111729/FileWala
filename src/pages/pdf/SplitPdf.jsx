import PdfToolPanel from './PdfToolPanel.jsx';

export default function SplitPdf() {
  return (
    <PdfToolPanel
      title="Split PDF"
      description="Extract selected pages from your PDF into a new file."
      tool="split"
    />
  );
}
