<svelte:head>
	<title>Docs — botfiles</title>
	<meta name="description" content="Documentation for OpenClaw and the botfiles toolkit." />
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-16">
	<div class="section-title">Documentation</div>
	<h1 class="text-3xl font-bold mb-3">Docs</h1>
	<p class="text-lg mb-12" style="color: var(--color-muted);">
		Guides, references, and examples for setting up and running OpenClaw agents.
	</p>

	<!-- Sections placeholder -->
	<div class="grid md:grid-cols-2 gap-4 mb-16">
		{#each sections as section}
			<div
				class="card flex gap-4"
				style={section.soon ? 'opacity: 0.5;' : ''}
			>
				<span class="text-2xl mt-0.5 shrink-0">{section.icon}</span>
				<div>
					<div class="flex items-center gap-2 mb-1">
						<h2 class="font-semibold">{section.title}</h2>
						{#if section.soon}
							<span
								class="text-xs font-mono px-1.5 py-0.5 rounded"
								style="background-color: var(--color-surface-elevated); color: var(--color-muted);"
							>
								soon
							</span>
						{/if}
					</div>
					<p class="text-sm" style="color: var(--color-muted);">{section.description}</p>
				</div>
			</div>
		{/each}
	</div>

	<!-- Placeholder notice -->
	<div
		class="rounded-xl p-6 text-center"
		style="border: 1px dashed var(--color-border); background-color: var(--color-surface);"
	>
		<div class="text-2xl mb-3">🚧</div>
		<h3 class="font-semibold mb-2">Full docs coming soon</h3>
		<p class="text-sm max-w-md mx-auto" style="color: var(--color-muted);">
			This section will be filled out as the toolkit grows. In the meantime, start with the
			<a href="/tools/config" class="font-medium" style="color: var(--color-primary);">
				Config Generator
			</a>
			— it's the fastest way to get a working <span class="font-mono">openclaw.json</span>.
		</p>
	</div>
</div>

<script lang="ts">
	const sections = [
		{
			icon: '🚀',
			title: 'Getting Started',
			description: 'Install OpenClaw, generate your first config, and run your first agent in under ten minutes.',
			soon: false
		},
		{
			icon: '⚙️',
			title: 'Configuration Reference',
			description: 'Every field in openclaw.json explained — auth profiles, model routing, memory, gateway, channels, and more.',
			soon: false
		},
		{
			icon: '🤖',
			title: 'Models & Providers',
			description: 'Which providers are supported, how routing and fallbacks work, and how to add custom model aliases.',
			soon: true
		},
		{
			icon: '🧠',
			title: 'Memory & Context',
			description: 'How OpenClaw stores, searches, and compacts memory. Session memory, embeddings, and pruning strategies.',
			soon: true
		},
		{
			icon: '📡',
			title: 'Channels',
			description: 'Connecting your agent to Telegram, Discord, webhooks, and other messaging surfaces.',
			soon: true
		},
		{
			icon: '🔌',
			title: 'Gateway & Tailscale',
			description: 'Exposing the local control API, token auth, and securely publishing via Tailscale Funnel.',
			soon: true
		}
	];
</script>
