const git = require('isomorphic-git');
const fs = require('fs');
const path = require('path');

const repoDir = path.resolve(__dirname, '..');

const run = async () => {
  console.log('1. Initializing Git repository in:', repoDir);
  await git.init({ fs, dir: repoDir, defaultBranch: 'main' });

  // Read .gitignore
  const gitignorePath = path.join(repoDir, '.gitignore');
  let ignoredPatterns = [];
  if (fs.existsSync(gitignorePath)) {
    ignoredPatterns = fs.readFileSync(gitignorePath, 'utf8')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'));
  }

  const shouldIgnore = (relPath) => {
    const norm = relPath.replace(/\\/g, '/');
    if (norm === '.git' || norm.startsWith('.git/')) return true;
    if (norm === 'node_modules' || norm.startsWith('node_modules/') || norm.includes('/node_modules/')) return true;
    if (norm === 'dist' || norm.startsWith('dist/') || norm.includes('/dist/')) return true;
    if (norm === '.env' || norm.endsWith('/.env')) return true;
    if (norm.startsWith('scratch') || norm.startsWith('.system_generated')) return true;
    return false;
  };

  const getFiles = (dir, base = '') => {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const relPath = base ? `${base}/${file}` : file;
      if (shouldIgnore(relPath)) continue;
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        results = results.concat(getFiles(fullPath, relPath));
      } else {
        results.push(relPath);
      }
    }
    return results;
  };

  const files = getFiles(repoDir);
  console.log(`2. Found ${files.length} project files to stage.`);

  for (const file of files) {
    await git.add({ fs, dir: repoDir, filepath: file });
  }
  console.log('3. All project files staged successfully.');

  const sha = await git.commit({
    fs,
    dir: repoDir,
    author: {
      name: 'SmartFlow Mobility Engine',
      email: 'admin@smartflow.gov.in',
    },
    message: 'SmartFlow Intelligent Traffic Management System: Complete codebase with database persistence, email validation, and advanced visualizations',
  });

  console.log('4. Commit created successfully! Commit SHA:', sha);
};

run().catch(console.error);
