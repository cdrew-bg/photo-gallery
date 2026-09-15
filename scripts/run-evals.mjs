import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CASES_DIR = 'evals/cases';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MODEL = 'claude-sonnet-5';
const MAX_TOKENS = 1024;

function loadCases() {
  return readdirSync(CASES_DIR)
    .filter((name) => name.endsWith('.json'))
    .map((name) => JSON.parse(readFileSync(join(CASES_DIR, name), 'utf8')));
}

async function callModel({ prompt, apiKey }) {
  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await response.json();
  return data.content.map((block) => block.text ?? '').join('');
}

async function runCase({ testCase, apiKey }) {
  const text = await callModel({ prompt: testCase.prompt, apiKey });
  const ok = text.includes(testCase.expectContains);
  process.stdout.write(`${ok ? 'PASS' : 'FAIL'}  ${testCase.name}\n`);
  return ok;
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const cases = loadCases();
  if (!apiKey) {
    process.stdout.write(`skip: ANTHROPIC_API_KEY not set (${cases.length} cases not run)\n`);
    return;
  }
  let failures = 0;
  for (const testCase of cases) {
    const passed = await runCase({ testCase, apiKey });
    if (!passed) failures += 1;
  }
  process.stdout.write(`\n${cases.length - failures}/${cases.length} passed\n`);
  if (failures > 0) process.exit(1);
}

await main();
