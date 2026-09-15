import { RuleTester } from 'eslint';
import { it } from 'vitest';
import rule from './no-naive-date-parse.lint';

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

it('bans Date.parse and naive new Date(string); allows now/number/iso', () => {
  tester.run('no-naive-date-parse', rule, {
    valid: [
      'const d = new Date();',
      'const d = new Date(1700000000000);',
      'const d = new Date(iso);',
      "const d = new Date('2026-08-16T14:30:00Z');",
      "const d = new Date('2026-08-16T14:30:00.123+05:30');",
      'const d = new Date(2026, 7, 16);',
    ],
    invalid: [
      {
        code: "const t = Date.parse('2026-08-16');",
        errors: [{ messageId: 'naiveParse' }],
      },
      {
        code: "const d = new Date('08/16/2026');",
        errors: [{ messageId: 'naiveParse' }],
      },
      {
        code: "const d = new Date('2026-08-16');",
        errors: [{ messageId: 'naiveParse' }],
      },
    ],
  });
});
