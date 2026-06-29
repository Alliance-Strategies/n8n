# Alliance Abroad — License-Free n8n Fork
#
# Strategy: Start from the official n8n image and overwrite the three compiled
# JS files that enforce license checks. No full source build required.
#
# Patched files:
#   1. /usr/local/lib/node_modules/n8n/dist/license.js
#      → License class: isLicensed() always returns true, plan = Enterprise
#   2. /usr/local/lib/node_modules/n8n/dist/controller.registry.js
#      → createLicenseMiddleware() always calls next()
#   3. @n8n/backend-common dist/license-state.js (both possible locations)
#      → LicenseState: all checks return true, all quotas = UNLIMITED

ARG N8N_VERSION=latest
FROM n8nio/n8n:${N8N_VERSION}

# Switch to root to overwrite protected files
USER root

# Copy patched compiled JS files
COPY --chown=node:node alliance-patches/license.js \
     /usr/local/lib/node_modules/n8n/dist/license.js

COPY --chown=node:node alliance-patches/controller.registry.js \
     /usr/local/lib/node_modules/n8n/dist/controller.registry.js

# Patch @n8n/backend-common license-state.js
# Try both hoisted and nested locations (pnpm workspace deploy can place it either way)
COPY --chown=node:node alliance-patches/license-state.js /tmp/alliance-license-state.js

RUN set -e; \
    # Patch hoisted location (most common in pnpm deploy)
    HOISTED="/usr/local/lib/node_modules/n8n/node_modules/@n8n/backend-common/dist/license-state.js"; \
    NESTED="/usr/local/lib/node_modules/@n8n/backend-common/dist/license-state.js"; \
    if [ -f "$HOISTED" ]; then \
        cp /tmp/alliance-license-state.js "$HOISTED"; \
        echo "Patched hoisted @n8n/backend-common"; \
    fi; \
    if [ -f "$NESTED" ]; then \
        cp /tmp/alliance-license-state.js "$NESTED"; \
        echo "Patched nested @n8n/backend-common"; \
    fi; \
    rm /tmp/alliance-license-state.js; \
    echo "Alliance license patches applied successfully"

# Drop back to node user
USER node

LABEL org.opencontainers.image.title="n8n (Alliance Abroad Fork)" \
      org.opencontainers.image.description="n8n with enterprise license enforcement removed — Alliance Abroad internal use only" \
      org.opencontainers.image.source="https://github.com/Alliance-Strategies/n8n" \
      alliance.fork.upstream="n8n-io/n8n" \
      alliance.fork.patches="license.js,controller.registry.js,license-state.js"
