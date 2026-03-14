import { mkdir, readdir, stat } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import yazl from 'yazl';

const builds = [
  {
    sourceDir: resolve('dist/chromium'),
    outputFile: resolve('packages/AutoCoupon-Chromium.zip'),
  },
  {
    sourceDir: resolve('dist/firefox'),
    outputFile: resolve('packages/AutoCoupon-Firefox.zip'),
  },
];

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = join(directory, entry.name);
      if (entry.isDirectory()) {
        return listFiles(absolutePath);
      }
      return [absolutePath];
    })
  );

  return files.flat();
}

async function ensureDirectory(path) {
  await mkdir(path, { recursive: true });
}

async function zipDirectory(sourceDir, outputFile) {
  const fileStats = await stat(sourceDir).catch(() => null);

  if (!fileStats?.isDirectory()) {
    throw new Error(`Build output not found: ${sourceDir}`);
  }

  const zipFile = new yazl.ZipFile();
  const outputStream = createWriteStream(outputFile);
  const files = await listFiles(sourceDir);

  for (const file of files) {
    zipFile.addFile(file, relative(sourceDir, file));
  }

  zipFile.end();

  await new Promise((resolvePromise, rejectPromise) => {
    zipFile.outputStream.pipe(outputStream);
    outputStream.on('close', resolvePromise);
    outputStream.on('error', rejectPromise);
  });
}

await ensureDirectory(resolve('packages'));

for (const build of builds) {
  await zipDirectory(build.sourceDir, build.outputFile);
  console.log(`Created ${relative(process.cwd(), build.outputFile)}`);
}
