import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

const targets = ['coverage', 'dist', 'packages'];

for (const target of targets) {
  rmSync(resolve(process.cwd(), target), {
    force: true,
    recursive: true,
  });
}
