const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\HP\\Desktop\\Smartflow\\bin';
const targetExe = path.join(targetDir, 'cloudflared.exe');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const get = (targetUrl) => {
      https.get(targetUrl, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          get(res.headers.location);
        } else if (res.statusCode === 200) {
          res.pipe(file);
          file.on('finish', () => file.close(resolve));
        } else {
          reject(new Error(`Download failed with status: ${res.statusCode}`));
        }
      }).on('error', reject);
    };
    get(url);
  });
};

const run = async () => {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  console.log('Downloading cloudflared.exe from Cloudflare CDN...');
  const url = 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe';
  await download(url, targetExe);
  console.log('Downloaded cloudflared.exe successfully to:', targetExe);
};

run().catch(console.error);
