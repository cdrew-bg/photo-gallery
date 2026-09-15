import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';

const BOUNDARY_ZONES = [
  {
    target: './lib',
    from: ['./app', './features', './components', './stores'],
    message: 'lib is shared and must not import from app, features, components, or stores.',
  },
  {
    target: './config',
    from: ['./app', './features', './components', './stores'],
    message: 'config is shared and must not import from app, features, components, or stores.',
  },
  {
    target: './components',
    from: ['./app', './features'],
    message: 'Shared components must not import from app or features.',
  },
  {
    target: './stores',
    from: ['./app', './features', './components'],
    message: 'stores are shared and must not import from app, features, or components.',
  },
  {
    target: './features',
    from: './app',
    message: 'features must not import from app; compose features at the app layer.',
  },
  {
    target: './features/health',
    from: './features',
    except: ['./health'],
    message: 'No cross-feature imports: features/health must not import another feature.',
  },
  {
    target: './features/contact',
    from: './features',
    except: ['./contact'],
    message: 'No cross-feature imports: features/contact must not import another feature.',
  },
];

const IGNORES = [
  '**/dist/**',
  '**/node_modules/**',
  '**/.next/**',
  '**/coverage/**',
  '**/coverage-ratchet/**',
  '**/*.d.ts',
  '.claude/**',
  'tooling/eslint-rules/**',
];

export default [
  { ignores: IGNORES },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { sourceType: 'module', ecmaFeatures: { jsx: true } },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', disallowTypeAnnotations: false },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    ignores: IGNORES,
    plugins: { import: importPlugin },
    settings: { 'import/resolver': { typescript: true } },
    rules: {
      'import/no-restricted-paths': ['error', { zones: BOUNDARY_ZONES }],
    },
  },
  {
    linterOptions: { reportUnusedDisableDirectives: 'error' },
  },
];
