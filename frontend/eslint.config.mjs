import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import unusedImports from 'eslint-plugin-unused-imports'
import tssUnusedClasses from 'eslint-plugin-tss-unused-classes'

// Flat config (ESLint 9). Replaces .eslintrc.json + .eslintignore.
// airbnb-base was dropped: it was ~90% disabled here (Prettier owns
// formatting), so only the rules that actually did work are kept.
export default [
  {
    ignores: ['public/**/*.js', 'build/**', 'node_modules/**'],
  },
  // eslintrc defaulted reportUnusedDisableDirectives off; flat config defaults
  // it to "warn". Keep the old behaviour so the migration is behaviour-neutral
  // (the stale eslint-disable comments are a separate cleanup, not a blocker).
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  react.configs.flat.recommended,
  {
    files: ['src/**/*.js'],
    plugins: {
      'react-hooks': reactHooks,
      'unused-imports': unusedImports,
      'tss-unused-classes': tssUnusedClasses,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        render: true,
        shallow: true,
        mount: true,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-key': 'warn',
      'react/display-name': 'off',
      'react/no-unknown-property': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react/no-find-dom-node': 'warn',
      'react/no-children-prop': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      semi: ['error', 'never'],
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'off',
      'tss-unused-classes/unused-classes': 'warn',
    },
  },
  // Style files and containers legitimately define classes consumed elsewhere
  // (or none at all), so the unused-classes check is noise there.
  {
    files: [
      '**/*-style.js',
      '**/*-styles.js',
      '**/*.styles.js',
      '**/*Styles.js',
      '**/*Container.js',
    ],
    rules: {
      'tss-unused-classes/unused-classes': 'off',
    },
  },
]
