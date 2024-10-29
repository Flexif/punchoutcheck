// eslint.config.mjs
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import globals from 'globals';
import { createRequire } from 'module'; // Allows loading CommonJS modules
const require = createRequire(import.meta.url);
const babelParser = require('@babel/eslint-parser'); // Load babel parser

// Create a new FlatCompat instance
const compat = new FlatCompat({
  baseDirectory: path.resolve(),
});

export default [
  {
    // Specify file patterns for JavaScript and JSX files only
    ignores: [
      '**/*.gz',
      '**/*.pack',
      '**/*.css',
      '**/*.{png,jpg,jpeg,gif,svg,ico,json}',
      '**/*.woff2',
      '**/*.map',
      'node_modules/**',
      '.next/**',
      '.env',
      '.gitignore',
      'README.md',
      'id_rsa_punchoutcheck',
      'id_rsa_punchoutcheck.pub',
      'public/site.webmanifest' // Ignore the web manifest file
    ],
    files: [
      '**/*.{js,mjs,cjs,jsx,ts,tsx}',
      '!eslint.config.mjs',
      '!package.json',
      '!package-lock.json'
    ],

    // Set up language options for JavaScript and JSX
    languageOptions: {
      parser: babelParser, // Use babel parser for JSX support
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        requireConfigFile: false, // Allow parsing without a babel config file
        babelOptions: {
          presets: ['@babel/preset-react'], // Enable React/JSX parsing
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    // Define rules for JavaScript/JSX
    rules: {
      'indent': ['warn', 2, { ignoredNodes: ['JSXElement', 'JSXElement > *', 'JSXAttribute'] }],
      'quotes': ['warn', 'single'],
      'semi': ['warn', 'always'],
      'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1 }],
      'object-curly-spacing': ['warn', 'always'],
      'keyword-spacing': ['warn', { after: true }],
      'no-extra-semi': 'warn',
      'no-mixed-spaces-and-tabs': 'warn',
      'no-trailing-spaces': 'error',
      'no-unused-vars': 'off',
    },

    // Environment settings
    settings: {
      environment: {
        node: true,
        jest: true,
      },
    },
  },
];
