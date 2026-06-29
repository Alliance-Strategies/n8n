import { computed } from 'vue';

export function useInstanceAiWorkflowPreviewSuggestionsExperiment() {
	const isFeatureEnabled = computed(() => true);
	return { isFeatureEnabled };
}
