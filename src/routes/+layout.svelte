<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import ThemePicker from '$lib/components/ThemePicker.svelte';

	let { children } = $props();

	let mobileOpen = $state(false);

	const navLinks = [
		{ href: '/tools', label: 'Tools' },
		{ href: '/docs', label: 'Docs' },
		{ href: '/about', label: 'About' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="min-h-screen flex flex-col">
	<!-- Nav -->
	<header
		class="sticky top-0 z-50 border-b"
		style="background-color: color-mix(in srgb, var(--color-bg) 80%, transparent); backdrop-filter: blur(12px); border-color: var(--color-border);"
	>
		<nav class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
			<a
				href="/"
				class="flex items-center gap-2 font-mono font-semibold text-sm"
				style="color: var(--color-primary);"
			>
				<span
					class="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
					style="background-color: var(--color-primary); color: var(--color-bg);"
				>
					b
				</span>
				botfil.es
			</a>

			<div class="flex items-center gap-1">
				<!-- Desktop nav -->
				<div class="hidden md:flex items-center gap-1 mr-1">
					{#each navLinks as link}
						<a
							href={link.href}
							class="px-3 py-1.5 rounded text-sm font-medium transition-colors"
							style="color: var(--color-muted);"
							onmouseenter={(e) => ((e.target as HTMLElement).style.color = 'var(--color-text)')}
							onmouseleave={(e) => ((e.target as HTMLElement).style.color = 'var(--color-muted)')}
						>
							{link.label}
						</a>
					{/each}
				</div>

				<ThemePicker />

				<!-- Mobile toggle -->
				<button
					class="md:hidden p-1.5 rounded"
					style="color: var(--color-muted);"
					onclick={() => (mobileOpen = !mobileOpen)}
					aria-label="Toggle menu"
				>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					{#if mobileOpen}
						<path d="M18 6 6 18" /><path d="m6 6 12 12" />
					{:else}
						<line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line
							x1="4"
							x2="20"
							y1="18"
							y2="18"
						/>
					{/if}
				</svg>
				</button>
			</div>
		</nav>

		<!-- Mobile nav -->
		{#if mobileOpen}
			<div
				class="md:hidden border-t px-4 py-3 flex flex-col gap-1"
				style="border-color: var(--color-border); background-color: var(--color-surface);"
			>
				{#each navLinks as link}
					<a
						href={link.href}
						class="px-3 py-2 rounded text-sm font-medium"
						style="color: var(--color-muted);"
						onclick={() => (mobileOpen = false)}
					>
						{link.label}
					</a>
				{/each}
			</div>
		{/if}
	</header>

	<!-- Page content -->
	<main class="flex-1">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer
		class="border-t mt-20"
		style="border-color: var(--color-border); background-color: var(--color-surface);"
	>
		<div class="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
			<div class="flex items-center gap-2 font-mono text-sm" style="color: var(--color-muted);">
				<span style="color: var(--color-primary);">botfil.es</span>
				&mdash; tools for autonomous agents
			</div>
			<p class="text-xs" style="color: var(--color-muted);">
				Built with SvelteKit &amp; deployed on Vercel
			</p>
		</div>
	</footer>
</div>
