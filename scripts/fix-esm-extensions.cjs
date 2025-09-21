/*
  Post-build fixer: add .js extensions to relative ESM imports in dist/lib.esm
  - Rewrites `from './x'` → `from './x.js'`
  - Rewrites `from './dir'` where './dir/index.js' exists → `from './dir/index.js'`
  - Handles both import and export statements
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist', 'lib.esm');

/** @param {string} p */
function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

/** @param {string} p */
function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

/** @param {string} code @param {string} fileDir */
function rewrite(code, fileDir) {
  // Matches: (kw)(pre)(quote)(specifier)(same quote)
  // Example: import { x } from './y' -> kw=import, pre=" { x } from ", quote='\'', spec='./y'
  const re = /(import|export)(\s+[^'";]*?from\s+)(["'])([^"']+)(\3)/g;
  return code.replace(re, (m, kw, pre, quote, spec) => {
    // Only rewrite relative specifiers
    if (!(spec.startsWith('./') || spec.startsWith('../'))) return m;

    // Separate any query/hash so we can append .js before them
    const idx = spec.search(/[?#]/);
    const base = idx === -1 ? spec : spec.slice(0, idx);
    const tail = idx === -1 ? '' : spec.slice(idx);

    const full = path.resolve(fileDir, base);

    // If it already ends with .js/.mjs/.cjs, leave it
    if (/\.(js|mjs|cjs)$/.test(base)) return m;

    // Try file.js
    if (isFile(full + '.js')) {
      const newSpec = `${base}.js${tail}`;
      return `${kw}${pre}${quote}${newSpec}${quote}`;
    }

    // Try directory index.js
    if (isDir(full) && isFile(path.join(full, 'index.js'))) {
      const newSpec = `${base}${base.endsWith('/') ? 'index.js' : '/index.js'}${tail}`;
      return `${kw}${pre}${quote}${newSpec}${quote}`;
    }

    // Otherwise leave as-is
    return m;
  });
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      walk(p);
    } else if (st.isFile() && p.endsWith('.js')) {
      const code = fs.readFileSync(p, 'utf8');
      const out = rewrite(code, path.dirname(p));
      if (out !== code) fs.writeFileSync(p, out);
    }
  }
}

if (!fs.existsSync(DIST)) {
  console.error('dist/lib.esm not found');
  process.exit(1);
}

walk(DIST);
console.log('Fixed ESM import extensions in dist/lib.esm');
