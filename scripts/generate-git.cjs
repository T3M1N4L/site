#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function safeExec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).toString().trim();
  } catch {
    return '';
  }
}

const info = {
  commitHash: safeExec('git rev-parse HEAD'),
  commitBranch: safeExec('git rev-parse --abbrev-ref HEAD'),
  commitMessage: safeExec('git log -1 --pretty=%B'),
  commitDate: safeExec('git log -1 --pretty=%cd')
};

const outDir = path.resolve('src', 'generated');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'git.json'), JSON.stringify(info, null, 2));
console.log('Wrote src/generated/git.json');
