# 3. Keep feature state in a signal-based service

- Status: Superseded by [ADR 6](0006-ngrx-signalstore-state.md) on this branch

## Context

The task board needs somewhere to hold its list of tasks and a way for
components to read and change it. This is the piece other branches of this
repository replace to compare state-management approaches, so the baseline must
be the simplest thing that works.

## Decision

`TasksStore` is a plain injectable service. It keeps the tasks in a private
writable signal, exposes them read-only, derives `remaining` with `computed`,
and offers `add`, `toggle` and `remove`. It is provided at route level, so its
state lives as long as the feature is on screen. Components read the signals and
call the methods; nothing else is public.

## Alternatives considered

- **NgRx Store, NgRx SignalStore or RxJS subjects.** More structure, tooling and
  boilerplate. They are implemented in sibling branches so they can be compared
  against this one.
- **State inside the page component.** Simpler still, but it cannot be shared
  with other components and it mixes use cases with rendering.

## Consequences

- No devtools, time travel or action log, and no convention for side effects.
  Every extra concern has to be designed by hand as the feature grows.
- The public API of the store is the contract. Sibling branches keep it intact
  and change only the inside.
- Failures coming from the repository are handed to Angular's `ErrorHandler`
  instead of being handled by the store itself (see ADR 0005).
