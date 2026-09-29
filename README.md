# Prueba

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
docker/                        nginx configuration for the production image
e2e/                           Playwright specs and page objects
scripts/                       helper scripts (end-to-end run in a container)
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

The end-to-end tests use [Playwright](https://playwright.dev) and target the production image, not the dev server. Download the browser once:

```bash
npx playwright install chromium
```

Then either let the script build the image, start the container, run the suite and tear everything down:

```bash
npm run e2e:container
```

or run the suite against any deployment that is already up (default `http://localhost:8080`):

```bash
E2E_BASE_URL=https://staging.example.com npm run e2e
```

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
# Prueba
