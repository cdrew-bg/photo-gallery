import { RuleTester } from 'eslint';
import { it } from 'vitest';
import rule from './declarations-at-top.lint';

const tester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

it('declarations-at-top keeps consts, types, interfaces and enums above implementations', () => {
  tester.run('declarations-at-top', rule, {
    valid: [
      'const MAX = 10;\ntype T = { a: number };\ninterface I { b: string }\nfunction f() { return MAX; }\nclass C {}',
      'import x from "y";\nconst A = 1;\nexport function go() { return A; }',
      'type T = Record<string, number>;\nexport const run = () => 1;',
      'export function only() { return 1; }',
      'export class Repo {}',
      'enum E { A, B }\nfunction f() { return E.A; }',
    ],
    invalid: [
      {
        code: 'function f() {}\nconst MAX = 10;',
        errors: [{ messageId: 'outOfOrder' }],
      },
      {
        code: 'class C {}\ninterface I { a: number }',
        errors: [{ messageId: 'outOfOrder' }],
      },
      {
        code: 'export function f() {}\nexport type T = number;',
        errors: [{ messageId: 'outOfOrder' }],
      },
      {
        code: 'const go = () => {};\nconst MAX = 10;',
        errors: [{ messageId: 'outOfOrder' }],
      },
    ],
  });
});
