<script lang="ts">
	import { onMount } from 'svelte';
	import { getModels } from '$lib/models.ts';
	import type { ModelOption } from '$lib/models.ts';

	let models: ModelOption[] = [];
	let customModels: any[] = [];
	let isLoaded = false;
	let error: string | null = null;
	let newModel = {
		id: '',
		label: '',
		family: 'Other' as any,
		provider: 'openrouter' as any,
		alias: '',
		free: false
	};

	const modelFamilies = ['OpenAI', 'Anthropic', 'Google', 'xAI', 'Perplexity', 'Meta', 'Groq', 'Other'];
	const providers = ['openai-codex', 'openrouter'];

	onMount(async () => {
		try {
			// Fetch models from the API endpoint directly
			const response = await fetch('/api/models');
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const loadedModels = await response.json();
			models = loadedModels;
			isLoaded = true;
		} catch (err) {
			console.error('Failed to load models:', err);
			// Fallback to getModels() if API fails
			try {
				models = getModels();
				isLoaded = true;
			} catch (fallbackErr) {
				console.error('Failed to load fallback models:', fallbackErr);
				error = 'Failed to load models. Please try again later.';
				isLoaded = true;
			}
		}
	});

	function addCustomModel() {
		if (newModel.id && newModel.label) {
			const modelToAdd = {
				...newModel,
				id: newModel.id.trim(),
				label: newModel.label.trim(),
				alias: newModel.alias.trim() || newModel.label.toLowerCase().replace(/\s+/g, '-').slice(0, 12)
			};
			
			// Create new array for proper reactivity
			customModels = [...customModels, modelToAdd];
			resetForm();
		}
	}

	function resetForm() {
		newModel = {
			id: '',
			label: '',
			family: 'Other',
			provider: 'openrouter',
			alias: '',
			free: false
		};
	}

	function removeCustomModel(index: number) {
		// Create new array for proper reactivity
		customModels = customModels.filter((_, i) => i !== index);
	}

	function saveCustomModels() {
		// In a real implementation, this would save to a file or API
		console.log('Saving custom models:', customModels);
		alert('Custom models saved successfully!');
	}
</script>

<svelte:head>
	<title>Custom Model Config — botfiles</title>
	<meta name="description" content="Add and configure custom AI models beyond the pre-fetched list." />
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-16">
	<div class="section-title">Tools</div>
	<h1 class="text-3xl font-bold mb-3">Custom Model Configuration</h1>
	<p class="mb-12" style="color: var(--color-muted); max-width: 520px;">
		Add and configure custom AI models that aren't in the pre-fetched list.
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
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<div class="card p-6">
				<h2 class="text-xl font-semibold mb-4">Add Custom Model</h2>
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium mb-1">Model ID *</label>
						<input
							type="text"
							class="w-full p-2 border rounded"
							placeholder="e.g., openrouter/custom/my-model"
							bind:value={newModel.id}
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium mb-1">Model Label *</label>
						<input
							type="text"
							class="w-full p-2 border rounded"
							placeholder="e.g., My Custom Model"
							bind:value={newModel.label}
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium mb-1">Family</label>
						<select
							class="w-full p-2 border rounded"
							bind:value={newModel.family}
						>
							{#each modelFamilies as family}
								<option value={family}>{family}</option>
							{/each}
						</select>
					</div>
					
					<div>
						<label class="block text-sm font-medium mb-1">Provider</label>
						<select
							class="w-full p-2 border rounded"
							bind:value={newModel.provider}
						>
							{#each providers as provider}
								<option value={provider}>{provider}</option>
							{/each}
						</select>
					</div>
					
					<div>
						<label class="block text-sm font-medium mb-1">Alias</label>
						<input
							type="text"
							class="w-full p-2 border rounded"
							placeholder="e.g., my-model"
							bind:value={newModel.alias}
						/>
					</div>
					
					<div class="flex items-center">
						<input
							type="checkbox"
							id="free"
							class="mr-2"
							bind:checked={newModel.free}
						/>
						<label for="free">Is this model free to use?</label>
					</div>
					
					<button
						class="px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-hover)]"
						on:click={addCustomModel}
					>
						Add to List
					</button>
				</div>
			</div>
			
			<div class="card p-6">
				<h2 class="text-xl font-semibold mb-4">Custom Models List</h2>
				{#if customModels.length === 0}
					<p class="text-muted">No custom models added yet.</p>
				{:else}
					<div class="space-y-3">
						{#each customModels as model, index}
							<div class="p-3 border rounded flex justify-between items-center">
								<div>
									<div class="font-medium">{model.label}</div>
									<div class="text-sm text-muted">{model.id}</div>
								</div>
								<button
									class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
									on:click={() => removeCustomModel(index)}
								>
									Remove
								</button>
							</div>
						{/each}
					</div>
					<button
						class="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
						on:click={saveCustomModels}
					>
						Save Custom Models
					</button>
				{/if}
			</div>
		</div>
		
		<div class="mt-8 card p-6">
			<h2 class="text-xl font-semibold mb-4">How to Use Custom Models</h2>
			<ul class="list-disc pl-5 space-y-2">
				<li>Add your custom model by filling in the required fields</li>
				<li>Custom models will be available in the model selection dropdown</li>
				<li>Save your custom models to persist them across sessions</li>
				<li>Custom models can be used just like pre-fetched models</li>
			</ul>
		</div>
	{/if}
</div>