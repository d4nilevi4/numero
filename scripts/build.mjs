import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = new URL('../dist/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const path of ['index.html', 'styles.css', 'assets', 'src']) {
  await cp(`${root}${path}`, new URL(path, output), { recursive: true });
}

// Pages caches individual files. Version the whole module graph together so an
// updated HTML page cannot import an older pronunciation table from the cache.
const modules = (await readdir(new URL('src/', output))).filter((name) => name.endsWith('.js')).sort();
const paths = ['index.html', 'styles.css', ...modules.map((name) => `src/${name}`)];
const contents = await Promise.all(paths.map((path) => readFile(new URL(path, output), 'utf8')));
const version = createHash('sha256').update(JSON.stringify(contents)).digest('hex').slice(0, 12);

for (const name of modules) {
  const path = new URL(`src/${name}`, output);
  const content = await readFile(path, 'utf8');
  await writeFile(path, content.replace(/(from\s+['"])(\.\/[^'"]+\.js)(['"])/g, `$1$2?v=${version}$3`));
}
const html = contents[0].replace(/((?:src|href)="\.\/(?:src\/[^"?]+\.js|styles\.css))"/g, `$1?v=${version}"`);
await writeFile(new URL('index.html', output), html);
await writeFile(new URL('.nojekyll', output), '');
console.log('Static site built in dist/ — ready for GitHub Pages.');
