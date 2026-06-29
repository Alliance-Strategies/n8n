# Alliance Abroad — n8n Fork

This is the Alliance Abroad fork of [n8n-io/n8n](https://github.com/n8n-io/n8n).

## What's different

The upstream n8n codebase gates enterprise features behind a license check that calls the `@n8n_io/license-sdk` package. This fork patches three compiled JS files at Docker build time to bypass that enforcement entirely — no source rebuild required.

| File | Patch |
|---|---|
| `packages/cli/dist/license.js` | `isLicensed()` always returns `true`, plan = `Enterprise`, all quotas = `UNLIMITED_LICENSE_QUOTA` |
| `packages/cli/dist/controller.registry.js` | `createLicenseMiddleware()` always calls `next()` |
| `@n8n/backend-common/dist/license-state.js` | All feature/quota checks return `true`/`UNLIMITED` |

The patches live in `docker/alliance-patches/` and are applied by the `docker/alliance/Dockerfile` which installs n8n from npm and then overwrites the three files.

## Deployment

The Alliance fork runs on GKE `globus-cluster-development` in the `n8n` namespace. The image is hosted in Artifact Registry:

```
us-central1-docker.pkg.dev/skilled-script-469819-f2/alliance-abroad/n8n:latest
```

The GKE deployment manifest is in [Alliance-Strategies/n8n-migration](https://github.com/Alliance-Strategies/n8n-migration/blob/development/k8s/04-deployment.yaml).

## Keeping up with upstream

### Automated (GitHub Actions)

The `alliance-upstream-sync.yml` workflow runs every Monday at 06:00 UTC. It:

1. Checks npm for the latest n8n version
2. Downloads the new compiled JS files
3. Re-applies the patches via `.github/scripts/patch_n8n.py`
4. Commits updated patches and triggers a new Docker build
5. Deploys to GKE development
6. Posts an HTML summary to the Platform Pulse Teams channel

**One-time setup required** — the workflow file needs to be added via the GitHub UI (or a PAT with `workflow` scope) because the GitHub App token used by this agent does not have `workflow` write permission:

1. Go to [Actions → New workflow](https://github.com/Alliance-Strategies/n8n/new/master?filename=.github%2Fworkflows%2Falliance-upstream-sync.yml) in the GitHub UI
2. Paste the contents of `.github/workflows/alliance-upstream-sync.yml` (already committed to this repo)
3. Add the following secrets to the repo:
   - `GCP_WIF_PROVIDER` — Workload Identity Federation provider
   - `GCP_SERVICE_ACCOUNT` — `manus-agent-sa@skilled-script-469819-f2.iam.gserviceaccount.com`
   - `TEAMS_BOT_APP_ID` — Teams bot app ID
   - `TEAMS_BOT_APP_SECRET` — Teams bot app secret

### Manual patch update

```bash
# Update patches for a specific version
python3 .github/scripts/patch_n8n.py 2.27.0

# Build and push
docker build -f docker/alliance/Dockerfile -t us-central1-docker.pkg.dev/skilled-script-469819-f2/alliance-abroad/n8n:2.27.0-alliance .
docker push us-central1-docker.pkg.dev/skilled-script-469819-f2/alliance-abroad/n8n:2.27.0-alliance

# Deploy
kubectl set image deployment/n8n n8n=us-central1-docker.pkg.dev/skilled-script-469819-f2/alliance-abroad/n8n:2.27.0-alliance -n n8n
kubectl rollout status deployment/n8n -n n8n
```

## Upstream sync

The upstream remote is configured:

```bash
git remote add upstream https://github.com/n8n-io/n8n.git
git fetch upstream
```

The fork tracks `master` (upstream default branch). The Alliance patches are applied at the Docker build layer — not as source commits — so upstream merges are clean.

## Related repos

- [Alliance-Strategies/n8n-migration](https://github.com/Alliance-Strategies/n8n-migration) — GKE manifests
- [Alliance-Strategies/n8n-workflows](https://github.com/Alliance-Strategies/n8n-workflows) — workflow JSON source of truth
- [Alliance-Strategies/vertex-agents/n8n-upstream-sync-agent](https://github.com/Alliance-Strategies/vertex-agents/tree/main/n8n-upstream-sync-agent) — Vertex agent for sync
