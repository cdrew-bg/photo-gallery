import eslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import vitest from '@vitest/eslint-plugin';
import betterMaxParams from 'eslint-plugin-better-max-params';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import youMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect';
import security from 'eslint-plugin-security';
import unicorn from 'eslint-plugin-unicorn';
import local from './tooling/eslint-rules/index.js';

const PROCESS_ENV_BAN = {
  selector: "MemberExpression[object.name='process'][property.name='env']",
  message:
    'Direct process.env access is forbidden. Read env through the validated loader in lib/env.ts. See CLAUDE.md "Adopted patterns".',
};

const FOR_IN_BAN = {
  selector: 'ForInStatement',
  message: 'Use for-of with Object.keys/values/entries — for-in walks the prototype chain.',
};

const VALUE_EXPORT_STAR_BAN = {
  selector: 'ExportAllDeclaration:not([exportKind="type"])',
  message:
    'No value `export *` — re-export values by name (grep-ability); `export type *` is allowed for type vocabularies.',
};

const SERVER_ZONES = ['lib/**/*.{ts,tsx}', 'app/**/route.ts', 'app/api/**/*.{ts,tsx}'];

const ROUTE_ZONES = ['app/**/route.ts', 'app/api/**/*.{ts,tsx}'];

const TEST_FILES = [
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/test-helpers.{ts,tsx}',
  '**/test-setup.ts',
];

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.d.ts',
      '**/*.config.*',
      '.claude/**',
      'tooling/eslint-rules/**',
      'next-env.d.ts',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { sourceType: 'module', ecmaFeatures: { jsx: true } },
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    plugins: { local, '@eslint-community/eslint-comments': eslintComments },
    rules: {
      'local/no-comments': 'error',
      '@eslint-community/eslint-comments/no-use': 'error',
      'local/structured-logging': 'error',
      'local/no-log-and-throw': 'error',
      'local/test-file-location': 'error',
      'local/no-internal-vi-mock': 'error',
      'local/no-deep-module-import': 'error',
      'local/filename-convention': 'error',
    },
  },
  {
    files: ROUTE_ZONES,
    ignores: TEST_FILES,
    plugins: { local },
    rules: {
      'local/boundary-schema-location': 'error',
      'local/route-exports-only-handlers': 'error',
    },
  },
  {
    files: SERVER_ZONES,
    ignores: TEST_FILES,
    plugins: { local },
    rules: {
      'local/no-raw-error-at-boundary': 'error',
    },
  },
  {
    files: ['**/*.schema.ts'],
    plugins: { local },
    rules: {
      'local/zod-strict-boundary': 'error',
      'local/require-datetime-zod': 'error',
    },
  },
  {
    files: SERVER_ZONES,
    ignores: TEST_FILES,
    plugins: { local },
    rules: {
      'local/no-server-date-formatting': 'error',
      'local/no-naive-date-parse': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    ignores: [...TEST_FILES, '**/*.schema.ts'],
    plugins: { local },
    rules: {
      'local/declarations-at-top': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    ignores: [...TEST_FILES, '**/*.schema.ts'],
    plugins: { local },
    rules: {
      'local/single-type-per-file': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    ignores: TEST_FILES,
    plugins: { local },
    rules: {
      'local/filename-role-suffix': 'error',
      'local/kind-folder': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['app/**'],
    plugins: { import: importPlugin },
    rules: { 'import/no-default-export': 'error' },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { import: importPlugin },
    rules: {
      'import/no-self-import': 'error',
      'import/no-cycle': ['error', { maxDepth: 1 }],
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    ignores: TEST_FILES,
    plugins: { 'better-max-params': betterMaxParams, '@typescript-eslint': tsPlugin },
    rules: {
      'better-max-params/better-max-params': ['error', { func: 2 }],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignore: [0, 1, -1, 2],
          enforceConst: true,
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreEnums: true,
          ignoreNumericLiteralTypes: true,
          ignoreReadonlyClassProperties: true,
        },
      ],
      complexity: ['error', 10],
      'max-depth': ['error', 4],
      'max-statements': ['error', 20],
      'max-classes-per-file': ['error', 1],
      eqeqeq: ['error', 'always'],
      'id-length': ['error', { min: 2, exceptions: ['_'], properties: 'never' }],
      'no-console': 'error',
      'no-await-in-loop': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'pino',
              message:
                'Import the shared logger from lib/logger.service.ts, not pino directly. See CLAUDE.md "Adopted patterns".',
            },
            {
              name: '@anthropic-ai/sdk',
              message:
                'Call the Anthropic API through complete() in lib/llm.service.ts, not the SDK directly. See CLAUDE.md "Navigation and homes".',
            },
          ],
        },
      ],
      'no-restricted-syntax': ['error', PROCESS_ENV_BAN, FOR_IN_BAN, VALUE_EXPORT_STAR_BAN],
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: [
            'signature',
            'static-field',
            'instance-field',
            'constructor',
            'static-method',
            'public-instance-method',
            'protected-instance-method',
            'private-instance-method',
          ],
        },
      ],
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    plugins: { unicorn },
    rules: {
      ...unicorn.configs.recommended.rules,
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-nested-ternary': 'off',
      'unicorn/no-useless-undefined': ['error', { checkArguments: false }],
      'unicorn/prefer-event-target': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/filename-case': ['error', { case: 'kebabCase', ignore: [String.raw`^\[.*\]`] }],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { security },
    rules: {
      ...security.configs.recommended.rules,
      'security/detect-object-injection': 'off',
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-you-might-not-need-an-effect': youMightNotNeedAnEffect,
      'jsx-a11y': jsxA11y,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...youMightNotNeedAnEffect.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-no-leaked-render': 'error',
    },
  },

  {
    files: ['**/*.tsx'],
    ignores: TEST_FILES,
    rules: {
      'max-lines-per-function': ['error', { max: 100, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ['lib/env.service.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['lib/logger.service.ts', 'lib/llm.service.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },

  {
    files: TEST_FILES,
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      'max-classes-per-file': 'off',
      'no-restricted-syntax': 'off',
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
  {
    files: TEST_FILES,
    plugins: { vitest },
    rules: {
      'vitest/no-focused-tests': 'error',
      'vitest/no-disabled-tests': 'error',
      'vitest/expect-expect': 'error',
      'vitest/no-conditional-expect': 'error',
    },
  },

  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    plugins: {
      local,
      '@eslint-community/eslint-comments': eslintComments,
      'better-max-params': betterMaxParams,
      unicorn,
    },
    rules: {
      'local/no-comments': 'error',
      '@eslint-community/eslint-comments/no-use': 'error',
      'better-max-params/better-max-params': ['error', { func: 2 }],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 10],
      'max-depth': ['error', 4],
      'max-statements': ['error', 20],
      eqeqeq: ['error', 'always'],
      'id-length': ['error', { min: 2, exceptions: ['_'] }],
      'no-magic-numbers': [
        'error',
        {
          ignore: [0, 1, -1, 2],
          enforceConst: true,
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
        },
      ],
      'no-restricted-syntax': ['error', FOR_IN_BAN],
      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
    },
  },
];
