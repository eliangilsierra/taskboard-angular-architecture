# Prueba

> **Branch `taskboard/hardened-container`** — builds on `taskboard/standard-error-handling`. It replaces the inherited Dockerfile with a multi-stage build that serves the production bundle from an unprivileged nginx image. Decisions: [ADR 0001](docs/adr/0001-upgrade-angular-17-to-22.md), [0002](docs/adr/0002-feature-based-layered-structure.md), [0003](docs/adr/0003-signal-based-state-service.md), [0004](docs/adr/0004-typed-runtime-configuration.md), [0005](docs/adr/0005-standard-error-handling.md), [0006](docs/adr/0006-hardened-container-image.md).

## Requirements

- Node.js `^22.22.3`, `^24.15.0` or `>=26.0.0`

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 22.2.0.

## Project structure

```text
src/
├── app/
│   ├── core/
│   │   ├── config/            app-wide configuration (APP_CONFIG)
│   │   └── errors/            AppError, GlobalErrorHandler, ErrorNotifier, banner
│   └── features/tasks/
│       ├── domain/            Task, title rules, TaskRepository port
│       ├── application/       TasksStore (signals), task error mapper
│       ├── infrastructure/    InMemoryTaskRepository
│       └── presentation/      page, form and list components
└── environments/              typed production and development settings
```

Path aliases: `@core/*`, `@features/*`, `@env/*`.

## Running in a container

```bash
docker compose up --build
```

The application is served on <http://localhost:8080> and the health check on `/healthz`. Without Compose:

```bash
docker build -t taskboard-web .
docker run --rm -p 8080:8080 --read-only --tmpfs /tmp --cap-drop ALL \
  --security-opt no-new-privileges:true taskboard-web
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
# Prueba
