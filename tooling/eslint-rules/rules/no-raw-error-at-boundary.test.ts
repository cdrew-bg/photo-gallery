import parser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { it } from 'vitest';
import rule from './no-raw-error-at-boundary.lint';

const tester = new RuleTester({
  languageOptions: { parser, ecmaVersion: 2022, sourceType: 'module' },
});

it('boundaries throw AppError families, not raw Error', () => {
  tester.run('no-raw-error-at-boundary', rule, {
    valid: [
      "throw new ValidationError('bad input');",
      "throw new LlmError('upstream failed');",
      'throw err;',
    ],
    invalid: [
      {
        code: "throw new Error('boom');",
        errors: [{ messageId: 'rawError' }],
      },
      {
        code: "throw new TypeError('bad');",
        errors: [{ messageId: 'rawError' }],
      },
    ],
  });
});
