# 6. Keep feature state in RxJS observables

- Status: Accepted (supersedes [ADR 3](0003-signal-based-state-service.md) on this branch)

## Context

The `main` line of this repository keeps the task board state in signals. This
branch answers the same question with RxJS, the approach Angular applications
used before signals existed and that many code bases still follow. Everything
else is identical: the domain, the repository port, the error handling and the
tests.

## Decision

`TasksStore` keeps the tasks in a `BehaviorSubject` and exposes two read-only
observables: `tasks$` and `remaining$` (derived with `map` and
`distinctUntilChanged`). The commands (`add`, `toggle`, `remove`) are unchanged.
`TasksPageComponent` subscribes through the `async` pipe.

## Alternatives considered

- **Bridging with `toSignal` and keeping the signal API.** It would keep the
  page untouched, but it hides RxJS behind signals and defeats the purpose of
  the comparison.
- **Exposing the `BehaviorSubject` itself.** Simpler to consume, but it lets any
  component push values into the store.

## Consequences

- The public contract of the store changes from signals to observables, so the
  page template changes too. This is the price of using the idiomatic API
  instead of a bridge.
- Reading the current value needs a subscription (`async` pipe, `take(1)` in
  tests) or `BehaviorSubject.value`, which is used internally and never exposed.
- Templates need `@if (x$ | async; as x)` to unwrap values, and the type of
  `async` is `T | null`, so strict templates ask for more ceremony.
- Subscriptions are managed by the `async` pipe. Any future manual subscription
  would need explicit teardown; signals do not have that risk.
- Fine-grained change detection, which signals give for free, is lost. With
  `OnPush` and `async` it still works, but through markForCheck instead.
- The team gets the full RxJS operator toolbox, which pays off when state
  depends on streams (debounce, polling, websockets) and not on this example.
