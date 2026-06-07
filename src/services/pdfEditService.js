import parsePageRange from '../utils/pageRangeParser.js';

function positionFor(page, position, width, height) {
  const margin = 24;
  const positions = {
    center: [(page.getWidth() - width) / 2, (page.getHeight() - height) / 2],
    'top-left': [margin, page.getHeight() - height - margin],
    'top-right': [page.getWidth() - width - margin, page.getHeight() - height - margin],
    'bottom-left': [margin, margin],
    'bottom-right': [page.getWidth() - width - margin, margin],
  };
  return positions[position] || positions.center;
}

export async function watermarkPdf(file, options) {
  const { PDFDocument, StandardFonts, degrees, rgb } = await import('pdf-lib');
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  const pages = pdf.getPages();
  const selected = new Set(parsePageRange(options.pages, pages.length, true));
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  let image;
  if (options.imageFile) {
    const bytes = await options.imageFile.arrayBuffer();
    image = options.imageFile.type === 'image/png' ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
  }

  pages.forEach((page, index) => {
    if (!selected.has(index + 1)) return;
    if (options.text) {
      const size = Number(options.fontSize);
      const width = font.widthOfTextAtSize(options.text, size);
      const draw = (x, y) => page.drawText(options.text, { x, y, size, font, opacity: Number(options.opacity), rotate: degrees(Number(options.rotation)), color: rgb(0.35, 0.35, 0.35) });
      if (options.position === 'tiled') {
        for (let y = 40; y < page.getHeight(); y += 130) for (let x = 20; x < page.getWidth(); x += Math.max(180, width + 50)) draw(x, y);
      } else {
        const [x, y] = positionFor(page, options.position, width, size);
        draw(x, y);
      }
    }
    if (image) {
      const scale = Number(options.imageSize) / image.width;
      const width = image.width * scale;
      const height = image.height * scale;
      const [x, y] = positionFor(page, options.position === 'tiled' ? 'center' : options.position, width, height);
      page.drawImage(image, { x, y, width, height, opacity: Number(options.opacity) });
    }
  });
  return new Blob([await pdf.save()], { type: 'application/pdf' });
}
