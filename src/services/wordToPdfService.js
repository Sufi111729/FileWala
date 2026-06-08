export async function convertWordToPdf(file, previewElement) {
  const mammoth = (await import('mammoth')).default;
  const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
  if (!result.value.trim()) throw new Error('No readable content was found in this DOCX file.');
  const renderTarget = previewElement || document.createElement('div');
  renderTarget.innerHTML = result.value;
  if (!previewElement) {
    renderTarget.style.position = 'fixed';
    renderTarget.style.left = '-10000px';
    renderTarget.style.width = '794px';
    renderTarget.style.background = '#ffffff';
    renderTarget.style.color = '#000000';
    renderTarget.style.padding = '32px';
    document.body.appendChild(renderTarget);
  }
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  try {
    const canvas = await html2canvas(renderTarget, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;
    const imageHeight = (canvas.height * contentWidth) / canvas.width;
    const imageData = canvas.toDataURL('image/jpeg', 0.95);
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

    return pdf.output('blob');
  } finally {
    if (!previewElement) renderTarget.remove();
  }
}
