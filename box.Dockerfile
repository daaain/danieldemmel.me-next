# Dev box for foldyard: foldyard's generic box (podman client + git + uv) on a Node 24 base,
# so `yarn`, `biome`, `tsc` etc. run in the box. Yarn 1 ships with the official node image.
FROM node:24-trixie-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

RUN apt-get update \
 && apt-get install -y --no-install-recommends git podman ca-certificates curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
