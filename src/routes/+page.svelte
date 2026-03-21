<script lang="ts">
	const tools = [
		{
			href: '/tools/config',
			icon: '⚙️',
			label: 'Config Generator',
			description: 'Generate a complete openclaw.json through a guided form — auth providers, models, channels, gateway, and more.',
			badge: 'Ready'
		},
		{
			href: '/tools/setup',
			icon: '🚀',
			label: 'Setup Wizard',
			description: 'Step-by-step walkthrough for getting your first OpenClaw agent running from scratch.',
			badge: 'Soon'
		},
		{
			href: '/tools/validate',
			icon: '✅',
			label: 'Config Validator',
			description: 'Paste or upload your existing config and catch errors before your bot tries to start.',
			badge: 'Soon'
		}
	];

	const terminalLines = [
		{ prompt: '$', text: 'openclaw configure', delay: 0 },
		{ prompt: '>', text: 'Writing openclaw.json...', delay: 600, dim: true },
		{ prompt: '>', text: 'Connecting to openai-codex...', delay: 1200, dim: true },
		{ prompt: '✓', text: 'Agent initialized successfully', delay: 1800, green: true },
		{ prompt: '$', text: 'openclaw start', delay: 2400 }
	];
</script>

<svelte:head>
	<title>botfiles — Tools for autonomous agents</title>
	<meta
		name="description"
		content="Toolkit for setting up and configuring autonomous agents like OpenClaw. Config generators, setup wizards, and more."
	/>
</svelte:head>

<!-- Hero -->
<section class="max-w-6xl mx-auto px-4 pt-24 pb-16">
	<div class="max-w-3xl">
		<div class="section-title">Autonomous Agents</div>
		<h1 class="text-4xl sm:text-5xl font-bold leading-tight mb-6">
			<span class="text-gradient">Stop wrestling</span>
			<br />
			with your bot config.
		</h1>
		<p class="text-lg mb-8" style="color: var(--color-muted); max-width: 560px; line-height: 1.7;">
			botfiles gives you a set of practical tools for configuring, validating, and launching
			autonomous agents — starting with OpenClaw.
		</p>

		<div class="flex flex-wrap gap-3">
			<a href="/tools" class="btn-primary">Browse tools &rarr;</a>
			<a href="/about" class="btn-ghost">What is OpenClaw?</a>
		</div>
	</div>

	<!-- Terminal mockup -->
	<div
		class="mt-16 card glow-primary max-w-xl"
		style="border-color: color-mix(in srgb, var(--color-primary) 25%, var(--color-border));"
	>
		<!-- Traffic lights -->
		<div class="flex items-center gap-1.5 mb-4">
			<div class="w-3 h-3 rounded-full" style="background-color: #ef4444;"></div>
			<div class="w-3 h-3 rounded-full" style="background-color: #f59e0b;"></div>
			<div class="w-3 h-3 rounded-full" style="background-color: #10b981;"></div>
			<span class="ml-2 text-xs font-mono" style="color: var(--color-muted);">terminal</span>
		</div>
		<div class="font-mono text-sm space-y-1.5">
			{#each terminalLines as line}
				<div class="flex gap-2" style={line.dim ? 'color: var(--color-muted);' : ''}>
					<span style={line.green ? 'color: var(--color-success);' : 'color: var(--color-primary);'}>
						{line.prompt}
					</span>
					<span>{line.text}</span>
					{#if line === terminalLines[terminalLines.length - 1]}
						<span
							class="inline-block w-2 h-4 animate-pulse"
							style="background-color: var(--color-primary); margin-left: 2px;"
						></span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Tools -->
<section class="max-w-6xl mx-auto px-4 py-16">
	<div class="section-title">Tools</div>
	<h2 class="text-2xl font-bold mb-8">Everything you need to ship your agent</h2>

	<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each tools as tool}
			<a
				href={tool.href}
				class="card group block transition-all duration-200 relative"
				style={tool.badge === 'Ready'
					? 'text-decoration: none;'
					: 'text-decoration: none; opacity: 0.6; pointer-events: none;'}
			>
				<!-- Badge -->
				<span
					class="absolute top-4 right-4 text-xs font-mono font-semibold px-2 py-0.5 rounded-full"
					style={tool.badge === 'Ready'
						? 'background: color-mix(in srgb, var(--color-success) 15%, transparent); color: var(--color-success); border: 1px solid color-mix(in srgb, var(--color-success) 30%, transparent);'
						: 'background: color-mix(in srgb, var(--color-muted) 15%, transparent); color: var(--color-muted); border: 1px solid color-mix(in srgb, var(--color-muted) 30%, transparent);'}
				>
					{tool.badge}
				</span>

				<div class="text-2xl mb-3">{tool.icon}</div>
				<h3
					class="font-semibold mb-2 transition-colors"
					style="color: var(--color-text);"
				>
					{tool.label}
				</h3>
				<p class="text-sm leading-relaxed" style="color: var(--color-muted);">
					{tool.description}
				</p>
			</a>
		{/each}
	</div>
</section>

<!-- About OpenClaw snippet -->
<section
	class="border-t border-b py-16"
	style="border-color: var(--color-border); background-color: var(--color-surface);"
>
	<div class="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
		<div>
			<div class="section-title">About</div>
			<h2 class="text-2xl font-bold mb-4">What is OpenClaw?</h2>
			<p class="mb-4 leading-relaxed" style="color: var(--color-muted);">
				OpenClaw is an autonomous agent framework designed for building and running persistent,
				goal-directed bots. It handles scheduling, memory, toolchains, and execution — so you
				can focus on defining what your agent actually does.
			</p>
			<p class="leading-relaxed" style="color: var(--color-muted);">
				botfiles exists to make the setup and configuration side of OpenClaw as painless as
				possible, especially for users who are new to agent infrastructure.
			</p>
		</div>

		<!-- Feature list -->
		<div class="space-y-3">
			{#each [
				['Persistent memory', 'Agents remember context across sessions'],
				['Toolchain support', 'Connect APIs, databases, and external services'],
				['Scheduling', 'Run agents on triggers, cron, or events'],
				['Configurable', 'Every behavior is defined in a single YAML file']
			] as [title, desc]}
				<div class="flex gap-3 items-start">
					<span class="mt-0.5 text-sm" style="color: var(--color-primary);">▸</span>
					<div>
						<div class="text-sm font-semibold">{title}</div>
						<div class="text-sm" style="color: var(--color-muted);">{desc}</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
