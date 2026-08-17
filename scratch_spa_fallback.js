const fs = require('fs');
const path = require('path');

const distIndex = 'C:\\Users\\HP\\Desktop\\Smartflow\\client\\dist\\index.html';
const dist200 = 'C:\\Users\\HP\\Desktop\\Smartflow\\client\\dist\\200.html';

if (fs.existsSync(distIndex)) {
  fs.copyFileSync(distIndex, dist200);
  console.log('Created client/dist/200.html for SPA routing fallback');
} else {
  console.log('client/dist/index.html not found, building client first...');
}
