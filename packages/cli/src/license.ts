/**
 * Alliance Abroad — License-Free Fork
 *
 * This file replaces the upstream n8n license enforcement with a stub that
 * grants all features unconditionally. The @n8n_io/license-sdk is NOT called.
 *
 * Patched by: alliance-platform-bot
 * Upstream file: packages/cli/src/license.ts
 */
import type { LicenseProvider } from '@n8n/backend-common';
import { Logger } from '@n8n/backend-common';
import { GlobalConfig } from '@n8n/config';
import {
	DEFAULT_WORKFLOW_HISTORY_PRUNE_LIMIT,
	LICENSE_FEATURES,
	LICENSE_QUOTAS,
	UNLIMITED_LICENSE_QUOTA,
	type BooleanLicenseFeature,
	type NumericLicenseFeature,
} from '@n8n/constants';
import { SettingsRepository } from '@n8n/db';
import { OnLeaderStepdown, OnLeaderTakeover, OnPubSubEvent, OnShutdown } from '@n8n/decorators';
import { Service } from '@n8n/di';
import { InstanceSettings } from 'n8n-core';

import { LicenseMetricsService } from '@/metrics/license-metrics.service';

import { N8N_VERSION, SETTINGS_LICENSE_CERT_KEY } from './constants';

export type FeatureReturnType = Partial<
	{
		planName: string;
	} & { [K in NumericLicenseFeature]: number } & { [K in BooleanLicenseFeature]: boolean }
>;

type LicenseRefreshCallback = (cert: string) => void;

@Service()
export class License implements LicenseProvider {
	private refreshCallbacks: LicenseRefreshCallback[] = [];

	constructor(
		private readonly logger: Logger,
		private readonly instanceSettings: InstanceSettings,
		private readonly settingsRepository: SettingsRepository,
		private readonly licenseMetricsService: LicenseMetricsService,
		private readonly globalConfig: GlobalConfig,
	) {
		this.logger = this.logger.scoped('license');
	}

	async init({
		forceRecreate = false,
		isCli = false,
	}: { forceRecreate?: boolean; isCli?: boolean } = {}) {
		// Alliance fork: license SDK bypassed — all features unlocked
		this.logger.debug('Alliance fork: license check bypassed, all features enabled');
	}

	async loadCertStr(): Promise<string> {
		return 'alliance-fork-unlicensed';
	}

	async saveCertStr(_value: string): Promise<void> {
		// no-op
	}

	onCertRefresh(refreshCallback: LicenseRefreshCallback): () => void {
		this.refreshCallbacks.push(refreshCallback);
		return () => {
			const index = this.refreshCallbacks.indexOf(refreshCallback);
			if (index > -1) {
				this.refreshCallbacks.splice(index, 1);
			}
		};
	}

	async activate(_activationKey: string, _eulaUri?: string, _userEmail?: string): Promise<void> {
		// no-op
	}

	@OnPubSubEvent('reload-license')
	async reload(): Promise<void> {
		// no-op
	}

	async renew() {
		// no-op
	}

	async clear() {
		// no-op
	}

	@OnShutdown()
	async shutdown() {
		// no-op
	}

	// -------------------------------------------------------------------------
	// All feature checks return true / unlimited
	// -------------------------------------------------------------------------

	isLicensed(_feature: BooleanLicenseFeature): boolean {
		return true;
	}

	isCertValid(): boolean {
		return true;
	}

	hasFeatureInCert(_feature: BooleanLicenseFeature): boolean {
		return true;
	}

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
	isAPIDisabled() { return false; }  // keep API enabled
	isWorkerViewLicensed() { return true; }
	isProjectRoleAdminLicensed() { return true; }
	isProjectRoleEditorLicensed() { return true; }
	isProjectRoleViewerLicensed() { return true; }
	isCustomNpmRegistryEnabled() { return true; }
	isFoldersEnabled() { return true; }

	getCurrentEntitlements() {
		return [];
	}

	getValue<T extends keyof FeatureReturnType>(feature: T): FeatureReturnType[T] {
		if (feature === 'planName') return 'Enterprise' as FeatureReturnType[T];
		// Return unlimited for all numeric quotas
		return UNLIMITED_LICENSE_QUOTA as FeatureReturnType[T];
	}

	getManagementJwt(): string {
		return '';
	}

	getMainPlan() {
		return undefined;
	}

	getConsumerId() {
		return 'alliance-abroad-fork';
	}

	getUsersLimit() {
		return UNLIMITED_LICENSE_QUOTA;
	}

	getTriggerLimit() {
		return UNLIMITED_LICENSE_QUOTA;
	}

	getVariablesLimit() {
		return UNLIMITED_LICENSE_QUOTA;
	}

	getAiCredits() {
		return UNLIMITED_LICENSE_QUOTA;
	}

	getWorkflowHistoryPruneLimit() {
		return UNLIMITED_LICENSE_QUOTA;
	}

	getTeamProjectLimit() {
		return UNLIMITED_LICENSE_QUOTA;
	}

	getPlanName(): string {
		return 'Enterprise';
	}

	getExpiryDate(): Date | null {
		// Never expires
		return new Date('2099-12-31');
	}

	getTerminationDate(): Date | null {
		return null;
	}

	getExpiringInDays(): number | undefined {
		return undefined;
	}

	getTerminatingInDays(): number | undefined {
		return undefined;
	}

	getInfo(): string {
		return 'Alliance Abroad Fork — All features unlocked';
	}

	isWithinUsersLimit() {
		return true;
	}

	@OnLeaderTakeover()
	enableAutoRenewals() {
		// no-op
	}

	@OnLeaderStepdown()
	disableAutoRenewals() {
		// no-op
	}
}
