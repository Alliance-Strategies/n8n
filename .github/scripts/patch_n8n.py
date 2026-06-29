#!/usr/bin/env python3
"""
Alliance Abroad — n8n License Patch Script
===========================================
Downloads compiled JS files from npm for the given n8n version,
applies the Alliance license patches, and writes them to
docker/alliance-patches/ in the current working directory.

Usage: python3 patch_n8n.py <version>
"""

import re
import sys
import tarfile
import tempfile
from pathlib import Path

import requests

PATCHES_DIR = Path("docker/alliance-patches")
DOCKERFILE = Path("docker/alliance/Dockerfile")


def get_bc_version(n8n_version: str) -> str:
    resp = requests.get(f"https://registry.npmjs.org/n8n/{n8n_version}", timeout=15)
    resp.raise_for_status()
    return resp.json().get("dependencies", {}).get("@n8n/backend-common", "latest")


def extract_from_tarball(url: str, member_path: str) -> bytes:
    resp = requests.get(url, timeout=120, stream=True)
    resp.raise_for_status()
    with tempfile.NamedTemporaryFile(suffix=".tgz") as tmp:
        for chunk in resp.iter_content(8192):
            tmp.write(chunk)
        tmp.flush()
        with tarfile.open(tmp.name, "r:gz") as tar:
            for member in tar.getmembers():
                if member.name == member_path:
                    f = tar.extractfile(member)
                    return f.read()
    raise FileNotFoundError(f"{member_path} not found in {url}")


def patch_license_js(content: bytes) -> bytes:
    """Replace the License class body with an all-unlocked stub."""
    text = content.decode("utf-8")

    stub = '''
    constructor(logger, instanceSettings, settingsRepository, licenseMetricsService, globalConfig) {
        this.refreshCallbacks = [];
        try { this.logger = logger.scoped('license'); } catch(e) { this.logger = logger; }
    }
    // Alliance Abroad Fork: all features unlocked — no license check
    async init(_opts = {}) {}
    async loadCertStr() { return 'alliance-fork'; }
    async saveCertStr(_v) {}
    onCertRefresh(_cb) { return () => {}; }
    async activate(_k, _e, _u) {}
    async reload() {}
    async renew() {}
    async clear() {}
    async shutdown() {}
    isLicensed(_f) { return true; }
    isCertValid() { return true; }
    hasFeatureInCert(_f) { return true; }
    isDynamicCredentialsEnabled() { return true; }
    isSharingEnabled() { return true; }
    isLogStreamingEnabled() { return true; }
    isLdapEnabled() { return true; }
    isSamlEnabled() { return true; }
    isAiAssistantEnabled() { return true; }
    isAskAiEnabled() { return true; }
    isAiCreditsEnabled() { return true; }
    isAdvancedExecutionFiltersEnabled() { return true; }
    isAdvancedPermissionsLicensed() { return true; }
    isDebugInEditorLicensed() { return true; }
    isBinaryDataS3Licensed() { return true; }
    isMultiMainLicensed() { return true; }
    isVariablesEnabled() { return true; }
    isSourceControlLicensed() { return true; }
    isExternalSecretsEnabled() { return true; }
    isAPIDisabled() { return false; }
    isWorkerViewLicensed() { return true; }
    isProjectRoleAdminLicensed() { return true; }
    isProjectRoleEditorLicensed() { return true; }
    isProjectRoleViewerLicensed() { return true; }
    isCustomNpmRegistryEnabled() { return true; }
    isFoldersEnabled() { return true; }
    getCurrentEntitlements() { return []; }
    getValue(f) {
        if (f === 'planName') return 'Enterprise';
        try { return constants_1.UNLIMITED_LICENSE_QUOTA; } catch(e) { return -1; }
    }
    getManagementJwt() { return ''; }
    getMainPlan() { return undefined; }
    getConsumerId() { return 'alliance-abroad-fork'; }
    getUsersLimit() { try { return constants_1.UNLIMITED_LICENSE_QUOTA; } catch(e) { return -1; } }
    getTriggerLimit() { try { return constants_1.UNLIMITED_LICENSE_QUOTA; } catch(e) { return -1; } }
    getVariablesLimit() { try { return constants_1.UNLIMITED_LICENSE_QUOTA; } catch(e) { return -1; } }
    getAiCredits() { try { return constants_1.UNLIMITED_LICENSE_QUOTA; } catch(e) { return -1; } }
    getWorkflowHistoryPruneLimit() { try { return constants_1.UNLIMITED_LICENSE_QUOTA; } catch(e) { return -1; } }
    getTeamProjectLimit() { try { return constants_1.UNLIMITED_LICENSE_QUOTA; } catch(e) { return -1; } }
    getPlanName() { return 'Enterprise'; }
    getExpiryDate() { return new Date('2099-12-31'); }
    getTerminationDate() { return null; }
    getExpiringInDays() { return undefined; }
    getTerminatingInDays() { return undefined; }
    getInfo() { return 'Alliance Abroad Fork — All features unlocked'; }
    isWithinUsersLimit() { return true; }
    enableAutoRenewals() {}
    disableAutoRenewals() {}
'''

    # Replace the License class body
    patched = re.sub(
        r'(class License \{)(.*?)(\n\};?\s*(?:License\s*=\s*__decorate|exports\.License))',
        lambda m: m.group(1) + stub + m.group(3),
        text,
        flags=re.DOTALL
    )

    if patched == text:
        print("  Warning: license.js class body pattern not matched — using fallback")
        # Fallback: just stub out the isLicensed method inline
        patched = re.sub(
            r'isLicensed\([^)]*\)\s*\{[^}]*\}',
            'isLicensed(_f) { return true; }',
            text
        )

    return patched.encode("utf-8")


def patch_controller_registry(content: bytes) -> bytes:
    """Patch createLicenseMiddleware to always call next()."""
    text = content.decode("utf-8")
    patched = re.sub(
        r'createLicenseMiddleware\([^)]*\)\s*\{.*?(?=\n\s{4}\w)',
        'createLicenseMiddleware(_feature) {\n        // Alliance fork: all features unlocked\n        return (_req, _res, next) => next();\n    }\n    ',
        text,
        flags=re.DOTALL
    )
    if patched == text:
        print("  Warning: controller.registry.js createLicenseMiddleware not found — trying inline patch")
        patched = re.sub(
            r'(createLicenseMiddleware\([^)]*\)\s*\{)[^}]*(return[^}]*\})',
            r'\1 return (_req, _res, next) => next(); }',
            text
        )
    return patched.encode("utf-8")


def patch_license_state(content: bytes) -> bytes:
    """Replace LicenseState class body with all-true stub."""
    text = content.decode("utf-8")

    stub = '''
    constructor() { this.licenseProvider = null; }
    setLicenseProvider(p) { this.licenseProvider = p; }
    // Alliance Abroad Fork: all features unlocked
    isLicensed(_f) { return true; }
    getValue(_f) { try { return constants_1.UNLIMITED_LICENSE_QUOTA; } catch(e) { return -1; } }
    isCustomRolesLicensed() { return true; }
    isDynamicCredentialsLicensed() { return true; }
    isPersonalSpacePolicyLicensed() { return true; }
    isSharingLicensed() { return true; }
    isLogStreamingLicensed() { return true; }
    isLdapLicensed() { return true; }
    isSamlLicensed() { return true; }
    isOidcLicensed() { return true; }
    isMFAEnforcementLicensed() { return true; }
    isApiKeyScopesLicensed() { return true; }
    isAiAssistantLicensed() { return true; }
    isAskAiLicensed() { return true; }
    isAiCreditsLicensed() { return true; }
    isAiGatewayLicensed() { return true; }
    isAdvancedExecutionFiltersLicensed() { return true; }
    isAdvancedPermissionsLicensed() { return true; }
    isDebugInEditorLicensed() { return true; }
    isBinaryDataS3Licensed() { return true; }
    isBinaryDataAzureLicensed() { return true; }
    isExecutionDataS3Licensed() { return true; }
    isExecutionDataAzureLicensed() { return true; }
    isMultiMainLicensed() { return true; }
    isVariablesLicensed() { return true; }
    isSourceControlLicensed() { return true; }
    isExternalSecretsLicensed() { return true; }
    isAPIDisabled() { return false; }
    isWorkerViewLicensed() { return true; }
    isProjectRoleAdminLicensed() { return true; }
    isProjectRoleEditorLicensed() { return true; }
    isProjectRoleViewerLicensed() { return true; }
    isCustomNpmRegistryLicensed() { return true; }
    isFoldersLicensed() { return true; }
    isInsightsSummaryLicensed() { return true; }
    isInsightsDashboardLicensed() { return true; }
    isInsightsHourlyDataLicensed() { return true; }
    isWorkflowDiffsLicensed() { return true; }
    isDataRedactionLicensed() { return true; }
    isProvisioningLicensed() { return true; }
    isOtelCustomSpanAttributesLicensed() { return true; }
    getMaxUsers() { try { return constants_1.UNLIMITED_LICENSE_QUOTA; } catch(e) { return -1; } }
    getMaxActiveWorkflows() { try { return constants_1.UNLIMITED_LICENSE_QUOTA; } catch(e) { return -1; } }
    getMaxVariables() { try { return constants_1.UNLIMITED_LICENSE_QUOTA; } catch(e) { return -1; } }
    getMaxAiCredits() { try { return constants_1.UNLIMITED_LICENSE_QUOTA; } catch(e) { return -1; } }
    getWorkflowHistoryPruneQuota() { try { return constants_1.UNLIMITED_LICENSE_QUOTA; } catch(e) { return -1; } }
    getInsightsMaxHistory() { try { return constants_1.UNLIMITED_LICENSE_QUOTA; } catch(e) { return -1; } }
    getInsightsRetentionMaxAge() { try { return constants_1.UNLIMITED_LICENSE_QUOTA; } catch(e) { return -1; } }
    getInsightsRetentionPruneInterval() { return 24; }
    getMaxTeamProjects() { try { return constants_1.UNLIMITED_LICENSE_QUOTA; } catch(e) { return -1; } }
    isTeamProjectsLicensed() { return true; }
    getMaxWorkflowsWithEvaluations() { try { return constants_1.UNLIMITED_LICENSE_QUOTA; } catch(e) { return -1; } }
    getEvaluationConcurrencyQuota() { return undefined; }
'''

    patched = re.sub(
        r'(class LicenseState \{)(.*?)(\n\};?\s*(?:LicenseState\s*=\s*__decorate|exports\.LicenseState))',
        lambda m: m.group(1) + stub + m.group(3),
        text,
        flags=re.DOTALL
    )

    if patched == text:
        print("  Warning: license-state.js class body pattern not matched — using fallback")
        patched = re.sub(
            r'isLicensed\([^)]*\)\s*\{[^}]*\}',
            'isLicensed(_f) { return true; }',
            text
        )

    return patched.encode("utf-8")


def update_dockerfile_version(version: str):
    """Update the n8n version in the Dockerfile."""
    content = DOCKERFILE.read_text()
    updated = re.sub(
        r'(RUN npm install -g n8n@)\d+\.\d+\.\d+',
        f'\\g<1>{version}',
        content
    )
    if updated != content:
        DOCKERFILE.write_text(updated)
        print(f"  Updated Dockerfile: n8n version → {version}")
    else:
        print(f"  Dockerfile already references n8n@{version} or pattern not found")


def main():
    if len(sys.argv) < 2:
        print("Usage: patch_n8n.py <version>")
        sys.exit(1)

    version = sys.argv[1]
    print(f"Patching n8n@{version}...")

    PATCHES_DIR.mkdir(parents=True, exist_ok=True)

    # Get @n8n/backend-common version
    bc_version = get_bc_version(version)
    print(f"  @n8n/backend-common version: {bc_version}")

    # Download and patch license.js
    print("  Downloading n8n/dist/license.js...")
    license_raw = extract_from_tarball(
        f"https://registry.npmjs.org/n8n/-/n8n-{version}.tgz",
        "package/dist/license.js"
    )
    (PATCHES_DIR / "license.js").write_bytes(patch_license_js(license_raw))
    print("  ✓ license.js patched")

    # Download and patch controller.registry.js
    print("  Downloading n8n/dist/controller.registry.js...")
    ctrl_raw = extract_from_tarball(
        f"https://registry.npmjs.org/n8n/-/n8n-{version}.tgz",
        "package/dist/controller.registry.js"
    )
    (PATCHES_DIR / "controller.registry.js").write_bytes(patch_controller_registry(ctrl_raw))
    print("  ✓ controller.registry.js patched")

    # Download and patch license-state.js
    print(f"  Downloading @n8n/backend-common@{bc_version}/dist/license-state.js...")
    state_raw = extract_from_tarball(
        f"https://registry.npmjs.org/@n8n/backend-common/-/backend-common-{bc_version}.tgz",
        "package/dist/license-state.js"
    )
    (PATCHES_DIR / "license-state.js").write_bytes(patch_license_state(state_raw))
    print("  ✓ license-state.js patched")

    # Update Dockerfile
    update_dockerfile_version(version)

    print(f"\nAll patches applied for n8n@{version}")


if __name__ == "__main__":
    main()
