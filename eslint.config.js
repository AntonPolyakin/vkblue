import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';
import babelParser from '@babel/eslint-parser';

export default [
  js.configs.recommended,

  {
    files: ['**/*.{js,jsx}'],

    languageOptions: {
      parser: babelParser,

      parserOptions: {
        requireConfigFile: false,
        ecmaVersion: 2020,
        sourceType: 'module',

        ecmaFeatures: {
          jsx: true,
        },

        babelOptions: {
          presets: ['@babel/preset-react'],
        },
      },

      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.webextensions,
      },
    },

    plugins: {
      react: reactPlugin,
      prettier: prettierPlugin,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      ...reactPlugin.configs.recommended.rules,

      'prettier/prettier': 'error',
      'no-useless-constructor': 'error',
      'no-console': 0,
      'react/prop-types': 0,
    },
  },
];