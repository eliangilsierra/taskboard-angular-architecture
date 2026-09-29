# 6. Keep feature state in NgRx Store with effects

- Status: Accepted (supersedes [ADR 3](0003-signal-based-state-service.md) on this branch)

## Context

The `main` line of this repository keeps the task board state in a hand-written
signal service. This branch answers the same question with the classic NgRx
architecture: actions describe what happened, a reducer computes the next state,
selectors read it and effects run the side effects. Everything else is
identical: the domain, the repository port, the error handling and the
components.

## Decision

The feature state lives in the NgRx store, split by responsibility:

- `tasks.actions.ts`: an action group with the commands (`add`, `toggle`,
  `remove`), their results (`loaded`, `added`, `toggled`, `removed`) and `failed`.
- `tasks.reducer.ts`: `createFeature` with a pure reducer and the selectors
  `selectTasks` and `selectRemaining`.
- `tasks.effects.ts`: functional effects that call the repository port and
  turn every outcome into an action. Failures become `failed`, which a single
  non-dispatching effect hands to Angular's `ErrorHandler`.
- `tasks.store.ts`: `TasksStore` remains as a thin facade, exposing the same
  signals and methods as before through `selectSignal` and `dispatch`. The page
  and the components did not change.

`provideStore()` is registered once in the application config, and
`provideTasks()` registers the feature state and its effects at route level.

## Alternatives considered

- **Components dispatching actions and selecting state directly.** It is the
  usual NgRx style, but it leaks the store into the presentation layer and
  breaks the boundary from ADR 2.
- **A single effect for every command.** Less code, but it gives up the one
  rule that makes effects readable: one action, one effect.

## Consequences

- Much more code for the same behaviour. The production code of the
  application layer goes from 70 lines in 2 files to 169 lines in 5 files.
- Larger bundles: the initial bundle grows from 250.16 kB to 273.72 kB (71.81 kB
  to 78.44 kB transferred) and the lazy `tasks` chunk from 6.32 kB to 11.34 kB.
  The store itself is loaded with the application, not with the feature.
- Every test that touches the feature needs `provideStore()`, and the
  application config depends on it too.
- Errors travel inside an action as `unknown`, so actions are not serializable.
  That is acceptable here, and it would matter if the actions were persisted or
  sent to devtools.
- The state is deep-frozen in development, which catches accidental mutation but
  also freezes the objects returned by the repository.
- In return, the state transitions are pure functions that are easy to test
  (the reducer has its own tests), the action log makes every change traceable,
  and the structure scales to features that share state. For a task list that
  benefit is mostly theoretical.
