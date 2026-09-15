import parser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { it } from 'vitest';
import rule from './route-exports-only-handlers.lint';

const tester = new RuleTester({
  languageOptions: { parser, ecmaVersion: 2022, sourceType: 'module' },
});

it('route.ts exports only handlers and route config', () => {
  tester.run('route-exports-only-handlers', rule, {
    valid: [
      { code: 'export function GET() {}', filename: 'app/api/health/route.ts' },
      { code: 'export const POST = () => {};', filename: 'app/api/health/route.ts' },
      { code: "export const runtime = 'edge';", filename: 'app/api/health/route.ts' },
      { code: 'export const helper = () => {};', filename: 'lib/helper.ts' },
    ],
    invalid: [
      {
        code: 'export const helper = () => {};',
        filename: 'app/api/health/route.ts',
        errors: [{ messageId: 'onlyHandlers' }],
      },
      {
        code: 'export function validate() {}',
        filename: 'app/api/health/route.ts',
        errors: [{ messageId: 'onlyHandlers' }],
      },
    ],
  });
});
