# 8. Enforce style and layer boundaries with ESLint and Prettier

- Status: Accepted

## Context

The dependency rules of [ADR 2](0002-feature-based-layered-structure.md) and
[ADR 5](0005-standard-error-handling.md) were a convention: nothing stopped a
component from importing an adapter, or the domain from importing Angular. The
repository also had no linter and no formatter, so style depended on habit.

## Decision

- **ESLint 10** (flat config) with `typescript-eslint` (recommended and
  stylistic sets) and `angular-eslint` (TypeScript rules, template rules and
  template accessibility rules). It is wired to `ng lint` and also covers the
  end-to-end code.
- **Layer boundaries as lint rules**, written with ESLint's built-in
  `no-restricted-imports` so that no extra dependency is needed:
  - `domain` imports nothing from the other layers, from Angular, or from `core`;
  - `application` cannot import `infrastructure` or `presentation`;
  - `infrastructure` cannot import `application` or `presentation`;
  - `presentation` cannot import `infrastructure`;
  - `core` cannot import from any feature.

  The composition root (`tasks.providers.ts`) is the only file that may see both
  sides, because it lives at the feature root and no rule applies to it.

- **Prettier** with a single configuration that matches `.editorconfig` (single
  quotes, 2 spaces, no trailing commas, 100 columns). `npm run format` rewrites
  files and `npm run format:check` verifies them.
- **`AppComponent` uses `OnPush`.** The upgrade in [ADR 1](0001-upgrade-angular-17-to-22.md)
  pinned the old default, and the linter flagged it. The component only renders
  a constant, a router outlet and an `OnPush` banner, so the change is safe.

## Alternatives considered

- **`eslint-plugin-boundaries`, `dependency-cruiser` or Nx module boundaries.**
  More expressive (tags, cross-feature rules, graphs), at the cost of another
  dependency and a second vocabulary. The built-in rule is enough for four
  layers.
- **Biome instead of ESLint and Prettier.** Faster and a single tool, but it does
  not understand Angular templates yet.
- **Formatting through ESLint.** It mixes two concerns and is slower than
  Prettier.

## Consequences

- The rules match folder names. Renaming `domain` or `infrastructure` silently
  disables the corresponding rule, so the tests of the rules (a file that breaks
  each one) have to be repeated after such a change.
- Only imports are checked. Types that leak through inference are not detected,
  and rules between two features do not exist yet because there is only one.
- Type-aware linting (`recommendedTypeChecked`) is not enabled: it catches more
  but makes every run noticeably slower.
- `typescript-eslint` supports TypeScript below 6.1, so upgrading TypeScript now
  has to be coordinated with it.
- Applying Prettier rewrote ten existing files. The change is cosmetic and
  isolated in its own commit. A few results are less readable than before, such
  as the multi-line `font-family` list.
- Nothing prevents pushing unformatted or unlinted code yet; that needs the
  continuous integration pipeline.
