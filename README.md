# FileWalaTool

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-lightgrey?style=for-the-badge)

FileWalaTool is a React and Vite web app for everyday online file utilities, including PDF tools, image compression, photo resizing, passport/document preparation, resume creation, and browser-based file workflows. It is built as a fast, SEO-ready single-page application with privacy-minded processing wherever possible.

## Live Demo

https://www.filewalatool.com

## Features

### PDF Tools

- Merge PDF
- Split PDF
- Compress PDF
- PDF Rotate
- PDF Page Delete
- PDF to JPG
- Image to PDF
- PDF to Word
- Word to PDF
- Protect PDF
- Unlock PDF
- Watermark PDF

Dedicated browser workflows are currently implemented for merge, split, compress, rotate, and page delete. Converter/security tools are present in the tool library and generic tool route structure, with some advanced conversions marked in code as requiring additional frontend conversion/rendering libraries.

### Image Tools

- Compress Image
- Custom KB Resizer
- Image to 20KB
- Image to 50KB
- Image to 100KB
- Image Resizer
- Crop Image
- JPG to PNG
- PNG to JPG
- Background Remover
- Image Upscaler
- Image Downscaler

Image compression and KB-target resizing run in the browser using canvas-based processing.

### Document Tools

- Passport Photo Maker
- Signature Resize
- Aadhaar Photo Resize
- PAN Photo Resize
- Resume Builder
- Document Scanner

Document photo tools include upload, requirements, crop/editor, preview, and export flows for common form-upload needs.

### SEO & Performance

- Route-level code splitting with `React.lazy()` and `Suspense`
- Reusable SEO component with title, description, canonical, Open Graph, Twitter Card, and JSON-LD support
- Tool-level SEO data in `src/data/toolsSeoData.js`
- `sitemap.xml` and `robots.txt`
- Vite production chunk optimization
- Dynamic loading for heavy PDF/export libraries where practical
- Optimized displayed logo asset for faster initial loading

### Privacy-Friendly Browser Processing

Many image, PDF, and document operations are designed to run in the user's browser. Users should still review files before processing sensitive documents and verify outputs before official submission.

## Tech Stack

- React 19
- Vite 7
- Tailwind CSS
- React Router
- JavaScript
- `react-helmet-async` for metadata
- `lucide-react` for icons
- `pdf-lib` for browser-side PDF operations
- `html2canvas` and `jspdf` for resume PDF export
- Optional Google Drive and Dropbox picker integrations

## Project Structure

```text
FileWalaTool/
|-- public/
|   |-- assets/
|   |-- robots.txt
|   |-- sitemap.xml
|   `-- site.webmanifest
|-- src/
|   |-- assets/
|   |-- components/
|   |   |-- layouts/
|   |   |-- navigation/
|   |   |-- seo/
|   |   `-- tools/
|   |-- data/
|   |-- layouts/
|   |-- pages/
|   |   |-- compress/
|   |   |-- documents/
|   |   |-- legal/
|   |   `-- pdf/
|   |-- utils/
|   |-- App.jsx
|   |-- i18n.jsx
|   |-- main.jsx
|   `-- styles.css
|-- index.html
|-- package.json
|-- tailwind.config.js
|-- vercel.json
`-- vite.config.js
```

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The app will run locally using Vite's development server.

## Build for Production

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Environment Variables

Basic local development does not require environment variables.

Optional cloud picker integrations use the following variables from `.env.example`:

```env
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_GOOGLE_CLIENT_ID=your_google_oauth_web_client_id
VITE_DROPBOX_APP_KEY=your_dropbox_app_key
```

If these values are not provided, local file upload workflows still work.

## SEO Setup

FileWalaTool uses a scalable SEO setup for the official domain:

```text
https://www.filewalatool.com
```

SEO-related files and features:

- `src/components/seo/SeoHelmet.jsx` for page metadata
- `src/components/seo/schema.js` for structured data
- `src/data/toolsSeoData.js` for per-tool SEO content and keyword groups
- `public/sitemap.xml` for indexable URLs
- `public/robots.txt` with sitemap reference
- Canonical URLs using the production domain
- Open Graph and Twitter Card metadata
- JSON-LD schema for WebSite, Organization, SoftwareApplication, FAQPage, and BreadcrumbList

## Performance Notes

The app includes several performance-focused choices:

- Lazy-loaded route pages in `src/App.jsx`
- Lazy-loaded footer and homepage tool grid
- Vite manual chunking for React, icons, and PDF tooling
- Dynamic imports for heavy PDF/export libraries such as `pdf-lib`, `html2canvas`, and `jspdf`
- Optimized displayed logo asset in `public/assets/logofilewalatoo-538.png`
- Tailwind CSS configured to scan `index.html` and `src/**/*.{js,jsx}` for production CSS output

## Deployment

The project is ready for Vercel deployment.

Recommended Vercel settings:

```text
Build command: npm run build
Output directory: dist
Install command: npm install
```

`vercel.json` includes:

- SPA rewrite to `index.html` for React Router routes
- Long-lived cache headers for files under `/assets`

## Contribution Guide

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes.
4. Run the project locally and verify affected routes/tools.
5. Commit with a clear message.
6. Open a pull request with a short summary and testing notes.

For tool changes, keep browser privacy, mobile usability, SEO metadata, and route stability in mind.

## Roadmap

- Improve PDF compression quality and controls
- Add more document and form-preparation tools
- Expand multilingual content coverage
- Add batch processing for supported tools
- Improve advanced converter implementations where additional frontend libraries are needed

## Disclaimer

FileWalaTool is a utility platform for preparing files, images, PDFs, and document uploads. Users should verify final files, dimensions, quality, and size requirements before submitting them to government, education, job, business, or other official portals.

## License

This project is currently private/proprietary unless a license is added.
