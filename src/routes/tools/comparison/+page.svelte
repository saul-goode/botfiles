<script lang="ts">
	import { FALLBACK_MODELS, PROVIDER_INFO, type ModelFamily, type ModelOption } from '$lib/models';

	const { data } = $props();
	const allModels: ModelOption[] = data.models?.length ? data.models : FALLBACK_MODELS;

	let selectedFamilies: ModelFamily[] = $state([]);
	let selectedModels: ModelOption[] = $state([]);

	const ALL_FAMILIES: ModelFamily[] = ['OpenAI', 'Anthropic', 'Google', 'xAI', 'Perplexity', 'Meta', 'Groq', 'Other'];

	// Models available based on selected families
	const filteredModels = $derived(
		allModels.filter(m => selectedFamilies.includes(m.family))
	);

	// Group filtered models by family for display
	const modelsByFamily = $derived.by(() => {
		const groups = new Map<ModelFamily, ModelOption[]>();
		for (const m of filteredModels) {
			if (!groups.has(m.family)) groups.set(m.family, []);
			groups.get(m.family)!.push(m);
		}
		return groups;
	});

	// Count models per family for badges
	const familyCounts = $derived.by(() => {
		const counts = new Map<ModelFamily, number>();
		for (const m of allModels) {
			counts.set(m.family, (counts.get(m.family) ?? 0) + 1);
		}
		return counts;
	});

	function toggleFamily(family: ModelFamily) {
		if (selectedFamilies.includes(family)) {
			selectedFamilies = selectedFamilies.filter(f => f !== family);
			// Remove any selected models from this family
			selectedModels = selectedModels.filter(m => m.family !== family);
		} else {
			selectedFamilies = [...selectedFamilies, family];
		}
	}

	function toggleModel(model: ModelOption) {
		if (selectedModels.some(m => m.id === model.id)) {
			selectedModels = selectedModels.filter(m => m.id !== model.id);
		} else {
			selectedModels = [...selectedModels, model];
		}
	}

	function selectAllInFamily(family: ModelFamily) {
		const familyModels = modelsByFamily.get(family) ?? [];
		const allSelected = familyModels.every(m => selectedModels.some(s => s.id === m.id));
		if (allSelected) {
			// Deselect all in this family
			const familyIds = new Set(familyModels.map(m => m.id));
			selectedModels = selectedModels.filter(m => !familyIds.has(m.id));
		} else {
			// Select all in this family (avoid duplicates)
			const existing = new Set(selectedModels.map(m => m.id));
			const toAdd = familyModels.filter(m => !existing.has(m.id));
			selectedModels = [...selectedModels, ...toAdd];
		}
	}

	function clearAll() {
		selectedModels = [];
		selectedFamilies = [];
	}
</script>

<svelte:head>
	<title>Model Comparison — botfiles</title>
	<meta name="description" content="Compare different AI models side-by-side for optimal selection." />
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-16">
	<div class="section-title">Tools</div>
	<h1 class="text-3xl font-bold mb-3">Model Comparison</h1>
	<p class="mb-12" style="color: var(--color-muted); max-width: 520px;">
		Select providers to browse their models, then pick the ones you want to compare side-by-side.
	</p>

	<!-- Step 1: Provider/Family selection -->
	<div class="mb-10">
		<h2 class="text-xl font-semibold mb-4">1. Choose Providers</h2>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
			{#each ALL_FAMILIES as family}
				{@const info = PROVIDER_INFO[family]}
				{@const count = familyCounts.get(family) ?? 0}
				{@const active = selectedFamilies.includes(family)}
				{#if count > 0}
					<button
						class="p-4 rounded-lg border text-left transition-all duration-150
							{active
								? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)]'
								: 'border-[var(--color-border)] hover:border-[var(--color-primary)]'}"
						onclick={() => toggleFamily(family)}
					>
						<div class="flex items-center gap-2 mb-1">
							<span class="text-lg">{info.icon}</span>
							<span class="font-semibold">{family}</span>
						</div>
						<p class="text-xs" style="color: var(--color-muted);">{count} model{count !== 1 ? 's' : ''}</p>
					</button>
				{/if}
			{/each}
		</div>
	</div>

	<!-- Step 2: Model selection (only shown when families are selected) -->
	{#if selectedFamilies.length > 0}
		<div class="mb-10">
			<h2 class="text-xl font-semibold mb-4">2. Select Models</h2>
			{#each [...modelsByFamily] as [family, familyModels]}
				<div class="mb-6">
					<div class="flex items-center justify-between mb-3">
						<h3 class="font-semibold flex items-center gap-2">
							<span>{PROVIDER_INFO[family].icon}</span>
							{family}
							<span class="text-xs font-normal px-2 py-0.5 rounded-full bg-[var(--color-bg)]" style="color: var(--color-muted);">
								{familyModels.length}
							</span>
						</h3>
						<button
							class="text-xs px-2 py-1 rounded hover:bg-[var(--color-bg)] transition-colors"
							style="color: var(--color-muted);"
							onclick={() => selectAllInFamily(family)}
						>
							{familyModels.every(m => selectedModels.some(s => s.id === m.id)) ? 'Deselect all' : 'Select all'}
						</button>
					</div>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
						{#each familyModels as model}
							{@const checked = selectedModels.some(m => m.id === model.id)}
							<button
								class="p-3 rounded-lg border text-left transition-all duration-150
									{checked
										? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)]'
										: 'border-[var(--color-border)] hover:border-[var(--color-primary)]'}"
								onclick={() => toggleModel(model)}
							>
								<div class="flex justify-between items-start">
									<div class="min-w-0">
										<div class="font-medium truncate">{model.label}</div>
										<div class="text-xs truncate" style="color: var(--color-muted);">{model.id}</div>
									</div>
									<div class="flex items-center gap-2 ml-2 shrink-0">
										{#if model.free}
											<span class="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-800">Free</span>
										{/if}
										<span class="w-4 h-4 rounded border flex items-center justify-center text-xs
											{checked ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'border-[var(--color-border)]'}">
											{#if checked}&#10003;{/if}
										</span>
									</div>
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Comparison table -->
	{#if selectedModels.length > 0}
		<div class="mb-8">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-xl font-semibold">Comparison</h2>
				<button
					class="text-xs px-3 py-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors"
					style="color: var(--color-muted);"
					onclick={clearAll}
				>
					Clear all
				</button>
			</div>
			<div class="overflow-x-auto rounded-lg border border-[var(--color-border)]">
				<table class="min-w-full border-collapse">
					<thead>
						<tr class="border-b border-[var(--color-border)]" style="background: var(--color-bg);">
							<th class="text-left p-3 font-semibold" style="min-width: 120px;">Property</th>
							{#each selectedModels as model}
								<th class="text-center p-3 border-l border-[var(--color-border)] font-semibold" style="min-width: 160px;">
									<div>{model.label}</div>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						<tr class="border-b border-[var(--color-border)]">
							<td class="p-3 font-medium">Family</td>
							{#each selectedModels as model}
								<td class="p-3 text-center border-l border-[var(--color-border)]">
									{PROVIDER_INFO[model.family].icon} {model.family}
								</td>
							{/each}
						</tr>
						<tr class="border-b border-[var(--color-border)]">
							<td class="p-3 font-medium">Provider</td>
							{#each selectedModels as model}
								<td class="p-3 text-center border-l border-[var(--color-border)]">
									{model.provider === 'openai-codex' ? 'OpenAI Codex' : 'OpenRouter'}
								</td>
							{/each}
						</tr>
						<tr class="border-b border-[var(--color-border)]">
							<td class="p-3 font-medium">Model ID</td>
							{#each selectedModels as model}
								<td class="p-3 text-center border-l border-[var(--color-border)]">
									<span class="text-xs" style="color: var(--color-muted);">{model.id}</span>
								</td>
							{/each}
						</tr>
						<tr class="border-b border-[var(--color-border)]">
							<td class="p-3 font-medium">Alias</td>
							{#each selectedModels as model}
								<td class="p-3 text-center border-l border-[var(--color-border)]">
									<code class="text-sm">{model.alias}</code>
								</td>
							{/each}
						</tr>
						<tr>
							<td class="p-3 font-medium">Free</td>
							{#each selectedModels as model}
								<td class="p-3 text-center border-l border-[var(--color-border)]">
									{model.free ? 'Yes' : 'No'}
								</td>
							{/each}
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
