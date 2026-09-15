import parser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { it } from 'vitest';
import rule from './zod-strict-boundary.lint';

const tester = new RuleTester({
  languageOptions: { parser, ecmaVersion: 2022, sourceType: 'module' },
});

it('boundary z.object must chain .strict()', () => {
  tester.run('zod-strict-boundary', rule, {
    valid: [
      'const schema = z.object({ name: z.string() }).strict();',
      'const schema = z.object({ name: z.string() }).strict().optional();',
      'const payload = z.record(z.unknown());',
      'const schema = z.object({ id: z.string() }).extend({ more: z.string() }).strict();',
    ],
    invalid: [
      {
        code: 'const schema = z.object({ name: z.string() });',
        output: 'const schema = z.object({ name: z.string() }).strict();',
        errors: [{ messageId: 'requireStrict' }],
      },
    ],
  });
});
