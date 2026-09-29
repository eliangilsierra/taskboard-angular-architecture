# Contributing

Thanks for your interest. This document explains how to set up the project and what a good change looks like.

## Getting started

You need Node.js `^22.22.3`, `^24.15.0` or `>=26.0.0` (see `engines` in `package.json`) and, for the container and end-to-end tasks, Docker.

```bash
npm ci
npm start                 # dev server on http://localhost:4200
```

## Before opening a pull request

Run the same checks as the continuous integration pipeline:

```bash
npm run format:check      # or `npm run format` to fix
npm run lint
npm run test:ci
npm run build
npx playwright install chromium   # once
npm run e2e:container
```

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org): `type(scope): summary`, in English and in the imperative mood. The types in use are `feat`, `fix`, `refactor`, `test`, `build`, `ci`, `docs` and `style`. Keep each commit atomic: it should build and pass the tests on its own.

## Architecture

The code is organised by feature, and each feature is split into `domain`, `application`, `infrastructure` and `presentation`. The dependency direction is enforced by the linter, so a violation fails `npm run lint`. Read the [architecture decision records](docs/adr) before changing the structure.

If your change makes or reverses an architectural decision, add a short ADR in `docs/adr` with its context, the decision, the alternatives considered and the consequences, including the costs and not only the benefits.

## Tests

- New behaviour comes with unit tests next to the code (`*.spec.ts`).
- Changes to what a user can do come with an end-to-end test in `e2e/`.
- Do not disable or skip a test to make the pipeline green.
