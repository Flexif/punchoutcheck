// eslint.config.js
import { defineConfig } from 'eslint-define-config';
import next from '@next/eslint-plugin-next'; // Import the Next.js ESLint plugin
import babelParser from '@babel/eslint-parser'; // Import Babel ESLint parser

export default defineConfig({
  plugins: {
    next, // Use the imported Next.js plugin object
  },
  languageOptions: {
    parser: babelParser, // Set the parser to Babel ESLint parser
    parserOptions: {
      requireConfigFile: false, // Do not require a Babel config file
      babelOptions: {
        presets: ['@babel/preset-react'], // Use Babel preset for React
      },
    },
  },
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
    'public/site.webmanifest',
  ],
});
