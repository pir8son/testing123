import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const ROOT = process.cwd();
const TARGET_DIRS = [join(ROOT, 'apps', 'mobile'), join(ROOT, 'packages', 'shared')];
const EXCLUDED_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  'ios',
  'android',
  '.expo',
  '.git',
  '.turbo',
  '.next'
]);
const WEB_FILE_PATTERN = /\.web\./;
const DOM_PATTERNS = [
  { label: 'window.document', pattern: /\bwindow\.document\b/ },
  { label: 'globalThis.document', pattern: /\bglobalThis\.document\b/ },
  { label: 'document', pattern: /\bdocument\b/ }
];

function stripComments(line, inBlockComment) {
  let output = '';
  let i = 0;
  while (i < line.length) {
    if (inBlockComment) {
      const end = line.indexOf('*/', i);
      if (end === -1) {
        return { text: output, inBlockComment: true };
      }
      i = end + 2;
      inBlockComment = false;
      continue;
    }

    const blockStart = line.indexOf('/*', i);
    const lineStart = line.indexOf('//', i);
    if (lineStart !== -1 && (blockStart === -1 || lineStart < blockStart)) {
      output += line.slice(i, lineStart);
      return { text: output, inBlockComment: false };
    }
    if (blockStart !== -1) {
      output += line.slice(i, blockStart);
      i = blockStart + 2;
      inBlockComment = true;
      continue;
    }

    output += line.slice(i);
    break;
  }
  return { text: output, inBlockComment };
}

async function walk(dir, violations) {
  const entries = await readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (EXCLUDED_DIRS.has(entry.name)) {
          return;
        }
        await walk(entryPath, violations);
        return;
      }

      if (!entry.isFile()) {
        return;
      }

      if (WEB_FILE_PATTERN.test(entry.name)) {
        return;
      }

      const ext = extname(entry.name);
      if (!ext) {
        return;
      }

      try {
        const contents = await readFile(entryPath, 'utf8');
        const lines = contents.split(/\r?\n/);
        let inBlockComment = false;
        lines.forEach((line, index) => {
          const stripped = stripComments(line, inBlockComment);
          inBlockComment = stripped.inBlockComment;
          DOM_PATTERNS.forEach(({ label, pattern }) => {
            const match = stripped.text.match(pattern);
            if (match) {
              violations.push({
                filePath: entryPath,
                line: index + 1,
                match: match[0],
                label
              });
            }
          });
        });
      } catch (error) {
        console.warn(`Warning: unable to read ${entryPath}.`, error);
      }
    })
  );
}

async function main() {
  const violations = [];
  await Promise.all(TARGET_DIRS.map((dir) => walk(dir, violations)));

  if (violations.length > 0) {
    console.error('DOM globals found in native/shared code. Move web-only logic to *.web.* files.');
    violations
      .sort((a, b) => a.filePath.localeCompare(b.filePath) || a.line - b.line)
      .forEach(({ filePath, line, match, label }) => {
        console.error(`- ${filePath}:${line} (${label}: ${match})`);
      });
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('dom:lint failed.', error);
  process.exit(1);
});
