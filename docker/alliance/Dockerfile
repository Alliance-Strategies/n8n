# Alliance Abroad — License-Free n8n Fork
# Build strategy: Install n8n from npm on standard node:alpine, then patch license files
#
# This avoids the n8nio/base image tar format issues in Cloud Build.

FROM node:24-alpine AS installer

# Install n8n from npm
RUN npm install -g n8n@2.26.9 --omit=dev 2>&1 | tail -5

# Apply Alliance patches to the installed n8n
COPY docker/alliance-patches/license.js \
     /usr/local/lib/node_modules/n8n/dist/license.js

COPY docker/alliance-patches/controller.registry.js \
     /usr/local/lib/node_modules/n8n/dist/controller.registry.js

# Patch @n8n/backend-common license-state.js in both possible locations
COPY docker/alliance-patches/license-state.js /tmp/alliance-license-state.js

RUN set -e; \
    HOISTED="/usr/local/lib/node_modules/n8n/node_modules/@n8n/backend-common/dist/license-state.js"; \
    NESTED="/usr/local/lib/node_modules/@n8n/backend-common/dist/license-state.js"; \
    if [ -f "$HOISTED" ]; then cp /tmp/alliance-license-state.js "$HOISTED" && echo "Patched hoisted"; fi; \
    if [ -f "$NESTED" ]; then cp /tmp/alliance-license-state.js "$NESTED" && echo "Patched nested"; fi; \
    rm /tmp/alliance-license-state.js; \
    echo "Alliance patches applied"

# Runtime image
FROM node:24-alpine

ENV NODE_ENV=production \
    N8N_RELEASE_TYPE=stable \
    SHELL=/bin/sh

# Install runtime dependencies (tini for signal handling)
RUN apk add --no-cache tini su-exec

# Copy installed n8n from installer stage
COPY --from=installer /usr/local/lib/node_modules/n8n /usr/local/lib/node_modules/n8n
COPY --from=installer /usr/local/bin/n8n /usr/local/bin/n8n 2>/dev/null || true

# Create n8n symlink if not copied
RUN ln -sf /usr/local/lib/node_modules/n8n/bin/n8n /usr/local/bin/n8n 2>/dev/null || true

# Create node user data directory
RUN addgroup -S node 2>/dev/null || true && \
    adduser -S -G node node 2>/dev/null || true && \
    mkdir -p /home/node/.n8n && \
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
