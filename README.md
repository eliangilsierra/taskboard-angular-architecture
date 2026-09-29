# Taskboard

**One Angular app, many architectures: living branches that show how a task board matures from a bare scaffold to a production-ready application.**

![CI](https://github.com/eliangilsierra/taskboard-angular-architecture/actions/workflows/ci.yml/badge.svg)

Most example repositories show one finished result. This one keeps the whole path. Each branch changes **one** thing, documents the decision in a short [ADR](docs/adr) (including what it costs), and builds on its own. Sibling branches solve the same problem in different ways so they can be compared side by side.

The application is a small task board (add, complete and remove tasks). It is deliberately simple so that the interesting part is the architecture around it.

## The branches

| Branch                                                                                | The one change                                                            | What it shows                                                                                                                                | What it costs                                                                                      |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [`taskboard/angular17-baseline`](../../tree/taskboard/angular17-baseline)             | None: a frozen copy of the original scaffold                              | The starting point: Angular 17.1, a placeholder page, 3 unit tests                                                                           | Out of support; a Dockerfile that runs the dev server as root                                      |
| [`taskboard/upgrade-angular-latest`](../../tree/taskboard/upgrade-angular-latest)     | Angular 17 → 22, one major at a time                                      | Upgrading with the official schematics without mixing in design changes                                                                      | Needs Node ≥ 22.22.3; keeps Zone.js and old defaults; a lockfile diff nobody can review            |
| [`taskboard/layered-structure`](../../tree/taskboard/layered-structure)               | Feature folders with domain, application, infrastructure and presentation | Ports and adapters, typed environment configuration, path aliases, a reference feature (20 unit tests)                                       | More files than a task list needs; the dependency rule is only a convention                        |
| [`taskboard/standard-error-handling`](../../tree/taskboard/standard-error-handling)   | One pipeline for every error                                              | `AppError` → global handler → on-screen banner; failures reported instead of lost (36 unit tests)                                            | Console-only logging; English-only messages                                                        |
| [`taskboard/state-rxjs`](../../tree/taskboard/state-rxjs)                             | State in a `BehaviorSubject`                                              | The classic RxJS approach with observables and the `async` pipe                                                                              | The store contract changes from signals to observables, and so does every template that reads it   |
| [`taskboard/state-ngrx-signalstore`](../../tree/taskboard/state-ngrx-signalstore)     | State in an NgRx SignalStore                                              | Structure on top of signals, same public API as the plain service                                                                            | A new dependency; the lazy chunk grows from 6.32 kB to 8.67 kB                                     |
| [`taskboard/state-ngrx-store`](../../tree/taskboard/state-ngrx-store)                 | State in NgRx Store with effects                                          | Actions, reducer, selectors and effects behind the same facade                                                                               | Application layer grows from 70 lines in 2 files to 169 in 5; initial bundle 250.16 kB → 273.72 kB |
| [`taskboard/hardened-container`](../../tree/taskboard/hardened-container)             | A production container image                                              | Multi-stage build, unprivileged nginx (uid 101), read-only root file system, health check, a 54.8 MB image                                   | No TLS or IPv6; floating image tags; a partial content security policy                             |
| [`taskboard/e2e-playwright-container`](../../tree/taskboard/e2e-playwright-container) | Playwright tests against a container                                      | User flows exercised in a real browser against the shipped artifact                                                                          | A browser download, an image build before the first test, slower and more fragile than unit tests  |
| [`flagship`](../../tree/flagship)                                                     | Everything above, plus quality, observability, resilience and CI          | The recommended combination: ESLint layer rules, Prettier, logger and error references, retries and time limits, CI, a hash-based script CSP | The most moving parts; 49 unit and 10 end-to-end tests to maintain                                 |

`main` and `develop` receive the flagship once it is confirmed complete. No branch is ever deleted, so the whole path stays available.

### Comparing them

```bash
git switch taskboard/state-rxjs
git diff taskboard/standard-error-handling...taskboard/state-rxjs --stat
```

or on GitHub, for example [the NgRx Store variant against its parent](../../compare/taskboard/standard-error-handling...taskboard/state-ngrx-store). Each branch has its own README that says what it changes.

## Architecture (the flagship)

Code is organised by feature. Each feature has four layers, and dependencies point inwards:

```text
presentation ──► application ──► domain ◄── infrastructure
 components       TasksStore      Task, rules,     adapters that implement
                  (signals)       repository port  the ports (in memory,
                                                   plus a resilient decorator)
```

- **The rule is enforced.** `npm run lint` fails when, for example, a component imports an adapter or `core` imports a feature ([ADR 8](docs/adr/0008-linting-formatting-and-layer-boundaries.md)).
- **Every error takes the same road.** `AppError` → `GlobalErrorHandler` → logger and banner, with a short reference shown for unexpected failures ([ADR 5](docs/adr/0005-standard-error-handling.md), [ADR 9](docs/adr/0009-logging-and-error-references.md)).
- **Failures of the storage are contained.** A decorator adds a time limit and retries with backoff to any repository, and never retries the one operation that is not idempotent ([ADR 10](docs/adr/0010-resilient-repository-decorator.md)).

## Tech stack

Angular 22 (standalone components, signals), TypeScript 6, RxJS, Karma and Jasmine, Playwright, ESLint with `angular-eslint`, Prettier, Docker with nginx, GitHub Actions.

## Getting started

You need Node.js `^22.22.3`, `^24.15.0` or `>=26.0.0`, and Docker for the container tasks.

```bash
npm ci
npm start        # http://localhost:4200
```

| Script                  | What it does                                                      |
| ----------------------- | ----------------------------------------------------------------- |
| `npm start`             | Development server                                                |
| `npm run build`         | Production build in `dist/`                                       |
| `npm test`              | Unit tests in watch mode                                          |
| `npm run test:ci`       | Unit tests, one headless run                                      |
| `npm run lint`          | ESLint, including the layer boundary rules                        |
| `npm run format`        | Format the code base with Prettier (`format:check` only verifies) |
| `npm run e2e:container` | Build the image, start it, run the Playwright suite, tear it down |
| `npm run e2e`           | Run the Playwright suite against a running deployment             |

### Run it in a container

```bash
docker compose up --build   # http://localhost:8080, health check at /healthz
```

### End-to-end tests

```bash
npx playwright install chromium   # once
npm run e2e:container
```

Set `E2E_BASE_URL` to point `npm run e2e` at any other deployment.

## Project structure

```text
src/
├── app/
│   ├── core/
│   │   ├── config/            typed application configuration (APP_CONFIG)
│   │   ├── errors/            AppError, GlobalErrorHandler, ErrorNotifier, banner
│   │   └── logging/           Logger port and console adapter
│   └── features/tasks/
│       ├── domain/            Task, title rules, TaskRepository port
│       ├── application/       TasksStore (signals), task error mapper
│       ├── infrastructure/    InMemoryTaskRepository, ResilientTaskRepository
│       └── presentation/      page, form and list components
└── environments/              typed production and development settings
docker/                        nginx configuration for the production image
e2e/                           Playwright specs and page objects
scripts/                       helper scripts
.github/                       CI workflow, Dependabot, issue and pull request templates
```

Path aliases: `@core/*`, `@features/*`, `@env/*`.

## Decisions

| ADR                                                           | Decision                                           |
| ------------------------------------------------------------- | -------------------------------------------------- |
| [1](docs/adr/0001-upgrade-angular-17-to-22.md)                | Upgrade Angular 17 to 22                           |
| [2](docs/adr/0002-feature-based-layered-structure.md)         | Feature-based structure with four layers           |
| [3](docs/adr/0003-signal-based-state-service.md)              | Feature state in a signal-based service            |
| [4](docs/adr/0004-typed-runtime-configuration.md)             | Typed environment configuration and path aliases   |
| [5](docs/adr/0005-standard-error-handling.md)                 | Route every error through Angular's `ErrorHandler` |
| [6](docs/adr/0006-hardened-container-image.md)                | A multi-stage, unprivileged nginx image            |
| [7](docs/adr/0007-e2e-tests-against-container.md)             | End-to-end tests against the production container  |
| [8](docs/adr/0008-linting-formatting-and-layer-boundaries.md) | ESLint, Prettier and layer boundaries              |
| [9](docs/adr/0009-logging-and-error-references.md)            | A logger port and a reference for every error      |
| [10](docs/adr/0010-resilient-repository-decorator.md)         | Time limits and retries with a decorator           |
| [11](docs/adr/0011-continuous-integration.md)                 | Verify every change with GitHub Actions            |
| [12](docs/adr/0012-content-security-policy.md)                | A hash-based script policy at build time           |

The three state-management branches each add their own ADR 6 describing their variant; it is not part of this list.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © 2026 Elian Gil Sierra
