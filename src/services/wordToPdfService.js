import mammoth from 'mammoth';

export async function convertWordToPdf(file, previewElement) {
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
  const html2pdf = (await import('html2pdf.js')).default;
  try {
    return await html2pdf().set({
      margin: 12,
      filename: 'converted.pdf',
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
    }).from(renderTarget).outputPdf('blob');
  } finally {
    if (!previewElement) renderTarget.remove();
  }
}
