# 11. Verify every change with GitHub Actions

- Status: Accepted

## Context

The project now has a formatter, a linter with layer rules, unit tests, a
production image and an end-to-end suite. Until something runs them on every
change, they are only as reliable as each contributor's memory.

## Decision

A workflow (`.github/workflows/ci.yml`) runs on every pull request and on pushes
to `main`, `develop` and `flagship`, with two jobs:

- **`quality`**: `npm ci`, `format:check`, `lint`, the unit tests in headless
  Chrome (`test:ci`) and the production build.
- **`e2e`**, which starts only if `quality` passes: it installs Chromium and runs
  `npm run e2e:container`, which builds the production image, starts it and runs
  the Playwright suite against it. The report is uploaded when the job fails.

Supporting decisions:

- The workflow can only read the repository (`permissions: contents: read`) and
  a new run cancels the previous one for the same ref.
- `karma.conf.js` is part of the repository and adds a `ChromeHeadlessCI`
  launcher without the browser sandbox, which CI runners restrict. Contributors
  and CI run the same command.
- Dependabot proposes weekly updates for npm packages (Angular and ESLint
  packages grouped), the Docker base images and the actions themselves.

## Alternatives considered

- **Run everything in a single job.** Simpler, but a formatting mistake would
  cost a full image build before anyone finds out.
- **Pin actions to a commit SHA.** More resistant to a compromised tag; with
  Dependabot it stays maintainable, but it is unreadable in review. The actions
  are pinned to a major version for now.
- **A matrix of Node versions and browsers.** The project supports the Node
  versions the Angular CLI does, but only one is used to build the shipped
  artifact, so the extra runs would not add information.

## Consequences

- The workflow could only be checked statically (`actionlint`) and by running
  each of its commands locally. Its first real run is on GitHub.
- A green pipeline does not stop anyone from merging. That requires branch
  protection rules in the repository settings, which are outside the code.
- The end-to-end job builds the image from scratch every time (about a minute)
  and downloads a browser. Caching layers would speed it up at the cost of
  more configuration.
- Only Chromium is exercised, in both unit and end-to-end tests.
- There is no deployment, release or coverage reporting; those are separate
  decisions.
- Dependabot will open pull requests that trigger the pipeline. Someone has to
  review them, or the queue grows.
