// Exports 800px-wide copies of every public/*.webp into public/thumbs for the project and
// certificate cards, which render ~400px wide (see src/lib/cardImage.js). The full-size
// originals are still used by the modals and on large screens.
// Re-run with `npm run thumbs` whenever an image in public/ is added or changed.
import { readdir, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const dir = (p) => new URL(p, import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const publicDir = dir('../public/');
const thumbsDir = dir('../public/thumbs/');

await mkdir(thumbsDir, { recursive: true });

const files = (await readdir(publicDir)).filter((f) => f.endsWith('.webp'));
for (const file of files) {
  await sharp(publicDir + file)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(thumbsDir + file);
}

console.log(`thumbs written for ${files.length} images`);
