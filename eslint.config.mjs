import globals from 'globals';
import pluginJs from '@eslint/js';

export default [

  { files: ['**/*.js'], languageOptions: {sourceType: 'commonjs'}},
  {
    ignores:['node_modules/**', '.git/','public/**','views/**'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.node, // Include Node.js globals
      },
    },
    rules: {
      // Possible Errors
      'no-console': 'off',
      'no-debugger': 'warn',

      // Best Practices
      'curly': 'error',
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',

      // Variables
      'no-unused-vars': ['off'],
      'no-undef': 'error',

      // Stylistic Issues
      'indent': ['error', 2],
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      'semi': ['error', 'always'],
      // 'comma-dangle': ['off', 'always-multiline'],
      'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 0 }],
      'no-trailing-spaces': 'error',
      'space-before-blocks': 'error',
      'keyword-spacing': ['error', { 'before': true, 'after': true }],
      'space-infix-ops': 'error',

      // ECMAScript 6
      'arrow-spacing': ['error', { 'before': true, 'after': true }],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  pluginJs.configs.recommended,
];