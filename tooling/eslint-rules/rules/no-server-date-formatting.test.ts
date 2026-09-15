import { RuleTester } from 'eslint';
import { it } from 'vitest';
import rule from './no-server-date-formatting.lint';

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

it('bans locale/date formatting on the server; allows toISOString', () => {
  tester.run('no-server-date-formatting', rule, {
    valid: [
      'const s = createdAt.toISOString();',
      'const n = Date.now();',
      'const d = new Date();',
      'const j = JSON.stringify({ createdAt });',
      'const u = createdAt.getTime();',
    ],
    invalid: [
      {
        code: 'const s = createdAt.toLocaleString();',
        errors: [{ messageId: 'noFormatting' }],
      },
      {
        code: 'const s = new Date().toLocaleDateString("en-US");',
        errors: [{ messageId: 'noFormatting' }],
      },
      {
        code: 'const s = row.updatedAt.toDateString();',
        errors: [{ messageId: 'noFormatting' }],
      },
      {
        code: 'const s = d.toTimeString();',
        errors: [{ messageId: 'noFormatting' }],
      },
    ],
  });
});
