import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const distDir = path.resolve('dist');
const ffDistDir = path.resolve('dist-firefox');
const ffManifest = path.resolve('public/manifest.firefox.json');

console.log('🦊 Building for Firefox...');

try {
  // 1. Ensure clean build
  console.log('Running Vite build...');
  execSync('npm run build', { stdio: 'inherit' });

  // 2. Prepare directory
  if (fs.existsSync(ffDistDir)) {
    fs.rmSync(ffDistDir, { recursive: true, force: true });
  }
  fs.mkdirSync(ffDistDir);

  // 3. Copy dist content
  console.log('Copying assets...');
  fs.cpSync(distDir, ffDistDir, { recursive: true });

  // 4. Overwrite manifest
  console.log('Applying Firefox manifest...');
  fs.copyFileSync(ffManifest, path.join(ffDistDir, 'manifest.json'));

  console.log('✅ Firefox build ready in ./dist-firefox');
} catch (e) {
  console.error('❌ Build failed:', e);
  process.exit(1);
}
