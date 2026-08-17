const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const userProfile = process.env.USERPROFILE || 'C:\\Users\\HP';
const sshDir = path.join(userProfile, '.ssh');

console.log('1. Checking SSH keys in:', sshDir);
if (fs.existsSync(sshDir)) {
  console.log('SSH directory contents:', fs.readdirSync(sshDir));
} else {
  console.log('No .ssh directory found.');
}

console.log('2. Checking for gh (GitHub CLI)...');
try {
  const ghVer = execSync('gh --version').toString();
  console.log('GitHub CLI is installed:', ghVer.split('\n')[0]);
} catch (e) {
  console.log('GitHub CLI not found.');
}

console.log('3. Checking Git Credential Helper...');
try {
  const gitExe = 'C:\\Users\\HP\\Desktop\\Smartflow\\bin\\git\\cmd\\git.exe';
  const helper = execSync(`"${gitExe}" config --global credential.helper`).toString();
  console.log('Global credential helper:', helper.trim());
} catch (e) {
  console.log('No global credential helper set.');
}
