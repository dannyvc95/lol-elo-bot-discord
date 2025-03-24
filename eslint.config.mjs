import {defineConfig} from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default defineConfig([
    {files: ['**/*.{js,mjs,cjs,ts}']},
    {files: ['**/*.{js,mjs,cjs,ts}'], languageOptions: {globals: globals.node}},
    {files: ['**/*.{js,mjs,cjs,ts}'], plugins: {js}, extends: ['js/recommended']},
    tseslint.configs.recommended,
    {rules: {
        'quotes': ['error', 'single'],
        'eol-last': ['error', 'always'],
        'object-curly-spacing': ['error', 'never'],
        'semi': ['error', 'always'],
        'no-trailing-spaces': 'error',
        'indent': ['error', 4],
        'max-len': ['error', {'code': 120}]
    }}
]);
