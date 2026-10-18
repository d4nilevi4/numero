import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = new URL('../dist/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const path of ['index.html', 'styles.css', 'assets', 'src']) {
  await cp(`${root}${path}`, new URL(path, output), { recursive: true });
}
await writeFile(new URL('.nojekyll', output), '');
console.log('Static site built in dist/ — ready for GitHub Pages.');
