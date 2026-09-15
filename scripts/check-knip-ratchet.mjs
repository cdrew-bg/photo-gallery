import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const BASELINE_PATH = 'scripts/snapshots/knip-baseline.json';
const KNIP_BUFFER_BYTES = 67_108_864;
const JSON_INDENT = 2;
const CATEGORIES = [
  'files',
  'dependencies',
  'devDependencies',
  'optionalPeerDependencies',
  'unlisted',
  'binaries',
  'unresolved',
  'exports',
  'types',
  'duplicates',
  'enumMembers',
  'classMembers',
  'namespaceMembers',
];

function runKnip() {
  const options = { encoding: 'utf8', maxBuffer: KNIP_BUFFER_BYTES };
  try {
    return execFileSync('pnpm', ['exec', 'knip', '--reporter', 'json'], options);
  } catch (error) {
    if (typeof error.stdout === 'string' && error.stdout.length > 0) return error.stdout;
    throw error;
  }
}

function sizeOf(value) {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === 'object') return Object.values(value).flat().length;
  return 0;
}

function countIssues(reportJson) {
  const report = JSON.parse(reportJson);
  const counts = {};
  for (const category of CATEGORIES) counts[category] = 0;
  for (const issue of report.issues) {
    for (const category of CATEGORIES) counts[category] += sizeOf(issue[category]);
  }
  return counts;
}

function loadBaseline() {
  try {
    return JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function compare({ counts, baseline }) {
  const regressions = [];
  const improvements = [];
  for (const [category, count] of Object.entries(counts)) {
    const floor = baseline[category] ?? 0;
    if (count > floor) regressions.push(`${category}: ${floor} -> ${count}`);
    if (count < floor) improvements.push(`${category}: ${floor} -> ${count}`);
  }
  return { regressions, improvements };
}

function writeBaseline(counts) {
  writeFileSync(BASELINE_PATH, `${JSON.stringify(counts, undefined, JSON_INDENT)}\n`);
  process.stdout.write(`check-knip-ratchet: baseline written to ${BASELINE_PATH}\n`);
}

function reportImprovements(improvements) {
  if (improvements.length === 0) return;
  process.stdout.write('check-knip-ratchet: below baseline — ratchet down with --update:\n');
  for (const line of improvements) process.stdout.write(`  ${line}\n`);
}

function main() {
  const counts = countIssues(runKnip());
  if (process.argv.includes('--update')) {
    writeBaseline(counts);
    return;
  }
  const baseline = loadBaseline();
  if (!baseline) {
    process.stderr.write(`check-knip-ratchet: no baseline at ${BASELINE_PATH}; run --update\n`);
    process.exit(1);
  }
  const { regressions, improvements } = compare({ counts, baseline });
  if (regressions.length > 0) {
    process.stderr.write('check-knip-ratchet: dead-code count grew beyond baseline:\n');
    for (const line of regressions) process.stderr.write(`  ${line}\n`);
    process.stderr.write('Delete the dead code (run `pnpm knip`) — the ratchet only tightens.\n');
    process.exit(1);
  }
  reportImprovements(improvements);
  process.stdout.write('check-knip-ratchet: no growth over baseline\n');
}

main();
