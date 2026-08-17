const fs = require('fs');
const path = require('path');

const desktopGit = 'C:\\Users\\HP\\Desktop\\.git';
if (fs.existsSync(desktopGit)) {
  fs.rmSync(desktopGit, { recursive: true, force: true });
  console.log('Cleaned up accidental Desktop/.git');
} else {
  console.log('No Desktop/.git found.');
}
