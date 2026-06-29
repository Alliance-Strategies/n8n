# Alliance Abroad — License-Free n8n Fork
# Build strategy: Install n8n from npm on standard node:alpine, then patch license files.
# This avoids the n8nio/base image tar format issues in Cloud Build.

# ── Stage 1: Install and patch ────────────────────────────────────────────────
FROM node:24-alpine AS installer

# Install n8n from npm (global install)
RUN npm install -g n8n@2.26.9 --omit=dev

# Apply Alliance patch: license.js — isLicensed() always returns true
COPY docker/alliance-patches/license.js \
     /usr/local/lib/node_modules/n8n/dist/license.js

# Apply Alliance patch: controller.registry.js — license middleware always calls next()
COPY docker/alliance-patches/controller.registry.js \
     /usr/local/lib/node_modules/n8n/dist/controller.registry.js

# Apply Alliance patch: license-state.js — all feature/quota checks return true/UNLIMITED
COPY docker/alliance-patches/license-state.js /tmp/alliance-license-state.js

RUN set -e; \
    HOISTED="/usr/local/lib/node_modules/n8n/node_modules/@n8n/backend-common/dist/license-state.js"; \
    NESTED="/usr/local/lib/node_modules/@n8n/backend-common/dist/license-state.js"; \
    if [ -f "$HOISTED" ]; then cp /tmp/alliance-license-state.js "$HOISTED" && echo "Patched hoisted @n8n/backend-common"; fi; \
    if [ -f "$NESTED" ]; then cp /tmp/alliance-license-state.js "$NESTED" && echo "Patched nested @n8n/backend-common"; fi; \
    rm /tmp/alliance-license-state.js; \
    echo "Alliance license patches applied successfully"

# ── Stage 2: Runtime image ────────────────────────────────────────────────────
FROM node:24-alpine

ENV NODE_ENV=production \
    N8N_RELEASE_TYPE=stable \
    SHELL=/bin/sh

# Install tini (signal handling) and su-exec
RUN apk add --no-cache tini su-exec

# Copy patched n8n installation from installer stage
COPY --from=installer /usr/local/lib/node_modules/n8n /usr/local/lib/node_modules/n8n

# Create the n8n CLI symlink (npm global install creates this in the installer stage
# but it may be a symlink to the installer's node_modules path — recreate it cleanly)
RUN ln -sf /usr/local/lib/node_modules/n8n/bin/n8n /usr/local/bin/n8n

# Create node user and data directory
RUN addgroup -S node 2>/dev/null; \
    adduser -S -G node node 2>/dev/null; \
    mkdir -p /home/node/.n8n; \
    chown -R node:node /home/node

WORKDIR /home/node

EXPOSE 5678/tcp

USER node

ENTRYPOINT ["/sbin/tini", "--", "n8n"]

LABEL org.opencontainers.image.title="n8n (Alliance Abroad Fork)" \
      org.opencontainers.image.description="n8n with enterprise license enforcement removed" \
      org.opencontainers.image.source="https://github.com/Alliance-Strategies/n8n" \
      alliance.fork.upstream="n8n-io/n8n@2.26.9" \
      alliance.fork.patches="license.js,controller.registry.js,license-state.js"
