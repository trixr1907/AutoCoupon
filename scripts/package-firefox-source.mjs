import { createWriteStream } from 'node:fs';
import { mkdir, readFile, readdir, stat } from 'node:fs/promises';
import { basename, join, relative, resolve } from 'node:path';
import yazl from 'yazl';

const packageJson = JSON.parse(
  await readFile(resolve('package.json'), 'utf8')
);

const packageVersion = packageJson.version;
const outputDirectory = resolve('packages/firefox-source');
const outputFile = resolve(
  outputDirectory,
  `autocoupon-firefox-source-${packageVersion}.zip`
);

const includedRootFiles = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'vitest.config.ts',
  'eslint.config.mjs',
  'README.md',
  'LICENSE',
  'CONTRIBUTING.md',
  'env.d.ts',
  '.gitignore',
  '.prettierrc',
  '.editorconfig',
];

const includedDirectories = [
  '.github',
  'docs',
  'public',
  'scripts',
  'src',
  'tests',
];

const excludedDirectoryNames = new Set([
  '.git',
  '.cache',
  '.vscode',
  'dist',
  'node_modules',
  'packages',
]);

async function listFiles(inputPath) {
  const fileStats = await stat(inputPath).catch(() => null);
  if (!fileStats) {
    return [];
  }

  if (fileStats.isFile()) {
    return [inputPath];
  }

  const entries = await readdir(inputPath, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      if (excludedDirectoryNames.has(entry.name)) {
        return [];
      }

      return listFiles(join(inputPath, entry.name));
    })
  );

  return nestedFiles.flat();
}

async function zipFiles(files, destination) {
  await mkdir(outputDirectory, { recursive: true });

  const zipFile = new yazl.ZipFile();
  const outputStream = createWriteStream(destination);

  for (const file of files) {
    const archivePath = relative(process.cwd(), file);
    zipFile.addFile(file, archivePath);
  }

  zipFile.end();

  await new Promise((resolvePromise, rejectPromise) => {
    zipFile.outputStream.pipe(outputStream);
    outputStream.on('close', resolvePromise);
    outputStream.on('error', rejectPromise);
  });
}

const filesToZip = [
  ...(await Promise.all(includedRootFiles.map((file) => listFiles(resolve(file)))))
    .flat(),
  ...(await Promise.all(
    includedDirectories.map((directory) => listFiles(resolve(directory)))
  )).flat(),
].sort((left, right) => left.localeCompare(right));

await zipFiles(filesToZip, outputFile);

console.log(`Created ${relative(process.cwd(), outputFile)}`);
console.log(`Included ${filesToZip.length} files in ${basename(outputFile)}`);
