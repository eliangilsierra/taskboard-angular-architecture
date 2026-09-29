// @ts-check
const eslint = require('@eslint/js');
const { defineConfig, globalIgnores } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

/**
 * Dependencies point inwards (ADR 2): presentation -> application -> domain, and
 * infrastructure -> domain. `core` never depends on a feature.
 */
const layer = (name, message) => ({ group: [`**/${name}`, `**/${name}/**`], message });

const restrictImports = (files, patterns) => ({
  files,
  rules: { 'no-restricted-imports': ['error', { patterns }] }
});

module.exports = defineConfig([
  globalIgnores(['dist/', '.angular/', 'playwright-report/', 'test-results/']),
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' }
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' }
      ]
    }
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {}
  },
  restrictImports(
    ['src/app/features/*/domain/**/*.ts'],
    [
      layer('application', 'The domain must not depend on the application layer.'),
      layer('infrastructure', 'The domain must not depend on infrastructure.'),
      layer('presentation', 'The domain must not depend on presentation.'),
      { group: ['@angular/*'], message: 'The domain must not depend on the framework.' },
      { group: ['@core/*', '@features/*'], message: 'The domain must be self-contained.' }
    ]
  ),
  restrictImports(
    ['src/app/features/*/application/**/*.ts'],
    [
      layer('infrastructure', 'Use the port from the domain; adapters are bound in the providers.'),
      layer('presentation', 'The application layer must not depend on presentation.')
    ]
  ),
  restrictImports(
    ['src/app/features/*/infrastructure/**/*.ts'],
    [
      layer('application', 'Infrastructure implements domain ports, not use cases.'),
      layer('presentation', 'Infrastructure must not depend on presentation.')
    ]
  ),
  restrictImports(
    ['src/app/features/*/presentation/**/*.ts'],
    [layer('infrastructure', 'Components use the application layer, never an adapter.')]
  ),
  restrictImports(
    ['src/app/core/**/*.ts'],
    [
      {
        group: ['@features/*', '**/features/**'],
        message: 'core is shared by features and must not depend on them.'
      }
    ]
  )
]);
