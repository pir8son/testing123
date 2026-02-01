import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage']);
const VALID_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const DOM_REGEX = /\b(document|window|navigator)\s*\./;
const DOM_SYMBOL_REGEX = /\b(localStorage|sessionStorage|DOMParser|HTMLElement)\b/;

const violations = [];

const readTextFile = (filePath) => readFileSync(filePath, 'utf8');

const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    if (IGNORE_DIRS.has(entry)) continue;
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!VALID_EXTENSIONS.has(fullPath.slice(fullPath.lastIndexOf('.')))) {
      continue;
    }

    if (fullPath.includes('.web.')) {
      continue;
    }

    const contents = readTextFile(fullPath);
    const allowDom = contents.includes('@web-only') || contents.includes('isWeb') || contents.includes('warnIfNotWeb');
    const lines = contents.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (!allowDom && (DOM_REGEX.test(line) || DOM_SYMBOL_REGEX.test(line))) {
        violations.push(`${fullPath}:${index + 1} ${line.trim()}`);
      }
    });
  }
};

walk(ROOT);

if (violations.length > 0) {
  console.error('DOM globals detected outside *.web.* files:');
  for (const violation of violations) {
    console.error(`  ${violation}`);
  }
  process.exit(1);
}

console.log('No disallowed DOM globals found.');
