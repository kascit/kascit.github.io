const fs = require('fs');
const path = require('path');

const MAP = {
  // core
  'boot.js': 'core/boot.js',
  'main.js': 'core/main.js',
  'shell.js': 'core/shell.js',
  'config.js': 'core/config.js',
  'shell-config.js': 'core/shell-config.js',
  'theme-engine.js': 'core/theme-engine.js',
  'responsive.js': 'core/responsive.js',
  'resource-loader.js': 'core/resource-loader.js',

  // ui
  'drawer.js': 'ui/drawer.js',
  'dropdowns.js': 'ui/dropdowns.js',
  'tooltips.js': 'ui/tooltips.js',
  'scroll-top.js': 'ui/scroll-top.js',
  'code-blocks.js': 'ui/code-blocks.js',
  'notify-banner.js': 'ui/notify-banner.js',
  'showcase-rotate.js': 'ui/showcase-rotate.js',
  'lazy-plugins.js': 'ui/lazy-plugins.js',

  // features
  'access-keys.js': 'features/access-keys.js',
  'keyboard-shortcuts.js': 'features/keyboard-shortcuts.js',
  'shortcuts.js': 'features/shortcuts.js',
  'search-loader.js': 'features/search-loader.js',
  'clipboard.js': 'features/clipboard.js',
  'comments.js': 'features/comments.js',
  'toc.js': 'features/toc.js',

  // telemetry
  'cookie-consent.js': 'telemetry/cookie-consent.js',
  'cookie-utils.js': 'telemetry/cookie-utils.js',
  'external-link-utm.js': 'telemetry/external-link-utm.js',
  'gtag-init.js': 'telemetry/gtag-init.js',

  // data
  'blog-feed.js': 'data/blog-feed.js',
  'layout-recommendation.js': 'data/layout-recommendation.js',
  'taxonomy-filter.js': 'data/taxonomy-filter.js',
  'taxonomy-playlist.js': 'data/taxonomy-playlist.js',
  'taxonomy-subscribe.js': 'data/taxonomy-subscribe.js',

  // system
  'auth-integration.js': 'system/auth-integration.js',
  'webmcp.js': 'system/webmcp.js',
  'offline-reload.js': 'system/offline-reload.js',
  'service-worker.js': 'system/service-worker.js',

  // vendor
  'katex.min.js': 'vendor/katex.min.js',
  'mermaid.min.js': 'vendor/mermaid.min.js'
};

const BASE_DIR = path.join(__dirname, '../');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === '.git' || file === 'public' || file.includes('node_modules')) return;
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(full));
        } else {
            results.push(full);
        }
    });
    return results;
}

// 1. Move all files to their exact target locations FIRST
const stagedMap = {}; 
const jsDir = path.join(BASE_DIR, 'static/js');

// Create domains
['core', 'ui', 'features', 'telemetry', 'data', 'system', 'vendor'].forEach(d => {
    const dir = path.join(jsDir, d);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
});

Object.entries(MAP).forEach(([basename, relTarget]) => {
    const p1 = path.join(jsDir, basename);
    const p2 = path.join(jsDir, 'modules', basename);
    
    let activePath = null;
    if (fs.existsSync(p1)) activePath = p1;
    else if (fs.existsSync(p2)) activePath = p2;
    
    if (activePath) {
        const dest = path.join(jsDir, relTarget);
        if (activePath !== dest) {
            fs.copyFileSync(activePath, dest); // copy instead of rename (safety)
            stagedMap[activePath] = dest;
            console.log(`Moved ${basename} -> ${relTarget}`);
        }
    }
});

// 2. Scan all files and rewrite paths
const allFiles = walkDir(BASE_DIR).filter(f => {
    return (f.endsWith('.js') && !f.includes('katex') && !f.includes('mermaid')) || 
           f.endsWith('.html') || 
           f.endsWith('justfile') || 
           f.endsWith('.json') || 
           f.endsWith('.md');
});

allFiles.forEach(file => {
   let content = fs.readFileSync(file, 'utf8');
   let original = content;

   // Absolute web roots -> /js/core/xxxx.js
   for (const [basename, newPath] of Object.entries(MAP)) {
      // /js/xxx.js => /js/target.js
      const regex1 = new RegExp(`(['"])/js/${basename}(['"])`, 'g');
      content = content.replace(regex1, `$1/js/${newPath}$2`);
      
      const regex2 = new RegExp(`(['"])/js/modules/${basename}(['"])`, 'g');
      content = content.replace(regex2, `$1/js/${newPath}$2`);
      
      // filesystem static/js/xxx.js
      const regex3 = new RegExp(`static/js/${basename}`, 'g');
      content = content.replace(regex3, `static/js/${newPath}`);
      
      const regex4 = new RegExp(`static/js/modules/${basename}`, 'g');
      content = content.replace(regex4, `static/js/${newPath}`);
   }

   // ES Module rewrite
   if (file.endsWith('.js')) {
      const isTargetJSFileInsideMap = Object.values(MAP).some(p => file.replace(/\\/g, '/').endsWith(p));
      const currentFileName = path.basename(file);
      const currentMappedPath = MAP[currentFileName];
      
      if (currentMappedPath) {
          // Dynamic imports: import("./modules/clipboard.js")
          const dynRegex = /import\(['"]([^'"]+)['"]\)/g;
          content = content.replace(dynRegex, (match, oldPath) => {
              const basename = path.basename(oldPath);
              if (MAP[basename]) {
                 const targetPath = MAP[basename];
                 const currentDir = path.dirname(currentMappedPath);
                 const targetDir = path.dirname(targetPath);
                 let relDir = path.relative(currentDir, targetDir);
                 if (relDir === '') relDir = '.';
                 let finalPath = relDir + '/' + basename;
                 if (!finalPath.startsWith('.')) finalPath = './' + finalPath;
                 finalPath = finalPath.replace(/\\/g, '/');
                 return `import("${finalPath}")`;
              }
              return match;
          });

          // Static imports: import {x} from "./modules/clipboard.js"
          const statRegex = /import\s+({[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
          content = content.replace(statRegex, (match, imports, oldPath) => {
              const basename = path.basename(oldPath);
              if (MAP[basename]) {
                 const targetPath = MAP[basename];
                 const currentDir = path.dirname(currentMappedPath);
                 const targetDir = path.dirname(targetPath);
                 let relDir = path.relative(currentDir, targetDir);
                 if (relDir === '') relDir = '.';
                 let finalPath = relDir + '/' + basename;
                 if (!finalPath.startsWith('.')) finalPath = './' + finalPath;
                 finalPath = finalPath.replace(/\\/g, '/');
                 return `import ${imports} from "${finalPath}"`;
              }
              return match;
          });
          
          // Re-export static imports: export {x} from "./modules/clipboard.js"
          const exprRegex = /export\s+({[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
          content = content.replace(exprRegex, (match, exports, oldPath) => {
              const basename = path.basename(oldPath);
              if (MAP[basename]) {
                 const targetPath = MAP[basename];
                 const currentDir = path.dirname(currentMappedPath);
                 const targetDir = path.dirname(targetPath);
                 let relDir = path.relative(currentDir, targetDir);
                 if (relDir === '') relDir = '.';
                 let finalPath = relDir + '/' + basename;
                 if (!finalPath.startsWith('.')) finalPath = './' + finalPath;
                 finalPath = finalPath.replace(/\\/g, '/');
                 return `export ${exports} from "${finalPath}"`;
              }
              return match;
          });
      }
   }

   if (content !== original) {
       fs.writeFileSync(file, content);
       console.log(`Updated paths in ${file}`);
   }
});

// 3. Delete old files
Object.keys(stagedMap).forEach(p => {
    if (fs.existsSync(p)) {
        fs.unlinkSync(p);
    }
});

// Delete empty modules dir
const oldMods = path.join(jsDir, 'modules');
if (fs.existsSync(oldMods)) {
    try { fs.rmdirSync(oldMods); } catch {}
}

console.log("Migration Complete");
