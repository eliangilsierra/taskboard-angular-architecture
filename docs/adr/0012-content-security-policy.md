# 12. Generate a hash-based script policy at build time

- Status: Accepted

## Context

[ADR 6](0006-hardened-container-image.md) left the `script-src` directive out of
the `Content-Security-Policy` sent by the web server. The production
`index.html` contains two inline scripts (one bootstraps the application
bundles, the other activates the stylesheet that the build inlines as critical
CSS), so a policy that only allows `'self'` would leave the page unstyled or
blank. The server cannot know the hashes of scripts that change with every
build.

## Decision

Enable Angular's `security.autoCsp` option for the production build. The build
computes the hash of every inline script it emits and writes a policy into a
`<meta>` tag of `index.html`:

- `script-src` allows those hashes and `'strict-dynamic'`, so the scripts they
  load are trusted, and nothing else can run;
- `object-src 'none'` and `base-uri 'self'`.

The web server keeps sending the directives that a `<meta>` tag cannot express
(`frame-ancestors`) together with `base-uri` and `object-src`. Both policies apply
at once and the browser enforces their intersection.

A permanent end-to-end test loads the page from the production image, uses it,
and fails on any console error or warning, which is how a policy violation shows
up.

## Alternatives considered

- **Hashes in the nginx configuration.** They change with every build, so they
  would have to be generated and injected into the image, duplicating what the
  build already does.
- **Nonces.** A nonce has to be different for every response, which needs a
  server that renders the page. The application is served as static files.
- **Leave scripts unrestricted.** The current state before this change; it gives
  up the main protection a policy offers against injected scripts.

## Consequences

- There is still no `style-src`. Angular writes component styles into `<style>`
  elements at run time, which would need a nonce or `'unsafe-inline'`. A style
  injection is a smaller risk than a script injection, and a wider policy would
  add no protection.
- The option is marked as experimental by the Angular team and its output may
  change between versions. The end-to-end test is there to notice it.
- The policy applies to the production build only. The development server does
  not have it, so a violation cannot be seen while developing; it appears in the
  production image and in the pipeline.
- Anything added to `index.html` later, such as an analytics script, changes the
  hashes and has to go through the build to be allowed.
- The fallback directives that the generated policy contains for browsers
  without `'strict-dynamic'` support (`https:` and `'unsafe-inline'`) make it
  weaker there.
