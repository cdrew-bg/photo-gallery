import { RuleTester } from 'eslint';
import { it } from 'vitest';
import rule from './kind-folder.lint';

const tester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

it('kind-folder keeps interface/type/class/enum files in their kind folder', () => {
  tester.run('kind-folder', rule, {
    valid: [
      { code: 'export class A {}', filename: 'lib/classes/app-error.class.ts' },
      { code: 'export type T = string;', filename: 'lib/types/id.type.ts' },
      { code: 'export interface U { a: number }', filename: 'lib/interfaces/user.interface.ts' },
      { code: 'export enum E { A }', filename: 'lib/enums/role.enum.ts' },
      { code: 'export function f() { return 1; }', filename: 'lib/greeting.service.ts' },
      { code: 'export default function Page() { return null; }', filename: 'app/page.tsx' },
    ],
    invalid: [
      {
        code: 'export class A {}',
        filename: 'lib/app-error.class.ts',
        errors: [{ messageId: 'wrongFolder' }],
      },
      {
        code: 'export interface U { a: number }',
        filename: 'lib/user.interface.ts',
        errors: [{ messageId: 'wrongFolder' }],
      },
      {
        code: 'export type T = string;',
        filename: 'lib/id.type.ts',
        errors: [{ messageId: 'wrongFolder' }],
      },
      {
        code: 'export enum E { A }',
        filename: 'lib/role.enum.ts',
        errors: [{ messageId: 'wrongFolder' }],
      },
    ],
  });
});
