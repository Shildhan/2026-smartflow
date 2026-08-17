const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetDir = 'C:\\Users\\HP\\Desktop\\Smartflow\\bin\\git';
const zipPath = 'C:\\Users\\HP\\Desktop\\Smartflow\\mingit.zip';

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
  console.log('Downloading MinGit portable (approx 25MB)...');
  const url = 'https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/MinGit-2.44.0-64-bit.zip';
  await download(url, zipPath);
  console.log('Downloaded MinGit zip successfully. Extracting...');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Extract using Windows PowerShell Expand-Archive
  execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${targetDir}' -Force"`);
  console.log('MinGit extracted successfully to:', targetDir);

  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  const gitExe = path.join(targetDir, 'cmd', 'git.exe');
  if (fs.existsSync(gitExe)) {
    console.log('Git executable ready at:', gitExe);
    const version = execSync(`"${gitExe}" --version`).toString();
    console.log('Git Version:', version.trim());
  }
};

run().catch(console.error);
