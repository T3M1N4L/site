#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const out = path.join(process.cwd(), 'dist', '.assetsignore');
try {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, '_worker.js\n');
  console.log('Wrote', out);
} catch (err) {
  console.error('Failed to write .assetsignore:', err);
  process.exit(1);
}
