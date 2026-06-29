/**
 * Alliance Abroad — License-Free Fork
 *
 * Patched LicenseState: all boolean checks return true, all quotas return
 * UNLIMITED_LICENSE_QUOTA. No license provider is required.
 *
 * Patched by: alliance-platform-bot
 * Upstream file: packages/@n8n/backend-common/src/license-state.ts
 */
import type { BooleanLicenseFeature } from '@n8n/constants';
import { UNLIMITED_LICENSE_QUOTA } from '@n8n/constants';
import { Service } from '@n8n/di';

import type { FeatureReturnType, LicenseProvider } from './types';

@Service()
export class LicenseState {
	licenseProvider: LicenseProvider | null = null;

	setLicenseProvider(provider: LicenseProvider) {
		this.licenseProvider = provider;
	}

	// --------------------
	//     core queries — always return true / unlimited
	// --------------------

	isLicensed(_feature: BooleanLicenseFeature | BooleanLicenseFeature[]): boolean {
		return true;
	}

	getValue<T extends keyof FeatureReturnType>(_feature: T): FeatureReturnType[T] {
		return UNLIMITED_LICENSE_QUOTA as FeatureReturnType[T];
	}

	// --------------------
	//      booleans — all true
	// --------------------

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
	isAPIDisabled() { return false; }  // keep API enabled
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

	// --------------------
	//      integers — all unlimited
	// --------------------

	getMaxUsers() { return UNLIMITED_LICENSE_QUOTA; }
	getMaxActiveWorkflows() { return UNLIMITED_LICENSE_QUOTA; }
	getMaxVariables() { return UNLIMITED_LICENSE_QUOTA; }
	getMaxAiCredits() { return UNLIMITED_LICENSE_QUOTA; }
	getWorkflowHistoryPruneQuota() { return UNLIMITED_LICENSE_QUOTA; }
	getInsightsMaxHistory() { return UNLIMITED_LICENSE_QUOTA; }
	getInsightsRetentionMaxAge() { return UNLIMITED_LICENSE_QUOTA; }
	getInsightsRetentionPruneInterval() { return 24; }
	getMaxTeamProjects() { return UNLIMITED_LICENSE_QUOTA; }
	isTeamProjectsLicensed() { return true; }
	getMaxWorkflowsWithEvaluations() { return UNLIMITED_LICENSE_QUOTA; }
	getEvaluationConcurrencyQuota(): number | undefined { return undefined; }
}
