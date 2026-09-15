import parser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { it } from 'vitest';
import rule from './boundary-schema-location.lint';

const tester = new RuleTester({
  languageOptions: { parser, ecmaVersion: 2022, sourceType: 'module' },
});

it('z.object schemas belong only in *.schema.ts', () => {
  tester.run('boundary-schema-location', rule, {
    valid: [
      {
        code: 'const s = z.object({ id: z.string() }).strict();',
        filename: 'app/api/health/user.schema.ts',
      },
      { code: 'const s = z.record(z.unknown());', filename: 'lib/llm.ts' },
      { code: 'const s = z.string();', filename: 'lib/llm.ts' },
    ],
    invalid: [
      {
        code: 'const s = z.object({ id: z.string() });',
        filename: 'app/api/health/route.ts',
        errors: [{ messageId: 'wrongLocation' }],
      },
      {
        code: 'const s = z.strictObject({ id: z.string() });',
        filename: 'lib/llm.ts',
        errors: [{ messageId: 'wrongLocation' }],
      },
    ],
  });
});
