# 9. A logger port and a reference for every error

- Status: Accepted

## Context

The global error handler from [ADR 5](0005-standard-error-handling.md) wrote to
`console.error` directly. That made it impossible to change the verbosity per
environment, to test what is logged without spying on the console, or to swap
the destination later. It also left users and developers without a way to talk
about the same failure: the interface said "Something went wrong" and the
console showed a stack trace.

## Decision

- **A `Logger` port** with `debug`, `info`, `warn` and `error`, each taking a
  message and an optional structured context. Code depends on the abstract class;
  `ConsoleLogger` is the only adapter and is bound in `provideLogging()`.
- **The level comes from the environment configuration.** Production logs `warn`
  and above, development logs everything. Anything below the threshold is
  dropped before it reaches the console.
- **Expected errors are logged at `info` level and unexpected errors at `error`
  level**, with their cause. Task titles or any other user input are never put
  in the context.
- **Every `AppError` has a short `id`.** It is written to the log, and the
  banner shows it to the user for unexpected errors only ("Reference: ab12cd34").
  A person can quote it in a report and a developer can find the matching log
  line.

## Alternatives considered

- **Keep using `console` directly.** Nothing to maintain, but nothing to test
  or configure.
- **A logging library.** More features (transports, formatting), at the cost of a
  dependency for what is one adapter today.
- **A longer identifier such as a UUID.** `crypto.randomUUID` is only available
  in secure contexts, and the application can be served over plain HTTP behind a
  proxy. Eight characters are enough to find a line in a session's log.

## Consequences

- Messages only exist in the browser console. Without a remote adapter, an
  error that happens on a user's machine is not visible to the team; the
  reference only helps when the user can copy the console output or the adapter
  ships the log somewhere. Writing that adapter is the natural next step.
- The reference is not guaranteed to be unique across sessions or users. It is
  a search hint, not a key.
- The level is fixed when the application is built. Turning on debug logging in
  production means rebuilding, which matches the decision in
  [ADR 4](0004-typed-runtime-configuration.md).
- Handled errors are logged at `info` level, which production hides. If they
  turn out to matter for support, the threshold or the level has to change.
