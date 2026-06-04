import https from 'https';

const payload = JSON.stringify({
  host: 'www.filewalatool.com',
  key: 'd92b1289a7ab4225bf45772ebe918a3b',
  keyLocation: 'https://www.filewalatool.com/d92b1289a7ab4225bf45772ebe918a3b.txt',
  urlList: [
    'https://www.filewalatool.com/',
    'https://www.filewalatool.com/merge-pdf',
    'https://www.filewalatool.com/split-pdf',
    'https://www.filewalatool.com/compress-pdf',
    'https://www.filewalatool.com/image-to-pdf',
    'https://www.filewalatool.com/pdf-to-jpg',
    'https://www.filewalatool.com/pdf-rotate',
    'https://www.filewalatool.com/pdf-page-delete',
    'https://www.filewalatool.com/jpg-to-png',
    'https://www.filewalatool.com/png-to-jpg',
    'https://www.filewalatool.com/kb-resizer',
    'https://www.filewalatool.com/image-upscaler',
    'https://www.filewalatool.com/image-downscaler',
    'https://www.filewalatool.com/background-remover',
    'https://www.filewalatool.com/passport-photo-maker',
    'https://www.filewalatool.com/aadhaar-photo-resize',
    'https://www.filewalatool.com/pan-photo-resize',
    'https://www.filewalatool.com/signature-resize',
    'https://www.filewalatool.com/resume-builder',
    'https://www.filewalatool.com/document-scanner',
    'https://www.filewalatool.com/about-us',
    'https://www.filewalatool.com/contact-us',
  ],
});

const options = {
  hostname: 'api.indexnow.org',
  path: '/IndexNow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  },
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('IndexNow status:', res.statusCode);
    console.log('Response:', data || 'No response body');

    if (res.statusCode === 200) {
      console.log('IndexNow URLs submitted successfully.');
    }
  });
});

req.on('error', (error) => {
  console.error('IndexNow request failed:', error);
  process.exitCode = 1;
});

req.write(payload);
req.end();
