# 5. Route every error through Angular's ErrorHandler

- Status: Accepted

## Context

Before this change, repository failures were subscribed to without an error
callback. A missing task or a broken storage ended as an uncaught exception in
the console while the interface silently kept showing stale data. Validation
failures were thrown from the store and depended on each caller to catch them.

## Decision

- **One shape for the UI.** `AppError` carries a `kind` (`validation`,
  `not-found`, `unexpected`), a message that is safe to show to users, and the
  original `cause`.
- **One sink.** `GlobalErrorHandler` replaces Angular's `ErrorHandler`. It
  converts whatever it receives into an `AppError`, logs the original cause only
  for unexpected errors, and passes the error to `ErrorNotifier`.
- **One place to show them.** `ErrorNotifier` keeps the latest notifications in
  a signal and `ErrorBannerComponent` renders them in the application shell.
- **Features translate their own errors.** `toTaskAppError` maps the tasks
  domain errors to `AppError`. `core` never imports from a feature, so the
  dependency direction from ADR 0002 is preserved.
- **The store reports and carries on.** `TasksStore` no longer throws or
  ignores failures: it hands them to the injected `ErrorHandler` and leaves its
  state unchanged.

## Alternatives considered

- **An `error` signal in every store.** Explicit and local, but each feature
  would need its own display and the unexpected errors thrown by Angular would
  still bypass it.
- **`try/catch` in components.** Scatters the policy and is easy to forget.
- **An HTTP interceptor.** The application does no HTTP yet, so it would be
  dead code. When a remote adapter is added, an interceptor should only turn
  `HttpErrorResponse` into `AppError` and rethrow; the rest of the pipeline
  stays as it is.

## Consequences

- Users see a generic message for anything unexpected, so the details are only
  in the console. There is no remote logging yet.
- Messages are plain English strings, not translated.
- Every feature has to write and test its own error mapper.
- Reporting through `ErrorHandler` makes tests need a stub for it, otherwise
  reported errors end in the test output.
- The banner lives in `core`, which mixes a UI component into a folder meant for
  infrastructure. It is the only such case, and it moves if a shared UI folder
  appears.
