const MAX_RENDER_PIXELS = 20_000_000;

export async function convertWordToPdf(file, onProgress) {
  onProgress?.('Reading DOCX document...');
  const mammoth = (await import('mammoth')).default;
  const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
  if (!result.value.trim()) throw new Error('No readable content was found in this DOCX file.');
  const renderTarget = document.createElement('div');
  renderTarget.innerHTML = result.value;
  renderTarget.style.position = 'fixed';
  renderTarget.style.left = '-10000px';
  renderTarget.style.top = '0';
  renderTarget.style.width = '794px';
  renderTarget.style.background = '#ffffff';
  renderTarget.style.color = '#000000';
  renderTarget.style.padding = '32px';
  renderTarget.style.fontFamily = 'Arial, sans-serif';
  renderTarget.style.lineHeight = '1.5';
  renderTarget.style.overflow = 'visible';
  document.body.appendChild(renderTarget);

  onProgress?.('Preparing PDF layout...');
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  try {
    const basePixels = Math.max(1, renderTarget.scrollWidth * renderTarget.scrollHeight);
    const renderScale = Math.min(2, Math.max(0.75, Math.sqrt(MAX_RENDER_PIXELS / basePixels)));
    onProgress?.('Rendering document pages...');
    const canvas = await html2canvas(renderTarget, {
      scale: renderScale,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      windowWidth: renderTarget.scrollWidth,
      windowHeight: renderTarget.scrollHeight,
    });
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;
    const imageHeight = (canvas.height * contentWidth) / canvas.width;
    const imageData = canvas.toDataURL('image/jpeg', 0.92);
    let y = margin;
    let remainingHeight = imageHeight;

    pdf.addImage(imageData, 'JPEG', margin, y, contentWidth, imageHeight);
    remainingHeight -= contentHeight;

    while (remainingHeight > 0) {
      y -= contentHeight;
      pdf.addPage();
      pdf.addImage(imageData, 'JPEG', margin, y, contentWidth, imageHeight);
      remainingHeight -= contentHeight;
    }

    onProgress?.('Finalizing PDF...');
    const blob = pdf.output('blob');
    canvas.width = 1;
    canvas.height = 1;
    return blob;
  } finally {
    renderTarget.remove();
  }
}
