# 1. Upgrade Angular 17 to 22

- Status: Accepted (the `Eager` pin on `AppComponent` was later replaced by `OnPush`, see [ADR 8](0008-linting-formatting-and-layer-boundaries.md))

## Context

The scaffold was generated with Angular CLI 17.1, which is out of support. Every
later branch of this repository builds on top of this one, so the framework
version has to be settled first and on its own, before any architectural change
gets mixed in.

## Decision

Upgrade to Angular 22.2 using the official `ng update` schematics, one major
version at a time (17 → 18 → 19 → 20 → 21 → 22). The build and the unit tests
were run after every hop.

The upgrade changes the framework version and nothing else. Where Angular 22
changed a default, the schematics pin the previous behaviour instead of adopting
the new one:

- `ChangeDetectionStrategy.Eager` on `AppComponent`, because the new default is `OnPush`.
- `provideZoneChangeDetection()` in `main.ts`, because the new default is zoneless.

Related, unavoidable changes: TypeScript 5.3 → 6.0, `zone.js` 0.14 → 0.15,
`moduleResolution: bundler`, an `engines.node` constraint, and the `node:18`
base image in the Dockerfile bumped to `node:24` (Angular 22 does not build on
Node 18).

## Alternatives considered

- **Stop at Angular 21.** It runs on Node 20.19+ and 22.12+, which is easier on
  contributors, but it would be one major behind on day one.
- **Jump straight to 22.** `ng update` does not support skipping majors; the
  intermediate migrations are what carry the code forward safely.
- **Adopt `OnPush` and zoneless during the upgrade.** Better end state, but it
  is a design decision that deserves its own change and its own tests.

## Consequences

- Angular 22 requires Node `^22.22.3 || ^24.15.0 || >=26.0.0`. Older Node
  releases, including the earlier 22.x patch versions, cannot run the CLI.
- The application keeps Zone.js and default change detection for now. It works,
  but it is not the direction the framework is heading.
- Karma is still the test runner. It works, but it is deprecated upstream.
- The build reports a `anyComponentStyle` budget warning: Angular now counts the
  inline `<style>` block of the placeholder template. The template is a
  placeholder and is replaced in a later branch, so the budget is left untouched.
- The lockfile diff is very large and not reviewable line by line; the
  `package.json` diff is the meaningful one.
- The Docker image was updated but not built in the environment used for this
  change.
