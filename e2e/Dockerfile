# syntax=docker/dockerfile:1

# Minimal image used only to run the end-to-end suite against the production build.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/prueba/browser /usr/share/nginx/html
COPY e2e/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
