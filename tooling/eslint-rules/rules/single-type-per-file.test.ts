import { RuleTester } from 'eslint';
import { it } from 'vitest';
import rule from './single-type-per-file.lint';

const tester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

it('single-type-per-file allows at most one top-level interface, type, or class', () => {
  tester.run('single-type-per-file', rule, {
    valid: [
      'export interface User { id: string }',
      'export class Repo {}\nfunction helper() {}\nconst X = 1;',
      'interface Props { id: string }\nexport function Component() { return null; }',
      'export type Id = string;',
    ],
    invalid: [
      {
        code: 'export interface A {}\nexport interface B {}',
        errors: [{ messageId: 'multiple' }],
      },
      {
        code: 'export class Repo {}\nexport interface Opts {}',
        errors: [{ messageId: 'multiple' }],
      },
      {
        code: 'type A = string;\ntype B = number;',
        errors: [{ messageId: 'multiple' }],
      },
      {
        code: 'export class A {}\nclass B {}',
        errors: [{ messageId: 'multiple' }],
      },
    ],
  });
});
