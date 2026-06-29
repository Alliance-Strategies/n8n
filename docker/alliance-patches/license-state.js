"use strict";
/**
 * Alliance Abroad — License-Free Fork
 * Compiled patch: packages/@n8n/backend-common/src/license-state.ts
 * All feature checks return true. All quotas return UNLIMITED_LICENSE_QUOTA.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseState = void 0;
const constants_1 = require("@n8n/constants");
const di_1 = require("@n8n/di");

let LicenseState = class LicenseState {
    constructor() {
        this.licenseProvider = null;
    }
    setLicenseProvider(provider) {
        this.licenseProvider = provider;
    }
    // All feature checks return true / unlimited
    isLicensed(_feature) { return true; }
    getValue(_feature) { return constants_1.UNLIMITED_LICENSE_QUOTA; }
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
    getMaxUsers() { return constants_1.UNLIMITED_LICENSE_QUOTA; }
    getMaxActiveWorkflows() { return constants_1.UNLIMITED_LICENSE_QUOTA; }
    getMaxVariables() { return constants_1.UNLIMITED_LICENSE_QUOTA; }
    getMaxAiCredits() { return constants_1.UNLIMITED_LICENSE_QUOTA; }
    getWorkflowHistoryPruneQuota() { return constants_1.UNLIMITED_LICENSE_QUOTA; }
    getInsightsMaxHistory() { return constants_1.UNLIMITED_LICENSE_QUOTA; }
    getInsightsRetentionMaxAge() { return constants_1.UNLIMITED_LICENSE_QUOTA; }
    getInsightsRetentionPruneInterval() { return 24; }
    getMaxTeamProjects() { return constants_1.UNLIMITED_LICENSE_QUOTA; }
    isTeamProjectsLicensed() { return true; }
    getMaxWorkflowsWithEvaluations() { return constants_1.UNLIMITED_LICENSE_QUOTA; }
    getEvaluationConcurrencyQuota() { return undefined; }
};
LicenseState = __decorate([
    (0, di_1.Service)()
], LicenseState);
exports.LicenseState = LicenseState;
