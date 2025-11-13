const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');
const ts = require('typescript-eslint');              // TypeScript ESLint configs
const boundaries = require('eslint-plugin-boundaries');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const prettierPlugin = require('eslint-plugin-prettier');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = defineConfig([
  // 1. Start with Expo's recommended config for React Native + TypeScript
  expo,
  // 2. Enable TypeScript ESLint recommended + strict rules (including type-checked rules)
  ts.configs.strict,
  ts.configs.strictTypeChecked,
  {
    // Parser options for type-aware linting:
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  // 3. Custom rules and plugins for Prettier, import sorting, unused imports, and boundaries
  {
    plugins: {
      // Integrate Prettier as an ESLint plugin
      prettier: prettierPlugin,
      // Plugin for sorting imports
      'simple-import-sort': simpleImportSort,
      // Plugin for removing unused imports
      'unused-imports': require('eslint-plugin-unused-imports'),
      // Plugin for enforcing domain boundaries
      boundaries: boundaries,
    },
    settings: {
      // Define domain and shared module patterns for boundaries plugin:
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/domains/*', mode: 'folder', capture: ['domainName'] },
        { type: 'shared', pattern: ['src/components/**', 'src/lib/**'] },
      ],
    },
    rules: {
      // ** Prettier formatting rules ** 
      // Run Prettier as an ESLint rule and disable conflicting ESLint rules:
      ...prettierPlugin.configs.recommended.rules,  // Enables "prettier/prettier" error rule:contentReference[oaicite:1]{index=1}
      ...eslintConfigPrettier.rules,               // Disables ESLint rules that conflict with Prettier:contentReference[oaicite:2]{index=2}

      // ** TypeScript strict rules **
      'consistent-return': 'error',                // Require consistent return values in functions
      '@typescript-eslint/no-explicit-any': 'error',  // Disallow the `any` type explicitly
      // (The TypeScript compiler’s noImplicitAny option should also be enabled in tsconfig.json)

      // ** Import sorting and unused imports **
      'no-unused-vars': 'off',                     // (Disabled – using unused-imports plugin instead)
      'unused-imports/no-unused-imports': 'error', // Remove unused imports automatically:contentReference[oaicite:3]{index=3}
      'unused-imports/no-unused-vars': ['warn', {  // Warn on unused variables (except _prefix):contentReference[oaicite:4]{index=4}
        vars: 'all', varsIgnorePattern: '^_',
        args: 'after-used', argsIgnorePattern: '^_',
      }],
      'simple-import-sort/imports': 'error',       // Auto-sort import statements:contentReference[oaicite:5]{index=5}
      'simple-import-sort/exports': 'error',       // Auto-sort export statements (if multiple)

      // ** Architectural boundaries (DDD) **
      // Disallow importing across domain boundaries – a domain can only import from itself or shared utilities:
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          {
            from: ['domain'],                          // any file in a domain
            allow: [
              ['domain', { domainName: '${from.domainName}' }],  // may import from its own domain:contentReference[oaicite:6]{index=6}
              'shared',                                // may import shared utilities/components
            ],
            message: 'Domain code cannot import code from a different domain',
          },
        ],
      }],
      // Include other recommended boundary rules (e.g., no importing private/internal modules of other domains):
      ...boundaries.configs.recommended.rules,
    },
  },
  // 4. Ignore build output and Expo generated files
  {
    ignores: ['dist/*'],
  },
]);
