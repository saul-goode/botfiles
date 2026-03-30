<script lang="ts">
	import { FALLBACK_MODELS, type ModelOption } from '$lib/models';

	const { data } = $props();
	const models: ModelOption[] = data.models?.length ? data.models : FALLBACK_MODELS;
	let customModels: any[] = $state([]);
	let error: string | null = $state(null);
	let newModel = $state({
		id: '',
		label: '',
		family: '',
		provider: '',
		alias: '',
		free: false
	});

	function addCustomModel() {
		if (!newModel.id || !newModel.label) {
			error = 'Model ID and Label are required';
			return;
		}

		// Create a new model object
		const modelToAdd = {
			id: newModel.id,
			label: newModel.label,
			family: newModel.family,
			provider: newModel.provider,
			alias: newModel.alias,
			free: newModel.free
		};

		// Add to custom models
		customModels = [...customModels, modelToAdd];

		// Reset form
		newModel = {
			id: '',
			label: '',
			family: '',
			provider: '',
			alias: '',
			free: false
		};
		error = null;
	}

	function removeCustomModel(index: number) {
		customModels = customModels.filter((_, i) => i !== index);
	}

	function saveCustomModels() {
		// In a real implementation, this would save to a database or file
		console.log('Saving custom models:', customModels);
		alert('Custom models saved successfully!');
	}

	function handleIdChange(e: Event) {
		newModel.id = (e.target as HTMLInputElement).value;
	}

	function handleLabelChange(e: Event) {
		newModel.label = (e.target as HTMLInputElement).value;
	}

	function handleFamilyChange(e: Event) {
		newModel.family = (e.target as HTMLSelectElement).value;
	}

	function handleProviderChange(e: Event) {
		newModel.provider = (e.target as HTMLSelectElement).value;
	}

	function handleAliasChange(e: Event) {
		newModel.alias = (e.target as HTMLInputElement).value;
	}

	function handleFreeChange(e: Event) {
		newModel.free = (e.target as HTMLInputElement).checked;
	}
</script>

<svelte:head>
	<title>Custom Model — botfiles</title>
	<meta name="description" content="Add your own custom AI models to the collection." />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-16">
	<div class="section-title">Tools</div>
	<h1 class="text-3xl font-bold mb-3">Custom Model</h1>
	<p class="mb-12" style="color: var(--color-muted); max-width: 520px;">
		Add your own custom AI models to the collection.
	</p>

		<div class="mb-12">
			<h2 class="text-xl font-semibold mb-4">Add Custom Model</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium mb-1">Model ID *</label>
							<input
								type="text"
								class="w-full p-2 border rounded"
								value={newModel.id}
								oninput={handleIdChange}
							/>
						</div>
						<div>
							<label class="block text-sm font-medium mb-1">Model Label *</label>
							<input
								type="text"
								class="w-full p-2 border rounded"
								value={newModel.label}
								oninput={handleLabelChange}
							/>
						</div>
						<div>
							<label class="block text-sm font-medium mb-1">Family</label>
							<select
								class="w-full p-2 border rounded"
								value={newModel.family}
								onchange={handleFamilyChange}
							>
								<option value="">Select a family</option>
								<option value="OpenAI">OpenAI</option>
								<option value="Anthropic">Anthropic</option>
								<option value="Google">Google</option>
								<option value="Meta">Meta</option>
								<option value="Other">Other</option>
							</select>
						</div>
						<div>
							<label class="block text-sm font-medium mb-1">Provider</label>
							<select
								class="w-full p-2 border rounded"
								value={newModel.provider}
								onchange={handleProviderChange}
							>
								<option value="">Select a provider</option>
								<option value="openai-codex">OpenAI Codex</option>
								<option value="openrouter">OpenRouter</option>
								<option value="anthropic">Anthropic</option>
								<option value="google">Google</option>
								<option value="meta">Meta</option>
								<option value="other">Other</option>
							</select>
						</div>
						<div>
							<label class="block text-sm font-medium mb-1">Alias</label>
							<input
								type="text"
								class="w-full p-2 border rounded"
								value={newModel.alias}
								oninput={handleAliasChange}
							/>
						</div>
						<div>
							<label class="flex items-center">
								<input
									type="checkbox"
									class="mr-2"
									checked={newModel.free}
									onchange={handleFreeChange}
								/>
								<span>Free model</span>
							</label>
						</div>
					</div>
					<button
						class="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-hover)]"
						onclick={addCustomModel}
					>
						Add to List
					</button>
				</div>
				<div>
					<h3 class="text-lg font-semibold mb-4">Custom Models</h3>
					{#if customModels.length === 0}
						<p class="text-muted">No custom models added yet.</p>
					{:else}
						<div class="space-y-2">
							{#each customModels as model, index}
								<div class="p-3 border rounded flex justify-between items-center">
									<div>
										<h4 class="font-medium">{model.label}</h4>
										<p class="text-sm text-muted">{model.id}</p>
									</div>
									<button
										class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
										onclick={() => removeCustomModel(index)}
									>
										Remove
									</button>
								</div>
							{/each}
						</div>
						<button
							class="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
							onclick={saveCustomModels}
						>
							Save Custom Models
						</button>
					{/if}
				</div>
			</div>
		</div>
</div>