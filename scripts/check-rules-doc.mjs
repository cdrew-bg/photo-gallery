import { readFileSync, readdirSync } from 'node:fs';

const INDEX_PATH = 'tooling/eslint-rules/index.js';
const RULES_JSON = 'tooling/eslint-rules/rules.json';
const RULES_DIR = 'tooling/eslint-rules/rules';
const CLAUDE_MD = 'CLAUDE.md';
const SKILL_MD = '.claude/skills/dev/SKILL.md';

function registeredRules() {
  const source = readFileSync(INDEX_PATH, 'utf8');
  const names = new Set();
  for (const match of source.matchAll(/'([a-z-]+)':\s*require\(/g)) names.add(match[1]);
  return names;
}

function documentedRules() {
  return new Set(Object.keys(JSON.parse(readFileSync(RULES_JSON, 'utf8'))));
}

function missingFromText(rules, path) {
  const text = readFileSync(path, 'utf8');
  return [...rules].filter((rule) => !text.includes(`local/${rule}`));
}

function filenameProblems(registered) {
  const problems = [];
  const files = readdirSync(RULES_DIR);
  for (const rule of registered) {
    if (!files.includes(`${rule}.lint.js`))
      problems.push(`  \`${rule}\` must be implemented in ${RULES_DIR}/${rule}.lint.js`);
  }
  for (const file of files) {
    if (file.endsWith('.lint.js') || file.endsWith('.test.ts')) continue;
    problems.push(`  ${RULES_DIR}/${file} must be named <rule>.lint.js or <rule>.test.ts`);
  }
  return problems;
}

function setDiff({ registered, documented }) {
  const problems = [];
  for (const rule of registered) {
    if (!documented.has(rule))
      problems.push(`  \`${rule}\` is registered in index.js but missing from rules.json`);
  }
  for (const rule of documented) {
    if (!registered.has(rule))
      problems.push(`  \`${rule}\` is in rules.json but not registered in index.js`);
  }
  return problems;
}

function main() {
  const registered = registeredRules();
  const documented = documentedRules();
  const problems = setDiff({ registered, documented });
  problems.push(...filenameProblems(registered));
  for (const rule of missingFromText(registered, CLAUDE_MD)) {
    problems.push(`  \`local/${rule}\` is not documented in ${CLAUDE_MD}`);
  }
  for (const rule of missingFromText(registered, SKILL_MD)) {
    problems.push(`  \`local/${rule}\` is not in ${SKILL_MD} — run pnpm skill:sync`);
  }
  if (problems.length > 0) {
    process.stderr.write('check-rules-doc: custom lint rules drifted from their documentation:\n');
    for (const line of problems) process.stderr.write(`${line}\n`);
    process.stderr.write(
      'Every custom rule must appear in rules.json, CLAUDE.md, and the dev SKILL.md.\n',
    );
    process.exit(1);
  }
  process.stdout.write(`check-rules-doc: ${registered.size} custom rules documented and in sync\n`);
}

main();
