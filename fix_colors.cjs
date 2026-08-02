const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = [...walk('src/pages/admin'), ...walk('src/pages/dashboard')];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace all text-ink-100 with text-ink-950
  content = content.replace(/text-ink-100/g, 'text-ink-950');
  
  // Replace all text-ink-200 with text-ink-800
  content = content.replace(/text-ink-200/g, 'text-ink-800');
  
  // Replace all text-ink-300 with text-ink-700
  content = content.replace(/text-ink-300/g, 'text-ink-700');
  
  // Replace all text-ink-400 with text-ink-600 (just in case any were missed)
  content = content.replace(/text-ink-400/g, 'text-ink-600');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
