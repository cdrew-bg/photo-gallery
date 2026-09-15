import parser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { it } from 'vitest';
import rule from './no-deep-module-import.lint';

const tester = new RuleTester({
  languageOptions: { parser, ecmaVersion: 2022, sourceType: 'module' },
});

it('modules are imported by their public entry, not deep files', () => {
  tester.run('no-deep-module-import', rule, {
    valid: [
      "import { complete } from '../llm';",
      "import { logger } from './logger';",
      "import { z } from 'zod';",
      "import { thing } from '@/lib/thing';",
    ],
    invalid: [
      {
        code: "import { secret } from '../llm/internal/client';",
        errors: [{ messageId: 'deepImport' }],
      },
      {
        code: "export { thing } from '../other/impl/detail';",
        errors: [{ messageId: 'deepImport' }],
      },
    ],
  });
});
