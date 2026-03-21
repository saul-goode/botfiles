<script lang="ts">
import {
	FALLBACK_MODELS,
	type ModelFamily,
	type ModelOption,
	PROVIDER_INFO,
} from "$lib/models";
import {
	type ConfigFormState,
	defaultFormState,
	generateConfig,
} from "$lib/openclaw";

const { data } = $props();
const allModels: ModelOption[] = data.models?.length
	? data.models
	: FALLBACK_MODELS;

const form = $state(defaultFormState());
let copied = $state(false);
let activeSection = $state("auth");

// Build alias map from live model list for config generation
const modelAliases = $derived(
	Object.fromEntries(allModels.map((m) => [m.id, m.alias])),
);

const config = $derived(generateConfig(form, modelAliases));

// Models filtered by selected provider families
const availableModels = $derived(
	allModels.filter((m) => form.auth.selectedFamilies.includes(m.family)),
);

// Grouped for display
const modelsByFamily = $derived.by(() => {
	const groups = new Map<ModelFamily, ModelOption[]>();
	for (const m of availableModels) {
		if (!groups.has(m.family)) groups.set(m.family, []);
		groups.get(m.family)!.push(m);
	}
	return groups;
});

const sections = [
	{ id: "auth", label: "Auth", icon: "🔑" },
	{ id: "models", label: "Models", icon: "🤖" },
	{ id: "memory", label: "Memory", icon: "🧠" },
	{ id: "channels", label: "Channels", icon: "📡" },
	{ id: "gateway", label: "Gateway", icon: "🔌" },
	{ id: "system", label: "System", icon: "⚙️" },
];

const ALL_FAMILIES: ModelFamily[] = [
	"OpenAI",
	"Anthropic",
	"Google",
	"xAI",
	"Perplexity",
	"Meta",
	"Groq",
	"Other",
];

async function copyToClipboard() {
	await navigator.clipboard.writeText(config);
	copied = true;
	setTimeout(() => (copied = false), 2000);
}

function downloadConfig() {
	const blob = new Blob([config], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "openclaw.json";
	a.click();
	URL.revokeObjectURL(url);
}

function toggleFallback(modelId: string) {
	const idx = form.agent.fallbacks.indexOf(modelId);
	if (idx === -1) {
		form.agent.fallbacks = [...form.agent.fallbacks, modelId];
	} else {
		form.agent.fallbacks = form.agent.fallbacks.filter((m) => m !== modelId);
	}
}

function toggleMemorySource(src: "memory" | "sessions" | "files") {
	const idx = form.memory.sources.indexOf(src);
	if (idx === -1) {
		form.memory.sources = [...form.memory.sources, src];
	} else {
		form.memory.sources = form.memory.sources.filter((s) => s !== src);
	}
}

function toggleFamily(family: ModelFamily) {
	if (form.auth.selectedFamilies.includes(family)) {
		form.auth.selectedFamilies = form.auth.selectedFamilies.filter(
			(f) => f !== family,
		);
	} else {
		form.auth.selectedFamilies = [...form.auth.selectedFamilies, family];
	}
}
</script>

<svelte:head>
  <title>Config Generator — botfil.es</title>
  <meta
    name="description"
    content="Generate your openclaw.json configuration file."
  />
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-12 pb-24 lg:pb-12">
  <!-- Header -->
  <div class="mb-8">
    <a
      href="/tools"
      class="text-xs font-mono"
      style="color: var(--color-muted);">← Tools</a
    >
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
    <div class="min-w-0">
      <!-- Section tabs -->
      <div
        class="grid grid-cols-2 md:grid-cols-6 gap-1 p-1 rounded-lg mb-6"
        style="background-color: var(--color-surface);"
      >
        {#each sections as sec}
          <button
            onclick={() => (activeSection = sec.id)}
            class="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium transition-all"
            style={activeSection === sec.id
              ? "background-color: var(--color-surface-elevated); color: var(--color-primary); border: 1px solid var(--color-border);"
              : "color: var(--color-muted); border: 1px solid transparent;"}
          >
            <span class="text-xs">{sec.icon}</span>
            {sec.label}
          </button>
        {/each}
      </div>

      <!-- Auth -->
      {#if activeSection === "auth"}
        <div class="card space-y-5">
          <h2 class="font-semibold text-lg">AI Providers</h2>
          <p class="text-sm" style="color: var(--color-muted);">
            Select the providers you want to use. Only models from enabled
            providers will appear in the Models tab.
          </p>

          <div class="grid sm:grid-cols-2 gap-2">
            {#each ALL_FAMILIES as family}
              {@const info = PROVIDER_INFO[family]}
              {@const enabled = form.auth.selectedFamilies.includes(family)}
              {@const modelCount = allModels.filter(
                (m) => m.family === family,
              ).length}
              {#if modelCount > 0}
                <button
                  onclick={() => toggleFamily(family)}
                  class="flex items-start gap-3 p-3 rounded-lg text-left transition-all"
                  style="border: 1px solid {enabled
                    ? 'color-mix(in srgb, var(--color-primary) 40%, var(--color-border))'
                    : 'var(--color-border)'}; background: {enabled
                    ? 'color-mix(in srgb, var(--color-primary) 6%, transparent)'
                    : 'transparent'};"
                >
                  <span class="text-xl mt-0.5 shrink-0">{info.icon}</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                      <div class="font-semibold text-sm">{family}</div>
                      <div
                        class="w-4 h-4 rounded border shrink-0 flex items-center justify-center text-xs font-bold"
                        style="border-color: {enabled
                          ? 'var(--color-primary)'
                          : 'var(--color-border)'}; background: {enabled
                          ? 'var(--color-primary)'
                          : 'transparent'}; color: var(--color-bg);"
                      >
                        {enabled ? "✓" : ""}
                      </div>
                    </div>
                    <div
                      class="text-xs mt-0.5 leading-snug"
                      style="color: var(--color-muted);"
                    >
                      {info.description}
                    </div>
                    <div
                      class="text-xs mt-1 font-mono"
                      style="color: {enabled
                        ? 'var(--color-primary)'
                        : 'var(--color-muted)'};"
                    >
                      {modelCount} models · via {info.openclaw}
                    </div>
                  </div>
                </button>
              {/if}
            {/each}
          </div>

          {#if form.auth.selectedFamilies.length === 0}
            <div
              class="p-3 rounded-lg text-sm"
              style="background: color-mix(in srgb, var(--color-accent) 8%, transparent); border: 1px solid color-mix(in srgb, var(--color-accent) 20%, transparent); color: var(--color-muted);"
            >
              Select at least one provider to configure models.
            </div>
          {/if}

          <div
            class="p-3 rounded-lg text-xs"
            style="background-color: color-mix(in srgb, var(--color-accent) 8%, transparent); border: 1px solid color-mix(in srgb, var(--color-accent) 20%, transparent); color: var(--color-muted);"
          >
            API keys are not stored here — OpenClaw manages credentials in its
            own secure store. This just tells the config which auth profiles to
            activate.
          </div>
        </div>
      {/if}

      <!-- Models -->
      {#if activeSection === "models"}
        <div class="card space-y-6">
          <h2 class="font-semibold text-lg">Model Configuration</h2>

          {#if availableModels.length === 0}
            <div
              class="p-4 rounded-lg text-sm"
              style="background-color: var(--color-surface-elevated); color: var(--color-muted);"
            >
              Enable at least one provider in the Auth tab to see available
              models.
            </div>
          {:else}
            <!-- Primary model -->
            <div>
              <label class="label" for="primary-model">Primary model</label>
              <select
                id="primary-model"
                class="input-field"
                bind:value={form.agent.primaryModel}
              >
                {#each [...modelsByFamily.entries()] as [family, models]}
                  <optgroup label={family}>
                    {#each models as m}
                      <option value={m.id}
                        >{m.label}{m.free ? " ★ free" : ""}</option
                      >
                    {/each}
                  </optgroup>
                {/each}
              </select>
              <p
                class="text-xs mt-1 font-mono"
                style="color: var(--color-muted);"
              >
                {form.agent.primaryModel}
              </p>
            </div>

            <!-- Fallbacks -->
            <div>
              <div class="label mb-1">Fallback models</div>
              <p class="text-xs mb-3" style="color: var(--color-muted);">
                Tried in order if the primary is unavailable.
                {form.agent.fallbacks.length > 0
                  ? `${form.agent.fallbacks.length} selected.`
                  : "None selected."}
              </p>

              {#each [...modelsByFamily.entries()] as [family, models]}
                {@const eligibleModels = models.filter(
                  (m) => m.id !== form.agent.primaryModel,
                )}
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
                        {@const selected = form.agent.fallbacks.includes(
                          model.id,
                        )}
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
                              {#if model.free}<span
                                  style="color: var(--color-success);"
                                  >★ free</span
                                >{/if}
                            </div>
                            <div
                              class="text-xs font-mono"
                              style="color: var(--color-muted);"
                            >
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
              <select
                id="heartbeat-model"
                class="input-field"
                bind:value={form.agent.heartbeatModel}
              >
                {#each [...modelsByFamily.entries()] as [family, models]}
                  <optgroup label={family}>
                    {#each models as m}
                      <option value={m.id}
                        >{m.label}{m.free ? " ★ free" : ""}</option
                      >
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
                <label class="label" for="max-concurrent"
                  >Max concurrent agents</label
                >
                <input
                  id="max-concurrent"
                  type="number"
                  min="1"
                  max="20"
                  class="input-field"
                  bind:value={form.agent.maxConcurrent}
                />
              </div>
              <div>
                <label class="label" for="max-subagents"
                  >Max concurrent subagents</label
                >
                <input
                  id="max-subagents"
                  type="number"
                  min="1"
                  max="32"
                  class="input-field"
                  bind:value={form.agent.subagentsMaxConcurrent}
                />
              </div>
            </div>

            <div>
              <label class="label" for="workspace">Workspace path</label>
              <input
                id="workspace"
                type="text"
                class="input-field"
                bind:value={form.agent.workspace}
                placeholder="~/.openclaw/workspace"
              />
            </div>
          {/if}
        </div>
      {/if}

      <!-- Memory -->
      {#if activeSection === "memory"}
        <div class="card space-y-6">
          <h2 class="font-semibold text-lg">Memory &amp; Context</h2>

          <div>
            <div class="label mb-2">Memory search sources</div>
            <div class="space-y-2">
              {#each ["memory", "sessions", "files"] as src}
                {@const enabled = form.memory.sources.includes(
                  src as "memory" | "sessions" | "files",
                )}
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
                    onchange={() =>
                      toggleMemorySource(
                        src as "memory" | "sessions" | "files",
                      )}
                    class="w-4 h-4 accent-[var(--color-primary)]"
                  />
                </label>
              {/each}
            </div>
          </div>

          <label
            class="flex items-center justify-between p-3 rounded-lg cursor-pointer"
            style="border: 1px solid {form.memory.sessionMemory
              ? 'color-mix(in srgb, var(--color-primary) 30%, var(--color-border))'
              : 'var(--color-border)'};"
          >
            <div>
              <div class="text-sm font-medium">
                Session memory (experimental)
              </div>
              <div class="text-xs mt-0.5" style="color: var(--color-muted);">
                Persist context across sessions
              </div>
            </div>
            <input
              type="checkbox"
              bind:checked={form.memory.sessionMemory}
              class="w-4 h-4 accent-[var(--color-primary)]"
            />
          </label>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label" for="embed-provider"
                >Embedding provider</label
              >
              <select
                id="embed-provider"
                class="input-field"
                bind:value={form.memory.provider}
              >
                <option value="openai">openai</option>
                <option value="openrouter">openrouter</option>
              </select>
            </div>
            <div>
              <label class="label" for="embed-model">Embedding model</label>
              <select
                id="embed-model"
                class="input-field"
                bind:value={form.memory.model}
              >
                <option value="text-embedding-3-small"
                  >text-embedding-3-small</option
                >
                <option value="text-embedding-3-large"
                  >text-embedding-3-large</option
                >
                <option value="text-embedding-ada-002"
                  >text-embedding-ada-002</option
                >
              </select>
            </div>
          </div>

          <div class="border-t pt-5" style="border-color: var(--color-border);">
            <h3 class="font-medium mb-4">Context Pruning</h3>
            <div class="space-y-4">
              <div>
                <label class="label" for="prune-mode">Mode</label>
                <select
                  id="prune-mode"
                  class="input-field"
                  bind:value={form.context.pruningMode}
                >
                  <option value="cache-ttl">cache-ttl — prune after TTL</option>
                  <option value="none">none — never prune</option>
                </select>
              </div>
              {#if form.context.pruningMode === "cache-ttl"}
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label" for="prune-ttl">TTL</label>
                    <input
                      id="prune-ttl"
                      type="text"
                      class="input-field"
                      bind:value={form.context.ttl}
                      placeholder="6h"
                    />
                    <p class="text-xs mt-1" style="color: var(--color-muted);">
                      e.g. 1h, 6h, 24h
                    </p>
                  </div>
                  <div>
                    <label class="label" for="keep-assistants"
                      >Keep last N assistants</label
                    >
                    <input
                      id="keep-assistants"
                      type="number"
                      min="1"
                      max="20"
                      class="input-field"
                      bind:value={form.context.keepLastAssistants}
                    />
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
                <select
                  id="compact-mode"
                  class="input-field"
                  bind:value={form.compaction.mode}
                >
                  <option value="default">default</option>
                  <option value="disabled">disabled</option>
                </select>
              </div>
              <label
                class="flex items-center justify-between p-3 rounded-lg cursor-pointer"
                style="border: 1px solid {form.compaction.memoryFlushEnabled
                  ? 'color-mix(in srgb, var(--color-primary) 30%, var(--color-border))'
                  : 'var(--color-border)'};"
              >
                <div>
                  <div class="text-sm font-medium">Memory flush</div>
                  <div
                    class="text-xs mt-0.5"
                    style="color: var(--color-muted);"
                  >
                    Extract key decisions to memory files when context grows
                    large
                  </div>
                </div>
                <input
                  type="checkbox"
                  bind:checked={form.compaction.memoryFlushEnabled}
                  class="w-4 h-4 accent-[var(--color-primary)]"
                />
              </label>
              {#if form.compaction.memoryFlushEnabled}
                <div>
                  <label class="label" for="soft-threshold"
                    >Soft threshold (tokens)</label
                  >
                  <input
                    id="soft-threshold"
                    type="number"
                    min="1000"
                    step="1000"
                    class="input-field"
                    bind:value={form.compaction.softThresholdTokens}
                  />
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}

      <!-- Channels -->
      {#if activeSection === "channels"}
        <div class="card space-y-5">
          <h2 class="font-semibold text-lg">Channels</h2>
          <p class="text-sm" style="color: var(--color-muted);">
            Channels let your agent receive messages from external platforms.
          </p>

          <div
            class="rounded-lg overflow-hidden"
            style="border: 1px solid {form.telegram.enabled
              ? 'color-mix(in srgb, var(--color-primary) 30%, var(--color-border))'
              : 'var(--color-border)'};"
          >
            <div
              class="flex items-center justify-between p-4"
              style="background: {form.telegram.enabled
                ? 'color-mix(in srgb, var(--color-primary) 5%, transparent)'
                : 'transparent'};"
            >
              <div class="flex items-center gap-3">
                <span class="text-lg">✈️</span>
                <div>
                  <div class="font-semibold text-sm">Telegram</div>
                  <div class="text-xs" style="color: var(--color-muted);">
                    Bot integration
                  </div>
                </div>
              </div>
              <label class="flex items-center gap-2 cursor-pointer">
                <span class="text-xs" style="color: var(--color-muted);"
                  >Enable</span
                >
                <input
                  type="checkbox"
                  bind:checked={form.telegram.enabled}
                  class="w-4 h-4 accent-[var(--color-primary)]"
                />
              </label>
            </div>

            {#if form.telegram.enabled}
              <div
                class="p-4 space-y-4"
                style="border-top: 1px solid var(--color-border);"
              >
                <div>
                  <label class="label" for="tg-token">Bot token</label>
                  <input
                    id="tg-token"
                    type="password"
                    class="input-field"
                    bind:value={form.telegram.botToken}
                    placeholder="1234567890:AAB..."
                  />
                  <p class="text-xs mt-1" style="color: var(--color-muted);">
                    From @BotFather on Telegram.
                  </p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label" for="tg-dm">DM policy</label>
                    <select
                      id="tg-dm"
                      class="input-field"
                      bind:value={form.telegram.dmPolicy}
                    >
                      <option value="pairing">pairing</option>
                      <option value="open">open</option>
                      <option value="closed">closed</option>
                    </select>
                  </div>
                  <div>
                    <label class="label" for="tg-group">Group policy</label>
                    <select
                      id="tg-group"
                      class="input-field"
                      bind:value={form.telegram.groupPolicy}
                    >
                      <option value="allowlist">allowlist</option>
                      <option value="denylist">denylist</option>
                      <option value="open">open</option>
                      <option value="closed">closed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="label" for="tg-streaming">Streaming</label>
                  <select
                    id="tg-streaming"
                    class="input-field"
                    bind:value={form.telegram.streaming}
                  >
                    <option value="off">off — send complete messages</option>
                    <option value="on">on — stream as tokens arrive</option>
                  </select>
                </div>
              </div>
            {/if}
          </div>

          <div
            class="p-3 rounded-lg text-sm"
            style="background-color: var(--color-surface-elevated); color: var(--color-muted);"
          >
            More channels (Discord, Slack, webhook) coming in a future release.
          </div>
        </div>
      {/if}

      <!-- Gateway -->
      {#if activeSection === "gateway"}
        <div class="card space-y-5">
          <h2 class="font-semibold text-lg">Gateway</h2>
          <p class="text-sm" style="color: var(--color-muted);">
            The local HTTP gateway exposes a control API for your agent.
          </p>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label" for="gw-port">Port</label>
              <input
                id="gw-port"
                type="number"
                min="1024"
                max="65535"
                class="input-field"
                bind:value={form.gateway.port}
              />
            </div>
            <div>
              <label class="label" for="gw-mode">Mode</label>
              <select
                id="gw-mode"
                class="input-field"
                bind:value={form.gateway.mode}
              >
                <option value="local">local</option>
                <option value="remote">remote</option>
              </select>
            </div>
          </div>
          <div>
            <label class="label" for="gw-bind">Bind address</label>
            <select
              id="gw-bind"
              class="input-field"
              bind:value={form.gateway.bind}
            >
              <option value="loopback"
                >loopback — localhost only (recommended)</option
              >
              <option value="all">all — all interfaces</option>
            </select>
          </div>
          <div class="border-t pt-4" style="border-color: var(--color-border);">
            <h3 class="font-medium mb-4">Auth</h3>
            <div class="space-y-4">
              <div>
                <label class="label" for="gw-auth-mode">Auth mode</label>
                <select
                  id="gw-auth-mode"
                  class="input-field"
                  bind:value={form.gateway.authMode}
                >
                  <option value="token">token</option>
                  <option value="none">none</option>
                </select>
              </div>
              {#if form.gateway.authMode === "token"}
                <div>
                  <label class="label" for="gw-token">Token</label>
                  <input
                    id="gw-token"
                    type="password"
                    class="input-field"
                    bind:value={form.gateway.token}
                    placeholder="your-secret-token"
                  />
                </div>
              {/if}
            </div>
          </div>
          <div class="border-t pt-4" style="border-color: var(--color-border);">
            <h3 class="font-medium mb-4">Tailscale</h3>
            <div>
              <label class="label" for="ts-mode">Mode</label>
              <select
                id="ts-mode"
                class="input-field"
                bind:value={form.gateway.tailscaleMode}
              >
                <option value="off">off — no Tailscale</option>
                <option value="serve"
                  >serve — expose on Tailscale network</option
                >
                <option value="funnel"
                  >funnel — expose publicly via Tailscale</option
                >
              </select>
            </div>
          </div>
        </div>
      {/if}

      <!-- System -->
      {#if activeSection === "system"}
        <div class="card space-y-6">
          <h2 class="font-semibold text-lg">System</h2>
          <div>
            <label class="label" for="update-channel">Update channel</label>
            <select
              id="update-channel"
              class="input-field"
              bind:value={form.update.channel}
            >
              <option value="stable">stable</option>
              <option value="beta">beta</option>
              <option value="nightly">nightly</option>
            </select>
          </div>
          <div class="space-y-3">
            <label
              class="flex items-center justify-between p-3 rounded-lg cursor-pointer"
              style="border: 1px solid var(--color-border);"
            >
              <div class="text-sm font-medium">Check for updates on start</div>
              <input
                type="checkbox"
                bind:checked={form.update.checkOnStart}
                class="w-4 h-4 accent-[var(--color-primary)]"
              />
            </label>
            <label
              class="flex items-center justify-between p-3 rounded-lg cursor-pointer"
              style="border: 1px solid var(--color-border);"
            >
              <div>
                <div class="text-sm font-medium">Auto-update</div>
                <div class="text-xs mt-0.5" style="color: var(--color-muted);">
                  Install updates without prompting
                </div>
              </div>
              <input
                type="checkbox"
                bind:checked={form.update.autoUpdate}
                class="w-4 h-4 accent-[var(--color-primary)]"
              />
            </label>
          </div>
          <div class="border-t pt-5" style="border-color: var(--color-border);">
            <h3 class="font-medium mb-4">Logging</h3>
            <div>
              <label class="label" for="log-redact">Redact sensitive data</label
              >
              <select
                id="log-redact"
                class="input-field"
                bind:value={form.logging.redactSensitive}
              >
                <option value="none">none — log everything</option>
                <option value="tools"
                  >tools — redact tool I/O (recommended)</option
                >
                <option value="all">all — redact all sensitive fields</option>
              </select>
            </div>
          </div>
          <div class="border-t pt-5" style="border-color: var(--color-border);">
            <h3 class="font-medium mb-4">Skills &amp; Install</h3>
            <div class="space-y-4">
              <div>
                <label class="label" for="node-manager"
                  >Node package manager</label
                >
                <select
                  id="node-manager"
                  class="input-field"
                  bind:value={form.skills.nodeManager}
                >
                  <option value="bun">bun</option>
                  <option value="npm">npm</option>
                  <option value="yarn">yarn</option>
                  <option value="pnpm">pnpm</option>
                </select>
              </div>
              <label
                class="flex items-center justify-between p-3 rounded-lg cursor-pointer"
                style="border: 1px solid var(--color-border);"
              >
                <div>
                  <div class="text-sm font-medium">
                    Prefer Homebrew for installs
                  </div>
                  <div
                    class="text-xs mt-0.5"
                    style="color: var(--color-muted);"
                  >
                    macOS only
                  </div>
                </div>
                <input
                  type="checkbox"
                  bind:checked={form.skills.preferBrew}
                  class="w-4 h-4 accent-[var(--color-primary)]"
                />
              </label>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Right: JSON output (desktop only) -->
    <div class="hidden lg:block min-w-0 lg:sticky lg:top-20 self-start">
      <div
        class="card"
        style="border-color: color-mix(in srgb, var(--color-primary) 20%, var(--color-border));"
      >
        <div class="flex items-center justify-between mb-3">
          <span
            class="font-mono text-sm font-semibold"
            style="color: var(--color-primary);"
          >
            openclaw.json
          </span>
          <div class="flex gap-2">
            <button
              class="btn-ghost text-xs py-1 px-2.5"
              onclick={copyToClipboard}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
            <button
              class="btn-primary text-xs py-1 px-2.5"
              onclick={downloadConfig}
            >
              Download
            </button>
          </div>
        </div>
        <pre
          class="w-full font-mono text-xs leading-relaxed rounded-lg p-3 overflow-x-auto"
          style="background-color: var(--color-bg); color: var(--color-text); max-height: 75vh; overflow-y: auto;">{config}</pre>
      </div>
    </div>
  </div>
</div>

<!-- Mobile: sticky bottom action bar -->
<div
  class="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 flex gap-3"
  style="background-color: color-mix(in srgb, var(--color-bg) 90%, transparent); backdrop-filter: blur(12px); border-top: 1px solid var(--color-border);"
>
  <button class="btn-ghost flex-1 text-sm py-2" onclick={copyToClipboard}>
    {copied ? "✓ Copied" : "Copy JSON"}
  </button>
  <button class="btn-primary flex-1 text-sm py-2" onclick={downloadConfig}>
    Download
  </button>
</div>
