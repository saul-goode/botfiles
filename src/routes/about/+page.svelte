<svelte:head>
	<title>About — botfil.es</title>
	<meta name="description" content="About botfil.es and the OpenClaw autonomous agent framework." />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 py-16">
	<div class="section-title">About</div>
	<h1 class="text-3xl font-bold mb-8">botfil.es &amp; OpenClaw</h1>

	<div class="space-y-8" style="color: var(--color-muted); line-height: 1.8;">
		<section>
			<h2 class="text-lg font-semibold mb-3" style="color: var(--color-text);">What is botfil.es?</h2>
			<p>
				botfil.es is a collection of tools designed to make setting up and configuring autonomous
				agents easier. The first target is OpenClaw, but the goal is to eventually cover the broader
				landscape of agent frameworks.
			</p>
		</section>

		<section>
			<h2 class="text-lg font-semibold mb-3" style="color: var(--color-text);">What is OpenClaw?</h2>
			<p class="mb-4">
				OpenClaw is an autonomous agent framework for building persistent, goal-directed bots.
				It provides the runtime infrastructure for agents that need to maintain memory, use tools,
				and operate on a schedule — without requiring you to wire all of that up yourself.
			</p>
			<p>
				A single YAML configuration file defines everything: what your agent does, what tools it
				has access to, how often it runs, and how it stores state between sessions.
			</p>
		</section>

		<section>
			<h2 class="text-lg font-semibold mb-3" style="color: var(--color-text);">Why these tools?</h2>
			<p>
				OpenClaw's config format is powerful but has a learning curve. botfil.es started as a way
				to generate valid configs without reading through the full documentation every time — and
				grew from there.
			</p>
		</section>
	</div>

	<div class="mt-12">
		<a href="/tools" class="btn-primary">Explore the tools &rarr;</a>
	</div>
</div>
