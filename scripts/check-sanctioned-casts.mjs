import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const QUALITY_CONFIG = 'eslint.quality.config.mjs';
const CASTS_DOC = 'docs/context/sanctioned-casts.md';
const HEADING_PREFIX = '## ';
const REMOVED_HEADING = '## Removed';

async function carveOutFiles() {
  const config = (await import(pathToFileURL(QUALITY_CONFIG))).default;
  return config
    .filter((entry) => entry.rules?.['no-restricted-syntax'] === 'off')
    .flatMap((entry) => entry.files ?? []);
}

function documentedFiles() {
  const lines = readFileSync(CASTS_DOC, 'utf8').split('\n');
  const files = [];
  for (const line of lines) {
    if (line.startsWith(REMOVED_HEADING)) break;
    if (line.startsWith(HEADING_PREFIX)) files.push(line.slice(HEADING_PREFIX.length).trim());
  }
  return files;
}

function report({ label, paths }) {
  if (paths.length === 0) return false;
  process.stderr.write(`check-sanctioned-casts: ${label}:\n`);
  for (const path of paths) process.stderr.write(`  ${path}\n`);
  return true;
}

async function main() {
  const carved = new Set(await carveOutFiles());
  const documented = new Set(documentedFiles());
  const undocumented = [...carved].filter((path) => !documented.has(path));
  const orphaned = [...documented].filter((path) => !carved.has(path));
  const failed = [
    report({
      label: `carved out in ${QUALITY_CONFIG} but missing a WHY record in ${CASTS_DOC}`,
      paths: undocumented,
    }),
    report({
      label: `documented in ${CASTS_DOC} but not carved out in ${QUALITY_CONFIG}`,
      paths: orphaned,
    }),
  ].some(Boolean);
  if (failed) {
    process.stderr.write(
      'Every sanctioned-cast carve-out needs a matching doc entry, and vice versa. Move fixed entries under "## Removed".\n',
    );
    process.exit(1);
  }
  process.stdout.write(
    `check-sanctioned-casts: ${carved.size} carve-out(s) all documented, no orphans\n`,
  );
}

await main();
