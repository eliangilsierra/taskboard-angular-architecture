# 2. Feature-based structure with four layers

- Status: Accepted

## Context

The scaffold has a single `app/` folder. The moment a second feature appears,
everything ends up mixed together: components that know how data is stored, and
storage code that knows how it is displayed. Later branches of this repository
need a place to swap one piece (state management, error handling, storage)
without touching the rest.

## Decision

Group code by feature, and inside each feature separate four layers:

```text
src/app/
├── core/                    app-wide singletons and configuration
└── features/tasks/
    ├── domain/              Task, business rules, repository port (no Angular UI)
    ├── application/         TasksStore: use cases and state
    ├── infrastructure/      adapters that implement the ports (in-memory storage)
    ├── presentation/        components
    ├── tasks.providers.ts   composition root: binds ports to adapters
    └── tasks.routes.ts      lazy-loaded entry point of the feature
```

Dependencies point inwards: `presentation → application → domain` and
`infrastructure → domain`. Only `tasks.providers.ts` knows both sides. The
storage is an abstract class (`TaskRepository`) used as the injection token, so
replacing the in-memory adapter with an HTTP one is a change in one file.

There is no `shared/` folder yet: it appears when a second feature needs
something from the first.

## Alternatives considered

- **Layer-first folders** (`components/`, `services/`, `models/`). Familiar and
  what the Angular CLI produces by default, but every feature change touches
  every folder and nothing prevents components from reaching into storage.
- **A single flat feature folder.** Enough for this size, but it would hide the
  seams the next branches rely on.

## Consequences

- More files and more indirection than a task list needs. The structure is
  deliberately larger than the problem so that its cost and benefit can be seen.
- The dependency rule is a convention: nothing enforces it at build time yet.
- The domain still imports RxJS through the repository port. Making it fully
  framework-free would require a Promise-based port, which was judged not worth
  it in an Angular application.
