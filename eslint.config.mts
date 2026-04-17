import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
      },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        // Node.js globals
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'warn',
      'no-console': 'warn',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'build/', '*.js', '*.map'],
  },
);
