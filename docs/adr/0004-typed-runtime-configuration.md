# 4. Typed environment configuration and path aliases

- Status: Accepted

## Context

The scaffold has no runtime configuration, and imports would soon become long
relative paths like `../../../core/config`.

## Decision

- Generate `src/environments/environment.ts` (production) and
  `environment.development.ts`, swapped through `fileReplacements` in the
  development build configuration. Both files are typed with the `AppConfig`
  interface, so a missing or misspelled key fails the build.
- Expose the configuration through the `APP_CONFIG` injection token and
  `provideAppConfig()`. Application code injects the token and never imports the
  environment file, which keeps it testable.
- Add three path aliases: `@core/*`, `@features/*` and `@env/*`.

## Alternatives considered

- **Loading configuration from a JSON file at startup.** Allows changing values
  without rebuilding, at the cost of an asynchronous bootstrap step. It becomes
  relevant with the container work and is not needed yet.
- **Relative imports.** No setup, but brittle when files move.

## Consequences

- Configuration is baked into the bundle: changing a value means rebuilding.
- Environment files are committed, so they must never contain secrets.
- The aliases have to be kept in sync by hand if folders are renamed.
