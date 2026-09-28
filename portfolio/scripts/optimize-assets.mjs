// Crops transparent padding and exports web-sized versions of ../assets into src/assets.
// Re-run with `node scripts/optimize-assets.mjs` whenever the source images change.
import sharp from 'sharp';

const src = (f) => new URL(`../../assets/${f}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const out = (f) => new URL(`../src/assets/${f}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1');

await sharp(src('hero-portrait.png'))
  .trim({ threshold: 1 })
  .resize({ height: 1600, withoutEnlargement: true })
  .webp({ quality: 82, alphaQuality: 90 })
  .toFile(out('hero-portrait.webp'));

await sharp(src('PORTFOLIO-font.png'))
  .trim({ threshold: 1 })
  .resize({ width: 2400, withoutEnlargement: true })
  .webp({ quality: 85, alphaQuality: 90 })
  .toFile(out('portfolio-word.webp'));

await sharp(src('general-background.png'))
  .resize({ width: 2400, withoutEnlargement: true })
  .webp({ quality: 80 })
  .toFile(out('background.webp'));

console.log('assets optimized');
