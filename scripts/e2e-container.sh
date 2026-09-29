#!/usr/bin/env bash
# Builds the production image, starts it, runs the end-to-end suite against it
# and always tears the container down afterwards.
set -euo pipefail

compose=(docker compose)
cleanup() { "${compose[@]}" down --volumes --remove-orphans; }
trap cleanup EXIT

"${compose[@]}" up --build --detach --wait
npx playwright test "$@"
