import { RuleTester } from 'eslint';
import { it } from 'vitest';
import rule from './require-datetime-zod.lint';

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

it('requires ISO-string datetimes at the boundary, not z.date()', () => {
  tester.run('require-datetime-zod', rule, {
    valid: [
      'const s = z.string().datetime({ offset: true });',
      'const s = z.string().datetime();',
      'const s = z.string().min(1);',
      'const s = z.number();',
      'const s = other.date();',
    ],
    invalid: [
      {
        code: 'const s = z.date();',
        errors: [{ messageId: 'requireDatetime' }],
      },
      {
        code: 'const s = z.coerce.date();',
        errors: [{ messageId: 'requireDatetime' }],
      },
      {
        code: 'const o = z.object({ createdAt: z.date() }).strict();',
        errors: [{ messageId: 'requireDatetime' }],
      },
    ],
  });
});
