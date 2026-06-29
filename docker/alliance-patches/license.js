"use strict";
/**
 * Alliance Abroad — License-Free Fork
 * Compiled patch: packages/cli/src/license.ts
 * All license checks bypassed. All features unlocked. Plan = Enterprise.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.License = void 0;
const backend_common_1 = require("@n8n/backend-common");
const config_1 = require("@n8n/config");
const constants_1 = require("@n8n/constants");
const db_1 = require("@n8n/db");
const decorators_1 = require("@n8n/decorators");
const di_1 = require("@n8n/di");
const n8n_core_1 = require("n8n-core");
const license_metrics_service_1 = require("./metrics/license-metrics.service");

let License = class License {
    constructor(logger, instanceSettings, settingsRepository, licenseMetricsService, globalConfig) {
        this.refreshCallbacks = [];
        this.logger = logger.scoped('license');
    }
    async init({ forceRecreate = false, isCli = false } = {}) {
        // Alliance fork: license SDK bypassed — all features unlocked
        this.logger.debug('Alliance fork: license check bypassed, all features enabled');
    }
    async loadCertStr() {
        return 'alliance-fork-unlicensed';
    }
    async saveCertStr(_value) {
        // no-op
    }
    onCertRefresh(refreshCallback) {
        this.refreshCallbacks.push(refreshCallback);
        return () => {
            const index = this.refreshCallbacks.indexOf(refreshCallback);
            if (index > -1) this.refreshCallbacks.splice(index, 1);
        };
    }
    async activate(_activationKey, _eulaUri, _userEmail) { }
    async reload() { }
    async renew() { }
    async clear() { }
    async shutdown() { }
    isLicensed(_feature) { return true; }
    isCertValid() { return true; }
    hasFeatureInCert(_feature) { return true; }
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
    getValue(feature) {
        if (feature === 'planName') return 'Enterprise';
        return constants_1.UNLIMITED_LICENSE_QUOTA;
    }
    getManagementJwt() { return ''; }
    getMainPlan() { return undefined; }
    getConsumerId() { return 'alliance-abroad-fork'; }
    getUsersLimit() { return constants_1.UNLIMITED_LICENSE_QUOTA; }
    getTriggerLimit() { return constants_1.UNLIMITED_LICENSE_QUOTA; }
    getVariablesLimit() { return constants_1.UNLIMITED_LICENSE_QUOTA; }
    getAiCredits() { return constants_1.UNLIMITED_LICENSE_QUOTA; }
    getWorkflowHistoryPruneLimit() { return constants_1.UNLIMITED_LICENSE_QUOTA; }
    getTeamProjectLimit() { return constants_1.UNLIMITED_LICENSE_QUOTA; }
    getPlanName() { return 'Enterprise'; }
    getExpiryDate() { return new Date('2099-12-31'); }
    getTerminationDate() { return null; }
    getExpiringInDays() { return undefined; }
    getTerminatingInDays() { return undefined; }
    getInfo() { return 'Alliance Abroad Fork — All features unlocked'; }
    isWithinUsersLimit() { return true; }
    enableAutoRenewals() { }
    disableAutoRenewals() { }
};
__decorate([
    (0, decorators_1.OnPubSubEvent)('reload-license'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], License.prototype, "reload", null);
__decorate([
    (0, decorators_1.OnShutdown)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], License.prototype, "shutdown", null);
__decorate([
    (0, decorators_1.OnLeaderTakeover)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], License.prototype, "enableAutoRenewals", null);
__decorate([
    (0, decorators_1.OnLeaderStepdown)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], License.prototype, "disableAutoRenewals", null);
License = __decorate([
    (0, di_1.Service)(),
    __metadata("design:paramtypes", [backend_common_1.Logger, n8n_core_1.InstanceSettings, db_1.SettingsRepository, license_metrics_service_1.LicenseMetricsService, config_1.GlobalConfig])
], License);
exports.License = License;
