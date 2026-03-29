<script lang="ts">
	import { onMount } from 'svelte';
	import { getModels } from '$lib/models.ts';
	import type { ModelOption } from '$lib/models.ts';

	let models: ModelOption[] = [];
	let selectedModels: ModelOption[] = [];
	let isLoaded = false;
	let error: string | null = null;

	onMount(async () => {
		try {
			// Directly load models from the models.ts file
			models = getModels();
			selectedModels = models.slice(0, 3); // Pre-select first 3 models
			isLoaded = true;
		} catch (err) {
			console.error('Failed to load models:', err);
			error = 'Failed to load models. Please try again later.';
			isLoaded = true;
		}
	});

	function toggleModel(model: ModelOption) {
		// Create a new array instead of modifying directly for proper reactivity
		const isSelected = selectedModels.some(m => m.id === model.id);
		if (isSelected) {
			// Remove model
			selectedModels = selectedModels.filter(m => m.id !== model.id);
		} else {
			// Add model (max 5)
			if (selectedModels.length < 5) {
				selectedModels = [...selectedModels, model];
			}
		}
	}

	function isSelected(model: ModelOption) {
		return selectedModels.some(m => m.id === model.id);
	}

	function compareModels() {
		// This would be where we'd implement the actual comparison logic
		console.log('Comparing models:', selectedModels);
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
		Compare different AI models side-by-side to help select the best one for your use case.
	</p>

	{#if !isLoaded}
		<div class="text-center py-12">
			Loading models...
		</div>
	{:else if error}
		<div class="text-center py-12 text-red-600">
			{error}
		</div>
	{:else}
		<div class="mb-8">
			<h2 class="text-xl font-semibold mb-4">Select Models to Compare</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
				{#each models as model}
					<div 
						class="card p-4 cursor-pointer transition-all duration-200 {isSelected(model) ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)]' : 'border-[var(--color-border) hover:border-[var(--color-primary)]'}"
						on:click={() => toggleModel(model)}
					>
						<div class="flex justify-between items-start">
							<div>
								<h3 class="font-semibold">{model.label}</h3>
								<p class="text-sm text-muted">{model.family}</p>
							</div>
							<span class="text-lg">{model.provider === 'openai-codex' ? '🤖' : '🌐'}</span>
						</div>
						<div class="mt-2 flex justify-between items-center">
							<span class="text-xs px-2 py-1 rounded bg-[var(--color-bg)] text-muted">
								{model.id}
							</span>
							{#if model.free}
								<span class="text-xs px-2 py-1 rounded bg-green-100 text-green-800">Free</span>
							{:else}
								<span class="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">Paid</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<div class="flex justify-center mb-8">
				<button 
					class="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
					on:click={compareModels}
				>
					Compare Selected Models
				</button>
			</div>
		</div>

		{#if selectedModels.length > 0}
			<div class="mb-8">
				<h2 class="text-xl font-semibold mb-4">Comparison Results</h2>
				<div class="overflow-x-auto">
					<table class="min-w-full border-collapse">
						<thead>
							<tr class="border-b">
								<th class="text-left p-3">Model</th>
								{#each selectedModels as model}
									<th class="text-center p-3 border-l">{model.label}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							<tr class="border-b">
								<td class="p-3 font-semibold">Provider</td>
								{#each selectedModels as model}
									<td class="p-3 text-center border-l">{model.provider}</td>
								{/each}
							</tr>
							<tr class="border-b">
								<td class="p-3 font-semibold">Family</td>
								{#each selectedModels as model}
									<td class="p-3 text-center border-l">{model.family}</td>
								{/each}
							</tr>
							<tr class="border-b">
								<td class="p-3 font-semibold">Free</td>
								{#each selectedModels as model}
									<td class="p-3 text-center border-l">{model.free ? 'Yes' : 'No'}</td>
								{/each}
							</tr>
							<tr class="border-b">
								<td class="p-3 font-semibold">Alias</td>
								{#each selectedModels as model}
									<td class="p-3 text-center border-l">{model.alias}</td>
								{/each}
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	{/if}
</div>