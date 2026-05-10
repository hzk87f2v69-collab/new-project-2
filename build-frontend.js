const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const frontendDir = path.join(__dirname, 'frontend');
const publicDir = path.join(__dirname, 'public');

// Helper to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clean dist directory if it exists
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

// Create dist directory
fs.mkdirSync(distDir);

// Copy frontend files to dist root
console.log('Copying frontend files...');
copyDir(frontendDir, distDir);

// Copy public files to dist/public
console.log('Copying public assets...');
const distPublicDir = path.join(distDir, 'public');
copyDir(publicDir, distPublicDir);

console.log('Frontend build complete. Output is in /dist');
