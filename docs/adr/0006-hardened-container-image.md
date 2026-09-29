# 6. Ship a multi-stage, unprivileged nginx image

- Status: Accepted

## Context

The Dockerfile inherited from the scaffold had several problems:

- It lived in `src/app/Dockerfile.Dockerfile`, out of the build context's root.
- It ran as root on `node:18`, which is out of support and cannot run the
  current Angular CLI.
- It compiled the application and then threw the result away: the container
  started `ng serve`, a development server, to serve production traffic.
- It had no `.dockerignore`, so `node_modules` and `.git` were sent to the
  daemon, and no health check.

## Decision

- **Multi-stage build.** A `node:24-alpine` stage runs `npm ci` and
  `npm run build`. Only the compiled files reach the runtime stage.
- **Unprivileged runtime.** `nginxinc/nginx-unprivileged` serves the files as
  the `nginx` user (uid 101) on port 8080, so no capability is needed to bind
  the port.
- **Explicit server configuration** (`docker/nginx.conf`):
  - client-side routes fall back to `index.html`, but a missing file with an
    extension is a real 404;
  - content-hashed bundles are cached for a year as `immutable`, everything else
    (including `index.html`) is revalidated;
  - responses are gzip-compressed, `server_tokens` is off, and a
    `/healthz` endpoint backs the image `HEALTHCHECK`;
  - security headers: `X-Content-Type-Options`, `X-Frame-Options`,
    `Referrer-Policy`, `Permissions-Policy` and a partial
    `Content-Security-Policy` (`base-uri`, `object-src`, `frame-ancestors`).
- **Restrictive defaults at run time**, expressed in `docker-compose.yml`:
  read-only root file system, `tmpfs` for `/tmp`, all capabilities dropped and
  `no-new-privileges`.

## Alternatives considered

- **Keep serving with Node.** Fewer moving parts, but it ships a runtime and the
  whole dependency tree for what are static files.
- **A distroless or Caddy image.** Smaller or simpler in some respects, but
  nginx is the most widely understood option and has a maintained unprivileged
  variant.
- **A full `Content-Security-Policy`.** The production `index.html` contains an
  inline script that activates the inlined critical CSS. A `script-src` that
  blocks it leaves the page unstyled, so the policy was limited to the
  directives that are safe today.

## Consequences

- The `script-src` and `style-src` directives are still missing. The right fix
  is in the build (Angular's `autoCsp` option generates hashes for the inline
  script), not in the server, and it deserves its own change.
- The image tags (`node:24-alpine`, `nginx-unprivileged:1.31-alpine`) float
  within a release line. Rebuilds are not bit-for-bit reproducible, and pinning
  digests needs automation to stay current.
- The `environment` file is compiled into the bundle, so each environment needs
  its own image.
- nginx listens on plain HTTP and on IPv4 only. TLS is expected to be handled by
  a reverse proxy or an ingress. IPv6 was left out because nginx aborts at start
  on hosts without IPv6 support, and the image's own script that enables it
  conditionally no longer applies once the default configuration is replaced.
- The `HEALTHCHECK` relies on BusyBox `wget` from the base image, which couples
  it to that image.
- `docker-compose.yml` exists to document the run-time restrictions. A
  production orchestrator has to express the same restrictions in its own
  format.
