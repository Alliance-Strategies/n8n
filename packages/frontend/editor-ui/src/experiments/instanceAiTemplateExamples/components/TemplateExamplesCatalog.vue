<!-- Experiment cleanup: remove with InstanceAiTemplateExamplesExperiment -->
<script lang="ts" setup>
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { storeToRefs } from 'pinia';
import { useResizeObserver } from '@vueuse/core';
import { useI18n } from '@n8n/i18n';
import type { BaseTextKey } from '@n8n/i18n';
import { N8nIcon, N8nLoading, N8nText } from '@n8n/design-system';
import { useInstanceAiTemplateExamplesStore } from '../instanceAiTemplateExamples.store';
import { GRID_REVEAL_DELAY_MS } from '../constants';
import TemplateCategoryBar from './TemplateCategoryBar.vue';
import TemplateSubcategoryBar from './TemplateSubcategoryBar.vue';
import TemplateExampleCard from './TemplateExampleCard.vue';

const emit = defineEmits<{
	'hover-prompt': [prompt: string];
	'hover-end': [];
	'select-prompt': [prompt: string];
}>();

const i18n = useI18n();
const store = useInstanceAiTemplateExamplesStore();
const {
	categories,
	selectedCategoryId,
	selectedSubcategory,
	subcategories,
	workflows,
	isLoading,
	totalPages,
	hasNextPage,
	hasPrevPage,
} = storeToRefs(store);

const MAX_VISIBLE_FULL = 4;
const MAX_VISIBLE_COMPACT = 2;
const FULL_CATALOG_MIN_HEIGHT_PX = 350;
const COMPACT_CATALOG_MIN_HEIGHT_PX = 220;
const compact = ref(false);
const extraCompact = ref(false);
const containerRef = useTemplateRef<HTMLElement>('catalogContainer');

useResizeObserver(containerRef, () => {
	if (!containerRef.value) return;
	const availableHeight = window.innerHeight - containerRef.value.getBoundingClientRect().top;
	compact.value = availableHeight < FULL_CATALOG_MIN_HEIGHT_PX;
	extraCompact.value = availableHeight < COMPACT_CATALOG_MIN_HEIGHT_PX;
});

const visibleWorkflows = computed(() =>
	workflows.value.slice(0, compact.value ? MAX_VISIBLE_COMPACT : MAX_VISIBLE_FULL),
);
const gridRevealed = ref(false);

onMounted(() => {
	void store.initialize();
	setTimeout(() => {
		gridRevealed.value = true;
	}, GRID_REVEAL_DELAY_MS);
});
</script>

<template>
	<div ref="catalogContainer" :class="$style.container">
		<div :class="subcategories.length > 0 ? undefined : $style.barsSpacing">
			<TemplateCategoryBar
				:categories="categories"
				:selected-category-id="selectedCategoryId"
				:compact="compact"
				:extra-compact="extraCompact"
				@select="store.selectCategory"
			/>
		</div>

		<TemplateSubcategoryBar
			v-if="subcategories.length > 0"
			:subcategories="subcategories"
			:selected-subcategory="selectedSubcategory"
			@select="store.selectSubcategory"
		/>

		<div :class="[$style.gridArea, gridRevealed && $style.gridRevealed]">
			<button
				v-if="totalPages > 1 && hasPrevPage"
				:class="$style.navButton"
				@click="store.prevPage()"
			>
				<N8nIcon icon="chevron-left" size="medium" />
			</button>

			<div v-if="isLoading" :class="[$style.grid, compact && $style.gridCompact]">
				<div v-for="n in compact ? 2 : 4" :key="n" :class="$style.skeletonCard">
					<N8nLoading :rows="3" :loading="true" />
				</div>
			</div>

			<div
				v-else-if="visibleWorkflows.length > 0"
				:class="[$style.grid, compact && $style.gridCompact]"
			>
				<TemplateExampleCard
					v-for="workflow in visibleWorkflows"
					:key="workflow.id"
					:workflow="workflow"
					:selected-category="categories.find((c) => String(c.id) === selectedCategoryId)?.name"
					:selected-subcategory="selectedSubcategory || undefined"
					:show-all-nodes="!selectedCategoryId"
					@hover="emit('hover-prompt', $event)"
					@hover-end="emit('hover-end')"
					@select="emit('select-prompt', $event)"
				/>
			</div>

			<div v-else :class="$style.empty">
				<N8nText size="small" color="text-light">
					{{ i18n.baseText('experiments.instanceAiTemplateExamples.empty' as BaseTextKey) }}
				</N8nText>
			</div>

			<button
				v-if="totalPages > 1 && hasNextPage"
				:class="$style.navButton"
				@click="store.nextPage()"
			>
				<N8nIcon icon="chevron-right" size="medium" />
			</button>
		</div>
	</div>
</template>

<style lang="scss" module>
.container {
	width: 100%;
	max-width: 1014px;
	margin: 0 auto;
}

.barsSpacing {
	margin-bottom: 16px;
}

.gridArea {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0;
	transition: opacity 0.3s ease;
}

.gridRevealed {
	opacity: 1;
}

.grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	grid-template-rows: repeat(2, 1fr);
	gap: 12px;
	width: 100%;
}

.gridCompact {
	grid-template-rows: 1fr;
}

.skeletonCard {
	height: 100px;
	padding: var(--spacing--s);
	background: var(--color--background--light-3);
	border: 1px solid var(--color--foreground);
	border-radius: var(--radius--lg);
}

.empty {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: var(--spacing--xl);
	width: 100%;
}

.navButton {
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border-radius: 50%;
	border: none;
	background: transparent;
	color: var(--color--text);
	cursor: pointer;
	transition: background 0.15s ease;

	&:hover {
		background: var(--color--foreground--tint-1);
	}

	&:first-child {
		left: -48px;
	}

	&:last-child {
		right: -48px;
	}
}
</style>
