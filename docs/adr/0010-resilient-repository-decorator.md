# 10. Add time limits and retries with a repository decorator

- Status: Accepted

## Context

Every repository call can fail for reasons that have nothing to do with the
request: a dropped connection, a server that is restarting, a call that never
answers. The application had no protection against them: a slow call left the
interface waiting forever and a transient failure was reported to the user as
a definitive error. The in-memory adapter never fails, but the port exists so
that a remote adapter can replace it.

## Decision

`ResilientTaskRepository` implements the `TaskRepository` port by wrapping
another implementation. It is bound in the providers, so it protects whichever
adapter sits behind it.

- **A time limit per attempt** (5 seconds by default). A call that exceeds it
  fails with a `TimeoutError`.
- **Retries with exponential backoff** (2 retries, waiting 200 ms and then 400 ms)
  for reads, completing and removing a task.
- **`add` is never retried.** It is not idempotent: if the response is lost after
  the server created the task, a retry would create it twice.
- **Definitive answers are not retried.** A `TaskNotFoundError` or an invalid
  title will not change on a second attempt.
- **When the retries run out**, the last error goes up unchanged and follows the
  path of [ADR 5](0005-standard-error-handling.md): it is reported, logged with a
  reference and shown in the banner.

## Alternatives considered

- **Put the retry inside each adapter.** It repeats the logic and hides it from
  the tests of the layers above.
- **An HTTP interceptor.** It only helps adapters that use `HttpClient`, and it
  cannot know which operations are idempotent.
- **Circuit breaker or bulkhead.** Useful when many callers share a struggling
  service, which is not the situation of a single-user interface.

## Consequences

- With the in-memory adapter the decorator has nothing to protect. Its value is
  realised when a remote adapter is added; until then it is verified only with
  tests that simulate failures and time.
- The policy is a constant. Making it configurable per environment is a small
  step that has not been needed yet.
- The backoff has no random jitter. That keeps the tests deterministic, but many
  clients failing at the same moment would retry in lockstep.
- Retrying a removal has a side effect: if the first attempt succeeded on the
  server but its response was lost, the retry finds nothing and the user sees
  "That task no longer exists" for a task that was in fact removed.
- A long chain of retries makes the interface wait: in the worst case a read
  takes about 15 seconds before the error appears. There is no progress
  indicator for that yet.
