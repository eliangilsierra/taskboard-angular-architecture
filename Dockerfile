# syntax=docker/dockerfile:1

# ---- Build: compile the application with the same Node line the CLI requires ----
FROM node:26-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .
RUN npm run build

# ---- Runtime: static files behind an unprivileged nginx ----
FROM nginxinc/nginx-unprivileged:1.31-alpine AS runtime

COPY --from=build /app/dist/prueba/browser /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

USER nginx
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
