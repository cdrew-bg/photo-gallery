import { RuleTester } from 'eslint';
import { it } from 'vitest';
import rule from './test-file-location.lint';

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

it('tests are *.test.ts colocated — no __tests__ dirs, no spec files', () => {
  tester.run('test-file-location', rule, {
    valid: [
      { code: 'export const x = 1;', filename: '/repo/lib/keys.test.ts' },
      { code: 'export const x = 1;', filename: '/repo/lib/keys.ts' },
    ],
    invalid: [
      {
        code: 'export const x = 1;',
        filename: '/repo/lib/__tests__/keys.test.ts',
        errors: [{ messageId: 'wrongLocation' }],
      },
      {
        code: 'export const x = 1;',
        filename: '/repo/lib/keys.spec.ts',
        errors: [{ messageId: 'wrongLocation' }],
      },
    ],
  });
});
