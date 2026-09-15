import { RuleTester } from 'eslint';
import { it } from 'vitest';
import rule from './filename-role-suffix.lint';

const tester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

it('filename-role-suffix requires the file role in the name', () => {
  tester.run('filename-role-suffix', rule, {
    valid: [
      { code: 'export interface User { id: string }', filename: 'lib/user.interface.ts' },
      { code: 'export type UserId = string;', filename: 'lib/user-id.type.ts' },
      { code: 'export class UserRepo { run() { return 1; } }', filename: 'lib/user-repo.class.ts' },
      { code: 'export enum Role { A, B }', filename: 'lib/role.enum.ts' },
      { code: 'export function greet() { return "hi"; }', filename: 'lib/greeting.service.ts' },
      { code: 'export const logger = { info() {} };', filename: 'lib/logger.service.ts' },
      { code: 'export function Button() { return <div />; }', filename: 'ui/button.component.tsx' },
      { code: 'export function useToggle() { return true; }', filename: 'ui/use-toggle.hook.ts' },
      {
        code: 'import { z } from "zod";\nexport const orderSchema = z.object({}).strict();',
        filename: 'lib/order.schema.ts',
      },
      { code: 'export default function Page() { return <div />; }', filename: 'app/page.tsx' },
      { code: 'export const anything = 1;', filename: 'lib/greeting.test.ts' },
    ],
    invalid: [
      {
        code: 'export interface User { id: string }',
        filename: 'lib/user.ts',
        errors: [{ messageId: 'missingRole' }],
      },
      {
        code: 'export class Thing {}',
        filename: 'lib/thing.type.ts',
        errors: [{ messageId: 'wrongRole' }],
      },
      {
        code: 'export function greet() { return 1; }',
        filename: 'lib/greeting.ts',
        errors: [{ messageId: 'missingRole' }],
      },
      {
        code: 'export function Button() { return <div />; }',
        filename: 'ui/button.tsx',
        errors: [{ messageId: 'missingRole' }],
      },
      {
        code: 'export interface Opts { a: number }',
        filename: 'lib/thing.service.ts',
        errors: [{ messageId: 'wrongRole' }],
      },
    ],
  });
});
