import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const REPORT_DIR = '.agent';
const REPORT_PATH = '.agent/report.json';
const JSON_INDENT = 2;

const GATES = [
  { id: 'lint', script: 'lint' },
  { id: 'typecheck', script: 'typecheck' },
  { id: 'quality', script: 'lint:quality' },
  { id: 'guardrails', script: 'lint:guardrails' },
  { id: 'typed', script: 'lint:typed' },
  { id: 'test', script: 'test' },
];

function runGate(gate) {
  const result = spawnSync('pnpm', ['--silent', gate.script], { encoding: 'utf8' });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  return { id: gate.id, script: gate.script, ok: result.status === 0, output };
}

function summarize(results) {
  for (const item of results) {
    process.stdout.write(`${item.ok ? 'PASS' : 'FAIL'}  ${item.script}\n`);
  }
}

function main() {
  const results = GATES.map(runGate);
  const failed = results.filter((item) => !item.ok);
  const report = { ok: failed.length === 0, failed: failed.map((item) => item.id), gates: results };
  mkdirSync(REPORT_DIR, { recursive: true });
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, undefined, JSON_INDENT)}\n`);
  summarize(results);
  process.stdout.write(`\nreport: ${REPORT_PATH} (${failed.length} failing)\n`);
  if (failed.length > 0) process.exit(1);
}

main();
