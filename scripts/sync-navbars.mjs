import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { syncNavbar } from './navbar-template.mjs';

// Only tracked pages: unpublished, untracked drafts are deliberately left alone.
const pages = execFileSync('git', ['ls-files', '-z', '--', '*.html'], { encoding: 'utf8' }).split('\0').filter(Boolean);
let changed = 0;
for (const page of pages) {
  const previous = fs.readFileSync(page, 'utf8');
  const next = syncNavbar(previous, page);
  if (next === previous) continue;
  if (process.argv.includes('--check')) throw new Error(`Navbar out of date: ${page}`);
  fs.writeFileSync(page, next);
  changed++;
}
console.log(`OK: ${pages.length} navbars checked; ${changed} updated.`);
