# 6. Keep feature state in an NgRx SignalStore

- Status: Accepted (supersedes [ADR 3](0003-signal-based-state-service.md) on this branch)

## Context

The `main` line of this repository keeps the task board state in a hand-written
signal service. This branch answers the same question with NgRx SignalStore,
which adds structure on top of signals without introducing actions or reducers.
Everything else is identical: the domain, the repository port, the error
handling and the tests.

## Decision

`TasksStore` is declared with `signalStore()` and built from features:

- `withState` for the list of tasks,
- `withComputed` for `remaining`,
- `withMethods` for `add`, `toggle` and `remove`, plus a private `_load`,
- `withHooks` to load the tasks when the store is created.

The public contract is the same as before: `tasks` and `remaining` are signals
and the commands keep their signatures. Neither the page nor the store's tests
had to change. Because `signalStore()` returns a value, the file also exports a
type alias with the same name so the store can be used as a type.

## Alternatives considered

- **`rxMethod` for the commands.** It fits when a call needs cancellation or
  debouncing. For plain request/response calls it would add an operator pipeline
  without any gain.
- **NgRx Store with actions, reducers and effects.** Implemented in a sibling
  branch to compare.

## Consequences

- A new runtime dependency, `@ngrx/signals`, which follows the Angular major
  version. Upgrading Angular now means upgrading it too.
- The lazy `tasks` chunk grows from 6.32 kB to 8.67 kB (2.09 kB to 3.05 kB
  transferred); the initial bundle grows by about 0.1 kB.
- State is a plain object patched with `patchState`. In development it is
  deep-frozen, which catches accidental mutation but also freezes the objects
  returned by the repository.
- The store is built by composition rather than written as a class, which is
  compact but harder to follow for developers who do not know the API. Private
  members are marked with an underscore prefix, a convention of the library
  rather than of the language.
- For a state this small it is more machinery than the hand-written service.
  Its value shows up when features share conventions (entities, loading flags,
  devtools) that can be reused as custom store features.
