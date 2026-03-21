<script lang="ts">
	const tools = [
		{
			href: '/tools/config',
			icon: '⚙️',
			label: 'Config Generator',
			description:
				'Generate a complete openclaw.json through a guided form — auth providers, models with fallbacks, channels, gateway, memory, and more.',
			badge: 'Ready',
			tags: ['json', 'configuration', 'setup']
		},
		{
			href: '/tools/setup',
			icon: '🚀',
			label: 'Setup Wizard',
			description:
				'Step-by-step walkthrough for first-time users. Gets you from zero to a running agent with minimal friction.',
			badge: 'Soon',
			tags: ['onboarding', 'quickstart']
		},
		{
			href: '/tools/validate',
			icon: '✅',
			label: 'Config Validator',
			description:
				'Paste or upload your existing config. Validates schema, checks for missing required fields, and surfaces warnings.',
			badge: 'Soon',
			tags: ['validation', 'debugging']
		}
	];
</script>

<svelte:head>
	<title>Tools — botfiles</title>
	<meta name="description" content="Tools for configuring and launching OpenClaw autonomous agents." />
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-16">
	<div class="section-title">Tools</div>
	<h1 class="text-3xl font-bold mb-3">Agent toolkit</h1>
	<p class="mb-12" style="color: var(--color-muted); max-width: 520px;">
		Practical utilities for every stage of setting up an autonomous agent.
	</p>

	<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each tools as tool}
			<a
				href={tool.href}
				class="card group block transition-all duration-200 relative hover:border-[var(--color-primary)]"
				style={tool.badge !== 'Ready'
					? 'text-decoration: none; opacity: 0.5; pointer-events: none;'
					: 'text-decoration: none;'}
			>
				<span
					class="absolute top-4 right-4 text-xs font-mono font-semibold px-2 py-0.5 rounded-full"
					style={tool.badge === 'Ready'
						? 'background: color-mix(in srgb, var(--color-success) 15%, transparent); color: var(--color-success); border: 1px solid color-mix(in srgb, var(--color-success) 30%, transparent);'
						: 'background: color-mix(in srgb, var(--color-muted) 15%, transparent); color: var(--color-muted); border: 1px solid color-mix(in srgb, var(--color-muted) 30%, transparent);'}
				>
					{tool.badge}
				</span>

				<div class="text-3xl mb-4">{tool.icon}</div>
				<h2 class="font-semibold text-lg mb-2">{tool.label}</h2>
				<p class="text-sm leading-relaxed mb-4" style="color: var(--color-muted);">
					{tool.description}
				</p>

				<div class="flex flex-wrap gap-1.5">
					{#each tool.tags as tag}
						<span
							class="text-xs font-mono px-2 py-0.5 rounded"
							style="background-color: var(--color-bg); color: var(--color-muted); border: 1px solid var(--color-border);"
						>
							{tag}
						</span>
					{/each}
				</div>
			</a>
		{/each}
	</div>
</div>
