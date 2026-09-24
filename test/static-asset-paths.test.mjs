import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import test from 'node:test';

const root = new URL('..', import.meta.url).pathname;
const assetAttribute = /(?:src|href)="([^"]+\.(?:css|js|png|jpg|jpeg|webp|svg|ico|gif|woff2?|ttf)(?:\?[^\"]*)?)"/g;
const ignoredPrefixes = ['/', 'http://', 'https://', '//', 'data:', '#', 'mailto:', 'tel:'];

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(path));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(path);
  }

  return files;
}

test('HTML asset references are root-relative for shared site assets', async () => {
  const failures = [];

  for (const file of await htmlFiles(root)) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(assetAttribute)) {
      const asset = match[1];
      if (ignoredPrefixes.some((prefix) => asset.startsWith(prefix))) continue;

      const page = relative(root, file);
      const cleanfaktConfig = page.startsWith('cleanfakt/') && asset === '../config.js';
      if (!cleanfaktConfig) failures.push(`${page}: ${asset}`);
    }
  }

  assert.deepEqual(failures, [], `unsafe relative asset references:\n${failures.join('\n')}`);
});

test('support widget loader keeps versioned root-relative assets', async () => {
  const source = await readFile(join(root, 'script.js'), 'utf8');
  assert.match(source, /\/support-widget\/taskly-support\.css\?v=3/);
  assert.match(source, /\/support-widget\/taskly-support\.js\?v=3/);
});
