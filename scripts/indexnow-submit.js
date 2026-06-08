import https from 'https';
import fs from 'node:fs';

const indexNowKey = 'd92b1289a7ab4225bf45772ebe918a3b';
const sitemapPath = new URL('../public/sitemap.xml', import.meta.url);
const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const urlList = [...sitemap.matchAll(/<loc>(https:\/\/www\.filewalatool\.com\/[^<]*)<\/loc>/g)]
  .map((match) => match[1])
  .filter((url, index, urls) => urls.indexOf(url) === index);

const payload = JSON.stringify({
  host: 'www.filewalatool.com',
  key: indexNowKey,
  keyLocation: `https://www.filewalatool.com/${indexNowKey}.txt`,
  urlList,
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
