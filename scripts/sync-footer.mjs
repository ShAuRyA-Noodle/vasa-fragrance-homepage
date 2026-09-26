// Rewrites every static page's <footer class="cartier-footer"> with the canonical markup.
// Usage: node scripts/sync-footer.mjs
import {readFileSync, writeFileSync} from 'node:fs';
import {footerMarkup} from '../shared/site-footer.js';

const pages = ['index.html', 'collection', 'gifting', 'our-story', 'contact', 'build-your-fragrance',
  'products/silent-storm', 'products/sweetest-stranger', 'products/rebel-in-velvet', 'products/the-night-lingers']
  .map(p => p.endsWith('.html') ? p : `${p}/index.html`);
const html = footerMarkup().replace(/<span id="year">\d+<\/span>/, '<span id="year">2026</span>');
for (const page of pages) {
  const source = readFileSync(page, 'utf8');
  const next = source.replace(/<footer class="cartier-footer"[\s\S]*?<\/footer>/, html);
  if (next === source && !source.includes(html)) throw new Error(`No footer found in ${page}`);
  writeFileSync(page, next);
  console.log(`footer synced: ${page}`);
}
