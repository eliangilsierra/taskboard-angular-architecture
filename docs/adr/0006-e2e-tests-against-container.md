# 6. End-to-end tests with Playwright against the production container

- Status: Accepted

## Context

The unit tests run in Karma against the source code. Nothing verified that the
application that actually ships (the production build behind a web server)
starts, routes and behaves the way the source suggests. Things like the base
`href`, the fallback for client-side routes or a broken bundle are only visible
once it is built and served.

## Decision

- **Playwright** drives a real browser through the flows a user cares about:
  adding, trimming, completing, reopening and removing tasks, the limits of the
  form, the redirect from `/` and a deep link to `/tasks`. Tests are written with
  role and label locators, and a small page object keeps them readable.
- **The target is a deployment, not the dev server.** The suite reads its base
  URL from `E2E_BASE_URL`, so the same tests can run against a container, a
  staging environment or a local build.
- **A container built for the tests.** `e2e/Dockerfile` builds the production
  bundle and serves it with plain nginx and a single fallback rule.
  `e2e/docker-compose.yml` runs it with a health check, and
  `scripts/e2e-container.sh` builds, waits until it is healthy, runs the suite
  and always tears the container down.
- **Self-contained.** This image does not depend on any other Dockerfile of the
  repository, so the branch works on its own.

## Alternatives considered

- **Karma or Angular's component tests only.** Fast, but they cannot see the
  shipped artifact.
- **Playwright's `webServer` option running `ng serve`.** Convenient, but it
  tests the development build, not what is deployed.
- **Running the browser inside the compose file.** It removes the need to
  install browsers locally, at the price of a multi-gigabyte image and a more
  fragile setup. The browser stays on the host for now.
- **Cypress.** Comparable. Playwright was chosen for its parallelism, built-in
  auto-waiting and the traces it records when a test fails.

## Consequences

- Contributors must download a browser once (`npx playwright install chromium`),
  which weighs in the hundreds of megabytes.
- The suite needs Docker to test the container, and an image build of about a
  minute before the first test can start.
- End-to-end tests are slower and more fragile than unit tests. The suite is
  deliberately small: it covers user flows, not every branch of the code.
- The application keeps its data in memory, so each test starts from an empty
  board and tests can run in parallel. That will change as soon as a real
  backend exists, and tests will then need to control their data.
- Error handling cannot be exercised through the interface yet, because the
  in-memory repository never fails. Those paths remain covered by unit tests.
- Rules that belong to the server, such as answering 404 for a missing static
  file, are not checked here because the test image has a minimal
  configuration. They need to be added where the production server
  configuration lives.
