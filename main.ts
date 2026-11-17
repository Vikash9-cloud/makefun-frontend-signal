import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The grader supplies /output; the override keeps local builds in the project.
const destination = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
const screenshots = (await readdir('screenshots')).filter(name => !name.startsWith('.'));
if (screenshots.length !== 3) throw new Error('Exactly three screenshots are required');
await mkdir(destination, { recursive: true });
for (const directory of ['app', 'screenshots']) {
  await rm(resolve(destination, directory), { recursive: true, force: true });
  await cp(directory, resolve(destination, directory), { recursive: true });
}
const dossier = buildDossier(destination, {
  text_max_bytes: 163840,
  screenshots: { max: 3, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
  app_path_max_bytes: 1000,
});
await writeFile(resolve(destination, 'dossier.json'), dossier);
console.log(`Built Signal in ${destination}`);
