import tsParser from '@typescript-eslint/parser';
import sonarjs from 'eslint-plugin-sonarjs';

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/test-helpers.{ts,tsx}',
      '**/test-setup.ts',
      '**/*.d.ts',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: tsParser, parserOptions: { sourceType: 'module' } },
    plugins: { sonarjs },
    rules: {
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-duplicated-branches': 'error',
      'sonarjs/no-duplicate-string': ['error', { threshold: 5 }],
      'sonarjs/cognitive-complexity': ['error', 20],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSAsExpression > TSAsExpression > TSUnknownKeyword',
          message:
            'Double cast `as unknown as` erases all type safety. Genuinely unavoidable boundary casts live only in the sanctioned files listed in this config, each documented in docs/context/sanctioned-casts.md. See CLAUDE.md "Code Style".',
        },
      ],
    },
  },
];
