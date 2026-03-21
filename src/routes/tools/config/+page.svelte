<script lang="ts">
	import { generateConfig, defaultFormState, type ConfigFormState } from '$lib/openclaw';
	import type { ModelOption, ModelFamily } from '$lib/models';

	let { data } = $props();
	const allModels: ModelOption[] = data.models;

	let state = $state<ConfigFormState>(defaultFormState());
	let copied = $state(false);
	let activeSection = $state('auth');

	// Build alias map from live model list for config generation
	const modelAliases = $derived(
		Object.fromEntries(allModels.map((m) => [m.id, m.alias]))
	);

	const config = $derived(generateConfig(state, modelAliases));

	// Models filtered by enabled providers
	const availableModels = $derived(
		allModels.filter(
			(m) =>
				(m.provider === 'openai-codex' && state.auth.useOpenAICodex) ||
				(m.provider === 'openrouter' && state.auth.useOpenRouter)
		)
	);

	// Grouped for display
	const modelsByFamily = $derived(() => {
		const groups = new Map<ModelFamily, ModelOption[]>();
		for (const m of availableModels) {
			if (!groups.has(m.family)) groups.set(m.family, []);
			groups.get(m.family)!.push(m);
		}
		return groups;
	});

	const sections = [
		{ id: 'auth', label: 'Auth', icon: '🔑' },
		{ id: 'models', label: 'Models', icon: '🤖' },
		{ id: 'memory', label: 'Memory', icon: '🧠' },
		{ id: 'channels', label: 'Channels', icon: '📡' },
		{ id: 'gateway', label: 'Gateway', icon: '🔌' },
		{ id: 'system', label: 'System', icon: '⚙️' }
	];

	async function copyToClipboard() {
		await navigator.clipboard.writeText(config);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function downloadConfig() {
		const blob = new Blob([config], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'openclaw.json';
		a.click();
		URL.revokeObjectURL(url);
	}

	function toggleFallback(modelId: string) {
		const idx = state.agent.fallbacks.indexOf(modelId);
		if (idx === -1) {
			state.agent.fallbacks = [...state.agent.fallbacks, modelId];
		} else {
			state.agent.fallbacks = state.agent.fallbacks.filter((m) => m !== modelId);
		}
	}

	function toggleMemorySource(src: 'memory' | 'sessions' | 'files') {
		const idx = state.memory.sources.indexOf(src);
		if (idx === -1) {
			state.memory.sources = [...state.memory.sources, src];
		} else {
			state.memory.sources = state.memory.sources.filter((s) => s !== src);
		}
	}

	// When primary model changes, make sure it's not also in fallbacks
	$effect(() => {
		state.agent.fallbacks = state.agent.fallbacks.filter((f) => f !== state.agent.primaryModel);
	});
</script>

<svelte:head>
	<title>Config Generator — botfil.es</title>
	<meta name="description" content="Generate your openclaw.json configuration file." />
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-12">
	<!-- Header -->
	<div class="mb-8">
		<a href="/tools" class="text-xs font-mono" style="color: var(--color-muted);">← Tools</a>
		<div class="section-title mt-4">Config Generator</div>
		<h1 class="text-3xl font-bold">openclaw.json</h1>
		<p class="mt-2" style="color: var(--color-muted);">
			Configure your agent below. The JSON output updates live.
			<span class="font-mono text-xs ml-2" style="color: var(--color-primary);">
				{allModels.length} models loaded
			</span>
		</p>
	</div>

	<div class="grid lg:grid-cols-[1fr_420px] gap-6 items-start">
		<!-- Left: form -->
		<div>
			<!-- Section tabs -->
			<div
				class="flex flex-wrap gap-1 p-1 rounded-lg mb-6"
				style="background-color: var(--color-surface);"
			>
				{#each sections as sec}
					<button
						onclick={() => (activeSection = sec.id)}
						class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
						style={activeSection === sec.id
							? 'background-color: var(--color-surface-elevated); color: var(--color-primary); border: 1px solid var(--color-border);'
							: 'color: var(--color-muted); border: 1px solid transparent;'}
					>
						<span class="text-xs">{sec.icon}</span>
						{sec.label}
					</button>
				{/each}
			</div>

			<!-- Auth -->
			{#if activeSection === 'auth'}
				<div class="card space-y-5">
					<h2 class="font-semibold text-lg">Auth Providers</h2>
					<p class="text-sm" style="color: var(--color-muted);">
						OpenClaw supports multiple LLM providers. Enable the ones you have access to.
					</p>

					<div class="space-y-3">
						<label
							class="flex items-start justify-between p-4 rounded-lg cursor-pointer"
							style="border: 1px solid {state.auth.useOpenAICodex
								? 'color-mix(in srgb, var(--color-primary) 40%, var(--color-border))'
								: 'var(--color-border)'}; background: {state.auth.useOpenAICodex
								? 'color-mix(in srgb, var(--color-primary) 5%, transparent)'
								: 'transparent'};"
						>
							<div>
								<div class="font-mono font-semibold text-sm">openai-codex</div>
								<div class="text-xs mt-0.5" style="color: var(--color-muted);">
									OAuth — access GPT-5.x Codex and o-series models
								</div>
							</div>
							<input
								type="checkbox"
								bind:checked={state.auth.useOpenAICodex}
								class="mt-0.5 w-4 h-4 accent-[var(--color-primary)]"
							/>
						</label>

						<label
							class="flex items-start justify-between p-4 rounded-lg cursor-pointer"
							style="border: 1px solid {state.auth.useOpenRouter
								? 'color-mix(in srgb, var(--color-primary) 40%, var(--color-border))'
								: 'var(--color-border)'}; background: {state.auth.useOpenRouter
								? 'color-mix(in srgb, var(--color-primary) 5%, transparent)'
								: 'transparent'};"
						>
							<div>
								<div class="font-mono font-semibold text-sm">openrouter</div>
								<div class="text-xs mt-0.5" style="color: var(--color-muted);">
									API key — Claude, Gemini, Grok, Llama &amp; more through one gateway
								</div>
							</div>
							<input
								type="checkbox"
								bind:checked={state.auth.useOpenRouter}
								class="mt-0.5 w-4 h-4 accent-[var(--color-primary)]"
							/>
						</label>
					</div>

					<div
						class="p-3 rounded-lg text-xs"
						style="background-color: color-mix(in srgb, var(--color-accent) 8%, transparent); border: 1px solid color-mix(in srgb, var(--color-accent) 20%, transparent); color: var(--color-muted);"
					>
						API keys are not stored here — OpenClaw manages credentials in its own secure store.
						This just tells the config which providers to expect.
					</div>
				</div>
			{/if}

			<!-- Models -->
			{#if activeSection === 'models'}
				<div class="card space-y-6">
					<h2 class="font-semibold text-lg">Model Configuration</h2>

					{#if availableModels.length === 0}
						<div class="p-4 rounded-lg text-sm" style="background-color: var(--color-surface-elevated); color: var(--color-muted);">
							Enable at least one auth provider to see available models.
						</div>
					{:else}
						<!-- Primary model -->
						<div>
							<label class="label" for="primary-model">Primary model</label>
							<select id="primary-model" class="input-field" bind:value={state.agent.primaryModel}>
								{#each [...modelsByFamily().entries()] as [family, models]}
									<optgroup label={family}>
										{#each models as m}
											<option value={m.id}>{m.label}{m.free ? ' ★ free' : ''}</option>
										{/each}
									</optgroup>
								{/each}
							</select>
							<p class="text-xs mt-1 font-mono" style="color: var(--color-muted);">
								{state.agent.primaryModel}
							</p>
						</div>

						<!-- Fallbacks -->
						<div>
							<div class="label mb-1">Fallback models</div>
							<p class="text-xs mb-3" style="color: var(--color-muted);">
								Tried in order if the primary is unavailable.
								{state.agent.fallbacks.length > 0
									? `${state.agent.fallbacks.length} selected.`
									: 'None selected.'}
							</p>

							{#each [...modelsByFamily().entries()] as [family, models]}
								{@const eligibleModels = models.filter((m) => m.id !== state.agent.primaryModel)}
								{#if eligibleModels.length > 0}
									<div class="mb-4">
										<div
											class="text-xs font-semibold mb-2 px-1"
											style="color: var(--color-muted); letter-spacing: 0.05em; text-transform: uppercase;"
										>
											{family}
										</div>
										<div class="space-y-1.5">
											{#each eligibleModels as model}
												{@const selected = state.agent.fallbacks.includes(model.id)}
												<label
													class="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer"
													style="border: 1px solid {selected
														? 'color-mix(in srgb, var(--color-primary) 30%, var(--color-border))'
														: 'var(--color-border)'}; background: {selected
														? 'color-mix(in srgb, var(--color-primary) 4%, transparent)'
														: 'transparent'};"
												>
													<div>
														<div class="text-xs font-medium">
															{model.label}
															{#if model.free}<span style="color: var(--color-success);">★ free</span>{/if}
														</div>
														<div class="text-xs font-mono" style="color: var(--color-muted);">
															{model.id}
														</div>
													</div>
													<input
														type="checkbox"
														checked={selected}
														onchange={() => toggleFallback(model.id)}
														class="w-4 h-4 accent-[var(--color-primary)] shrink-0 ml-3"
													/>
												</label>
											{/each}
										</div>
									</div>
								{/if}
							{/each}
						</div>

						<!-- Heartbeat -->
						<div>
							<label class="label" for="heartbeat-model">Heartbeat model</label>
							<select id="heartbeat-model" class="input-field" bind:value={state.agent.heartbeatModel}>
								{#each [...modelsByFamily().entries()] as [family, models]}
									<optgroup label={family}>
										{#each models as m}
											<option value={m.id}>{m.label}{m.free ? ' ★ free' : ''}</option>
										{/each}
									</optgroup>
								{/each}
							</select>
							<p class="text-xs mt-1" style="color: var(--color-muted);">
								Lightweight keep-alive checks. Prefer a fast, cheap model.
							</p>
						</div>

						<!-- Concurrency + workspace -->
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label class="label" for="max-concurrent">Max concurrent agents</label>
								<input id="max-concurrent" type="number" min="1" max="20" class="input-field" bind:value={state.agent.maxConcurrent} />
							</div>
							<div>
								<label class="label" for="max-subagents">Max concurrent subagents</label>
								<input id="max-subagents" type="number" min="1" max="32" class="input-field" bind:value={state.agent.subagentsMaxConcurrent} />
							</div>
						</div>

						<div>
							<label class="label" for="workspace">Workspace path</label>
							<input id="workspace" type="text" class="input-field" bind:value={state.agent.workspace} placeholder="~/.openclaw/workspace" />
						</div>
					{/if}
				</div>
			{/if}

			<!-- Memory -->
			{#if activeSection === 'memory'}
				<div class="card space-y-6">
					<h2 class="font-semibold text-lg">Memory &amp; Context</h2>

					<div>
						<div class="label mb-2">Memory search sources</div>
						<div class="space-y-2">
							{#each ['memory', 'sessions', 'files'] as src}
								{@const enabled = state.memory.sources.includes(src as 'memory' | 'sessions' | 'files')}
								<label
									class="flex items-center justify-between p-3 rounded-lg cursor-pointer"
									style="border: 1px solid {enabled
										? 'color-mix(in srgb, var(--color-primary) 30%, var(--color-border))'
										: 'var(--color-border)'};"
								>
									<span class="text-sm font-mono">{src}</span>
									<input
										type="checkbox"
										checked={enabled}
										onchange={() => toggleMemorySource(src as 'memory' | 'sessions' | 'files')}
										class="w-4 h-4 accent-[var(--color-primary)]"
									/>
								</label>
							{/each}
						</div>
					</div>

					<label
						class="flex items-center justify-between p-3 rounded-lg cursor-pointer"
						style="border: 1px solid {state.memory.sessionMemory
							? 'color-mix(in srgb, var(--color-primary) 30%, var(--color-border))'
							: 'var(--color-border)'};"
					>
						<div>
							<div class="text-sm font-medium">Session memory (experimental)</div>
							<div class="text-xs mt-0.5" style="color: var(--color-muted);">Persist context across sessions</div>
						</div>
						<input type="checkbox" bind:checked={state.memory.sessionMemory} class="w-4 h-4 accent-[var(--color-primary)]" />
					</label>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="label" for="embed-provider">Embedding provider</label>
							<select id="embed-provider" class="input-field" bind:value={state.memory.provider}>
								<option value="openai">openai</option>
								<option value="openrouter">openrouter</option>
							</select>
						</div>
						<div>
							<label class="label" for="embed-model">Embedding model</label>
							<select id="embed-model" class="input-field" bind:value={state.memory.model}>
								<option value="text-embedding-3-small">text-embedding-3-small</option>
								<option value="text-embedding-3-large">text-embedding-3-large</option>
								<option value="text-embedding-ada-002">text-embedding-ada-002</option>
							</select>
						</div>
					</div>

					<div class="border-t pt-5" style="border-color: var(--color-border);">
						<h3 class="font-medium mb-4">Context Pruning</h3>
						<div class="space-y-4">
							<div>
								<label class="label" for="prune-mode">Mode</label>
								<select id="prune-mode" class="input-field" bind:value={state.context.pruningMode}>
									<option value="cache-ttl">cache-ttl — prune after TTL</option>
									<option value="none">none — never prune</option>
								</select>
							</div>
							{#if state.context.pruningMode === 'cache-ttl'}
								<div class="grid grid-cols-2 gap-4">
									<div>
										<label class="label" for="prune-ttl">TTL</label>
										<input id="prune-ttl" type="text" class="input-field" bind:value={state.context.ttl} placeholder="6h" />
										<p class="text-xs mt-1" style="color: var(--color-muted);">e.g. 1h, 6h, 24h</p>
									</div>
									<div>
										<label class="label" for="keep-assistants">Keep last N assistants</label>
										<input id="keep-assistants" type="number" min="1" max="20" class="input-field" bind:value={state.context.keepLastAssistants} />
									</div>
								</div>
							{/if}
						</div>
					</div>

					<div class="border-t pt-5" style="border-color: var(--color-border);">
						<h3 class="font-medium mb-4">Compaction</h3>
						<div class="space-y-4">
							<div>
								<label class="label" for="compact-mode">Mode</label>
								<select id="compact-mode" class="input-field" bind:value={state.compaction.mode}>
									<option value="default">default</option>
									<option value="disabled">disabled</option>
								</select>
							</div>
							<label
								class="flex items-center justify-between p-3 rounded-lg cursor-pointer"
								style="border: 1px solid {state.compaction.memoryFlushEnabled
									? 'color-mix(in srgb, var(--color-primary) 30%, var(--color-border))'
									: 'var(--color-border)'};"
							>
								<div>
									<div class="text-sm font-medium">Memory flush</div>
									<div class="text-xs mt-0.5" style="color: var(--color-muted);">
										Extract key decisions to memory files when context grows large
									</div>
								</div>
								<input type="checkbox" bind:checked={state.compaction.memoryFlushEnabled} class="w-4 h-4 accent-[var(--color-primary)]" />
							</label>
							{#if state.compaction.memoryFlushEnabled}
								<div>
									<label class="label" for="soft-threshold">Soft threshold (tokens)</label>
									<input id="soft-threshold" type="number" min="1000" step="1000" class="input-field" bind:value={state.compaction.softThresholdTokens} />
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			<!-- Channels -->
			{#if activeSection === 'channels'}
				<div class="card space-y-5">
					<h2 class="font-semibold text-lg">Channels</h2>
					<p class="text-sm" style="color: var(--color-muted);">
						Channels let your agent receive messages from external platforms.
					</p>

					<div class="rounded-lg overflow-hidden" style="border: 1px solid {state.telegram.enabled ? 'color-mix(in srgb, var(--color-primary) 30%, var(--color-border))' : 'var(--color-border)'};">
						<div
							class="flex items-center justify-between p-4"
							style="background: {state.telegram.enabled ? 'color-mix(in srgb, var(--color-primary) 5%, transparent)' : 'transparent'};"
						>
							<div class="flex items-center gap-3">
								<span class="text-lg">✈️</span>
								<div>
									<div class="font-semibold text-sm">Telegram</div>
									<div class="text-xs" style="color: var(--color-muted);">Bot integration</div>
								</div>
							</div>
							<label class="flex items-center gap-2 cursor-pointer">
								<span class="text-xs" style="color: var(--color-muted);">Enable</span>
								<input type="checkbox" bind:checked={state.telegram.enabled} class="w-4 h-4 accent-[var(--color-primary)]" />
							</label>
						</div>

						{#if state.telegram.enabled}
							<div class="p-4 space-y-4" style="border-top: 1px solid var(--color-border);">
								<div>
									<label class="label" for="tg-token">Bot token</label>
									<input id="tg-token" type="password" class="input-field" bind:value={state.telegram.botToken} placeholder="1234567890:AAB..." />
									<p class="text-xs mt-1" style="color: var(--color-muted);">From @BotFather on Telegram.</p>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<div>
										<label class="label" for="tg-dm">DM policy</label>
										<select id="tg-dm" class="input-field" bind:value={state.telegram.dmPolicy}>
											<option value="pairing">pairing</option>
											<option value="open">open</option>
											<option value="closed">closed</option>
										</select>
									</div>
									<div>
										<label class="label" for="tg-group">Group policy</label>
										<select id="tg-group" class="input-field" bind:value={state.telegram.groupPolicy}>
											<option value="allowlist">allowlist</option>
											<option value="denylist">denylist</option>
											<option value="open">open</option>
											<option value="closed">closed</option>
										</select>
									</div>
								</div>
								<div>
									<label class="label" for="tg-streaming">Streaming</label>
									<select id="tg-streaming" class="input-field" bind:value={state.telegram.streaming}>
										<option value="off">off — send complete messages</option>
										<option value="on">on — stream as tokens arrive</option>
									</select>
								</div>
							</div>
						{/if}
					</div>

					<div class="p-3 rounded-lg text-sm" style="background-color: var(--color-surface-elevated); color: var(--color-muted);">
						More channels (Discord, Slack, webhook) coming in a future release.
					</div>
				</div>
			{/if}

			<!-- Gateway -->
			{#if activeSection === 'gateway'}
				<div class="card space-y-5">
					<h2 class="font-semibold text-lg">Gateway</h2>
					<p class="text-sm" style="color: var(--color-muted);">
						The local HTTP gateway exposes a control API for your agent.
					</p>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="label" for="gw-port">Port</label>
							<input id="gw-port" type="number" min="1024" max="65535" class="input-field" bind:value={state.gateway.port} />
						</div>
						<div>
							<label class="label" for="gw-mode">Mode</label>
							<select id="gw-mode" class="input-field" bind:value={state.gateway.mode}>
								<option value="local">local</option>
								<option value="remote">remote</option>
							</select>
						</div>
					</div>
					<div>
						<label class="label" for="gw-bind">Bind address</label>
						<select id="gw-bind" class="input-field" bind:value={state.gateway.bind}>
							<option value="loopback">loopback — localhost only (recommended)</option>
							<option value="all">all — all interfaces</option>
						</select>
					</div>
					<div class="border-t pt-4" style="border-color: var(--color-border);">
						<h3 class="font-medium mb-4">Auth</h3>
						<div class="space-y-4">
							<div>
								<label class="label" for="gw-auth-mode">Auth mode</label>
								<select id="gw-auth-mode" class="input-field" bind:value={state.gateway.authMode}>
									<option value="token">token</option>
									<option value="none">none</option>
								</select>
							</div>
							{#if state.gateway.authMode === 'token'}
								<div>
									<label class="label" for="gw-token">Token</label>
									<input id="gw-token" type="password" class="input-field" bind:value={state.gateway.token} placeholder="your-secret-token" />
								</div>
							{/if}
						</div>
					</div>
					<div class="border-t pt-4" style="border-color: var(--color-border);">
						<h3 class="font-medium mb-4">Tailscale</h3>
						<div>
							<label class="label" for="ts-mode">Mode</label>
							<select id="ts-mode" class="input-field" bind:value={state.gateway.tailscaleMode}>
								<option value="off">off — no Tailscale</option>
								<option value="serve">serve — expose on Tailscale network</option>
								<option value="funnel">funnel — expose publicly via Tailscale</option>
							</select>
						</div>
					</div>
				</div>
			{/if}

			<!-- System -->
			{#if activeSection === 'system'}
				<div class="card space-y-6">
					<h2 class="font-semibold text-lg">System</h2>
					<div>
						<label class="label" for="update-channel">Update channel</label>
						<select id="update-channel" class="input-field" bind:value={state.update.channel}>
							<option value="stable">stable</option>
							<option value="beta">beta</option>
							<option value="nightly">nightly</option>
						</select>
					</div>
					<div class="space-y-3">
						<label class="flex items-center justify-between p-3 rounded-lg cursor-pointer" style="border: 1px solid var(--color-border);">
							<div class="text-sm font-medium">Check for updates on start</div>
							<input type="checkbox" bind:checked={state.update.checkOnStart} class="w-4 h-4 accent-[var(--color-primary)]" />
						</label>
						<label class="flex items-center justify-between p-3 rounded-lg cursor-pointer" style="border: 1px solid var(--color-border);">
							<div>
								<div class="text-sm font-medium">Auto-update</div>
								<div class="text-xs mt-0.5" style="color: var(--color-muted);">Install updates without prompting</div>
							</div>
							<input type="checkbox" bind:checked={state.update.autoUpdate} class="w-4 h-4 accent-[var(--color-primary)]" />
						</label>
					</div>
					<div class="border-t pt-5" style="border-color: var(--color-border);">
						<h3 class="font-medium mb-4">Logging</h3>
						<div>
							<label class="label" for="log-redact">Redact sensitive data</label>
							<select id="log-redact" class="input-field" bind:value={state.logging.redactSensitive}>
								<option value="none">none — log everything</option>
								<option value="tools">tools — redact tool I/O (recommended)</option>
								<option value="all">all — redact all sensitive fields</option>
							</select>
						</div>
					</div>
					<div class="border-t pt-5" style="border-color: var(--color-border);">
						<h3 class="font-medium mb-4">Skills &amp; Install</h3>
						<div class="space-y-4">
							<div>
								<label class="label" for="node-manager">Node package manager</label>
								<select id="node-manager" class="input-field" bind:value={state.skills.nodeManager}>
									<option value="bun">bun</option>
									<option value="npm">npm</option>
									<option value="yarn">yarn</option>
									<option value="pnpm">pnpm</option>
								</select>
							</div>
							<label class="flex items-center justify-between p-3 rounded-lg cursor-pointer" style="border: 1px solid var(--color-border);">
								<div>
									<div class="text-sm font-medium">Prefer Homebrew for installs</div>
									<div class="text-xs mt-0.5" style="color: var(--color-muted);">macOS only</div>
								</div>
								<input type="checkbox" bind:checked={state.skills.preferBrew} class="w-4 h-4 accent-[var(--color-primary)]" />
							</label>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Right: JSON output -->
		<div class="lg:sticky lg:top-20 self-start">
			<div class="card" style="border-color: color-mix(in srgb, var(--color-primary) 20%, var(--color-border));">
				<div class="flex items-center justify-between mb-3">
					<span class="font-mono text-sm font-semibold" style="color: var(--color-primary);">
						openclaw.json
					</span>
					<div class="flex gap-2">
						<button class="btn-ghost text-xs py-1 px-2.5" onclick={copyToClipboard}>
							{copied ? '✓ Copied' : 'Copy'}
						</button>
						<button class="btn-primary text-xs py-1 px-2.5" onclick={downloadConfig}>
							Download
						</button>
					</div>
				</div>
				<pre
					class="font-mono text-xs leading-relaxed rounded-lg p-3 overflow-x-auto"
					style="background-color: var(--color-bg); color: var(--color-text); max-height: 75vh; overflow-y: auto;"
				>{config}</pre>
			</div>
		</div>
	</div>
</div>
