import { RuleTester } from 'eslint';
import { it } from 'vitest';
import rule from './no-internal-vi-mock.lint';

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

it('vi.mock targets package specifiers only', () => {
  tester.run('no-internal-vi-mock', rule, {
    valid: [
      "vi.mock('@anthropic-ai/sdk');",
      "vi.mock('node:fs');",
      "somethingElse.mock('../relative');",
    ],
    invalid: [
      {
        code: "vi.mock('../../lib/env', () => ({}));",
        errors: [{ messageId: 'boundaryOnly' }],
      },
      {
        code: "vi.mock('./sibling');",
        errors: [{ messageId: 'boundaryOnly' }],
      },
    ],
  });
});
