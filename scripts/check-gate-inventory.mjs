import { readFileSync } from 'node:fs';

const PACKAGE_JSON = 'package.json';
const CLAUDE_MD = 'CLAUDE.md';
const PNPM_PREFIX = 'pnpm ';
const EXTRA_GATES = new Set([
  'lint',
  'typecheck',
  'audit:deps',
  'dup',
  'format:check',
  'test:coverage-ratchet',
  'knip',
]);

function scriptGates() {
  const pkg = JSON.parse(readFileSync(PACKAGE_JSON, 'utf8'));
  const names = Object.keys(pkg.scripts ?? {});
  return new Set(names.filter((name) => name.startsWith('lint:') || EXTRA_GATES.has(name)));
}

function tableGates() {
  const md = readFileSync(CLAUDE_MD, 'utf8');
  const gates = new Set();
  for (const match of md.matchAll(/^\|\s*`([^`]+)`\s*\|/gm)) {
    const command = match[1].trim();
    if (command.startsWith(PNPM_PREFIX)) gates.add(command.slice(PNPM_PREFIX.length));
  }
  return gates;
}

function inventoryDiff({ scripts, table }) {
  const problems = [];
  for (const name of scripts) {
    if (!table.has(name))
      problems.push(`  gate \`pnpm ${name}\` is missing from the CLAUDE.md gate inventory`);
  }
  for (const name of table) {
    if (!scripts.has(name))
      problems.push(`  \`pnpm ${name}\` is in the gate inventory but is not a gate script`);
  }
  return problems;
}

function main() {
  const scripts = scriptGates();
  const table = tableGates();
  const problems = inventoryDiff({ scripts, table });
  if (problems.length > 0) {
    process.stderr.write(
      'check-gate-inventory: CLAUDE.md gate inventory drifted from package.json gate scripts:\n',
    );
    for (const line of problems) process.stderr.write(`${line}\n`);
    process.stderr.write('Update the "Gate inventory" table in CLAUDE.md to match the scripts.\n');
    process.exit(1);
  }
  process.stdout.write(
    `check-gate-inventory: ${scripts.size} gates match the CLAUDE.md inventory\n`,
  );
}

main();
