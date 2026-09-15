import { Linter, RuleTester } from 'eslint';
import { expect, it } from 'vitest';
import rule from './no-comments.lint';

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

it('no-comments bans every comment form except shebangs', () => {
  tester.run('no-comments', rule, {
    valid: ['const x = 1;', '#!/usr/bin/env node\nconst x = 1;'],
    invalid: [
      {
        code: '// a line comment\nconst x = 1;',
        output: '\nconst x = 1;',
        errors: [{ messageId: 'noComments' }],
      },
      {
        code: '/* a block comment */\nconst x = 1;',
        output: '\nconst x = 1;',
        errors: [{ messageId: 'noComments' }],
      },
      {
        code: 'const x = 1; // trailing',
        output: 'const x = 1; ',
        errors: [{ messageId: 'noComments' }],
      },
      {
        code: '// eslint-disable-next-line no-console\nconsole.log(1);',
        output: '\nconsole.log(1);',
        errors: [{ messageId: 'noComments' }],
      },
      {
        code: '/* global window */\nconst x = 1;',
        output: '\nconst x = 1;',
        errors: [{ messageId: 'noComments' }],
      },
      {
        code: '/**\n * jsdoc\n */\nexport const x = 1;',
        output: '\nexport const x = 1;',
        errors: [{ messageId: 'noComments' }],
      },
    ],
  });
});

it('a blanket eslint-disable cannot bypass the ban when inline config is off', () => {
  const linter = new Linter();
  const messages = linter.verify('/* eslint-disable */\nconst x = 1;\n', {
    linterOptions: { noInlineConfig: true },
    plugins: { local: { rules: { 'no-comments': rule } } },
    rules: { 'local/no-comments': 'error' },
  });
  expect(messages.some((m) => m.ruleId === 'local/no-comments')).toBe(true);
});
