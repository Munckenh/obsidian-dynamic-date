import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                sourceType: 'module',
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...tseslint.configs.recommended.rules,
            'no-trailing-spaces': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'none',
                },
            ],
            'semi': ['error', 'always'],
            'quotes': ['error', 'single'],
        },
    },
    {
        ignores: [
            'main.js',
            'node_modules/**',
            'dist/**',
            'build/**',
        ],
    },
];
