import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const TARGET_DIRS = [join(ROOT, 'apps', 'mobile'), join(ROOT, 'packages', 'shared')];
const EXCLUDED_DIRS = new Set(['node_modules', 'dist', 'build', '.expo']);
const WEB_FILE_PATTERN = /\.web\./;
const DOM_PATTERN = /\bdocument\b|\bwindow\.document\b|\bglobalThis\.document\b/;

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
        if (DOM_PATTERN.test(contents)) {
          violations.push(entryPath);
        }
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
    violations.sort().forEach((filePath) => {
      console.error(`- ${filePath}`);
    });
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('dom:lint failed.', error);
  process.exit(1);
});
