const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'public', '_tmp', 'vendor', 'scratch'].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const BAD = [
  { pat: 'js/modules/',          label: 'old modules/ dir import' },
  { pat: "path='js/main.js'",    label: 'stale get_url main.js' },
  { pat: "path='js/katex.min.js'", label: 'stale get_url katex' },
  { pat: "path='js/mermaid.min.js'", label: 'stale get_url mermaid' },
  { pat: "path='fuse.min.js'",   label: 'stale get_url fuse root' },
];

let found = false;
for (const f of walk('.')) {
  if (!['.js', '.html', '.css', '.json', '.md'].some(ext => f.endsWith(ext))) continue;
  let c;
  try { c = fs.readFileSync(f, 'utf8'); } catch { continue; }
  for (const { pat, label } of BAD) {
    if (c.includes(pat)) {
      console.log('[ISSUE]', path.relative('.', f), '->', label);
      found = true;
    }
  }
}
if (!found) console.log('[ALL CLEAN] No stale references found.');
