import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const BASELINE_PATH = 'scripts/snapshots/coverage-baseline.json';
const SUMMARY_PATH = 'coverage-ratchet/coverage-summary.json';
const JSON_INDENT = 2;
const PCT_TOLERANCE = 0.1;

function runCoverage() {
  const args = ['exec', 'vitest', 'run', '--coverage.enabled=true'];
  const result = spawnSync('pnpm', args, { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? '');
    process.stderr.write(result.stderr ?? '');
    process.stderr.write('check-coverage-ratchet: test run failed\n');
    process.exit(1);
  }
}

function currentLinePct() {
  runCoverage();
  const summary = JSON.parse(readFileSync(SUMMARY_PATH, 'utf8'));
  return summary.total.lines.pct;
}

function writeBaseline(pct) {
  writeFileSync(BASELINE_PATH, `${JSON.stringify({ total: pct }, undefined, JSON_INDENT)}\n`);
  process.stdout.write(`check-coverage-ratchet: baseline written to ${BASELINE_PATH}\n`);
}

function enforce({ pct, floor }) {
  if (pct + PCT_TOLERANCE < floor) {
    process.stderr.write(`check-coverage-ratchet: lines ${pct}% < floor ${floor}%\n`);
    process.stderr.write('Add tests for the code you touched — the coverage ratchet only rises.\n');
    process.exit(1);
  }
  if (pct > floor) {
    process.stdout.write(
      `check-coverage-ratchet: rose to ${pct}% (floor ${floor}%) — ratchet up with --update\n`,
    );
  }
  process.stdout.write('check-coverage-ratchet: at or above the floor\n');
}

function main() {
  const pct = currentLinePct();
  if (process.argv.includes('--update')) {
    writeBaseline(pct);
    return;
  }
  if (!existsSync(BASELINE_PATH)) {
    process.stderr.write(`check-coverage-ratchet: no baseline at ${BASELINE_PATH}; run --update\n`);
    process.exit(1);
  }
  const floor = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')).total;
  enforce({ pct, floor });
}

main();
