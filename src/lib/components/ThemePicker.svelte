<script lang="ts">
	import { onMount } from 'svelte';
	import { THEMES, STORAGE_KEY } from '$lib/themes';

	let currentTheme = $state('default');
	let open = $state(false);

	onMount(() => {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved && THEMES.find((t) => t.key === saved)) {
			currentTheme = saved;
		}
	});

	function applyTheme(key: string) {
		currentTheme = key;
		localStorage.setItem(STORAGE_KEY, key);
		if (key === 'default') {
			document.documentElement.removeAttribute('data-theme');
		} else {
			document.documentElement.dataset.theme = key;
		}
		open = false;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div class="relative">
	<button
		onclick={() => (open = !open)}
		aria-label="Choose theme"
		aria-expanded={open}
		class="p-1.5 rounded-md transition-colors"
		style="color: {open
			? 'var(--color-primary)'
			: 'var(--color-muted)'}; background: {open
			? 'color-mix(in srgb, var(--color-primary) 8%, transparent)'
			: 'transparent'};"
	>
		<!-- Lucide "palette" icon -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
			<circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
			<circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
			<circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
			<path
				d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"
			/>
		</svg>
	</button>

	{#if open}
		<!-- Backdrop to close on outside click (Escape key also closes via svelte:window) -->
		<div role="presentation" class="fixed inset-0 z-40" onclick={() => (open = false)}></div>

		<!-- Popover -->
		<div
			class="absolute right-0 top-full mt-2 z-50 rounded-xl p-3 shadow-2xl"
			style="background-color: var(--color-surface-elevated); border: 1px solid var(--color-border); min-width: 196px;"
		>
			<div
				class="text-xs font-semibold uppercase tracking-widest mb-3 px-1"
				style="color: var(--color-muted);"
			>
				Theme
			</div>
			<div class="space-y-0.5">
				{#each THEMES as theme}
					{@const active = currentTheme === theme.key}
					<button
						onclick={() => applyTheme(theme.key)}
						class="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-all"
						style="background: {active
							? 'color-mix(in srgb, var(--color-primary) 8%, transparent)'
							: 'transparent'}; border: 1px solid {active
							? 'color-mix(in srgb, var(--color-primary) 25%, var(--color-border))'
							: 'transparent'};"
					>
						<!-- Color swatches preview -->
						<div class="flex gap-0.5 shrink-0" aria-hidden="true">
							{#each theme.swatches as color}
								<div
									class="w-3 h-3 rounded-full"
									style="background-color: {color}; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1);"
								></div>
							{/each}
						</div>
						<span
							class="text-sm flex-1 font-medium"
							style="color: {active ? 'var(--color-text)' : 'var(--color-muted)'};"
						>
							{theme.name}
						</span>
						{#if active}
							<span class="text-xs" style="color: var(--color-primary);">✓</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
