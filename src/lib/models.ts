/**
 * Model transformation layer: converts llmgateway.io model entries
 * into OpenClaw-compatible model IDs and display metadata.
 */

export type OpenClawProvider = 'openai-codex' | 'openrouter';
export type ModelFamily = 'OpenAI' | 'Anthropic' | 'Google' | 'xAI' | 'Perplexity' | 'Meta' | 'Groq' | 'Other';

export interface ModelOption {
	/** Full OpenClaw model ID, e.g. "openrouter/anthropic/claude-sonnet-4-6" */
	id: string;
	/** Human-readable label */
	label: string;
	/** Provider family for grouping */
	family: ModelFamily;
	/** Which OpenClaw auth profile enables this model */
	provider: OpenClawProvider;
	/** Suggested short alias */
	alias: string;
	/** Whether this model is available for free */
	free: boolean;
}

// Actual shape returned by api.llmgateway.io/v1/models
interface LLMGatewayProvider {
	providerId: string;
}

interface LLMGatewayModel {
	id: string;
	name?: string;
	/** Top-level family slug e.g. "openai", "anthropic", "google" */
	family?: string;
	/** Array of provider objects — extract .providerId for routing */
	providers?: LLMGatewayProvider[];
	/** Top-level free flag */
	free?: boolean;
}

/** Maps llmgateway provider slugs to OpenRouter provider slugs */
const OPENROUTER_PROVIDER_MAP: Record<string, string> = {
	anthropic: 'anthropic',
	'google-ai-studio': 'google',
	'google-vertex': 'google',
	xai: 'x-ai',
	perplexity: 'perplexity',
	groq: 'groq',
	'together.ai': 'togetherai',
	cerebras: 'cerebras',
	nebius: 'nebius'
};

const FAMILY_MAP: Record<string, ModelFamily> = {
	openai: 'OpenAI',
	anthropic: 'Anthropic',
	google: 'Google',
	xai: 'xAI',
	perplexity: 'Perplexity',
	meta: 'Meta',
	groq: 'Groq'
};

/** Provider IDs we don't want to surface */
const SKIP_PROVIDER_IDS = new Set(['llmgateway', 'aws-bedrock', 'azure', 'nanogpt', 'bytedance', 'obsidian']);

/** Generate a short alias from a model ID */
function suggestAlias(modelId: string): string {
	return modelId
		.replace(/^openrouter\/[^/]+\//, '')
		.replace(/^openai-codex\//, '')
		.split('-')
		.slice(0, 3)
		.join('-')
		.replace(/[.:]/g, '')
		.toLowerCase()
		.slice(0, 12);
}

export function transformModels(raw: LLMGatewayModel[]): ModelOption[] {
	const seen = new Set<string>();
	const results: ModelOption[] = [];

	for (const model of raw) {
		if (model.id === 'custom' || model.id === 'auto') continue;

		// Extract provider ID strings from the objects array
		const providerIds = (model.providers ?? []).map((p) => p.providerId);

		// Skip models that only have infra-level providers
		if (providerIds.length > 0 && providerIds.every((p) => SKIP_PROVIDER_IDS.has(p))) continue;

		// Use the top-level family field for grouping (more reliable than inferring from providers)
		const familySlug = model.family ?? '';
		const family: ModelFamily = FAMILY_MAP[familySlug] ?? 'Other';
		const isFree = model.free ?? model.id.includes(':free');
		const label = model.name ?? model.id;

		// OpenAI models: codex variants → openai-codex, others → both openai-codex and openrouter/openai
		if (familySlug === 'openai') {
			if (model.id.includes('codex')) {
				const id = `openai-codex/${model.id}`;
				if (!seen.has(id)) {
					seen.add(id);
					results.push({ id, label, family, provider: 'openai-codex', alias: suggestAlias(id), free: false });
				}
			} else {
				const idCodex = `openai-codex/${model.id}`;
				if (!seen.has(idCodex)) {
					seen.add(idCodex);
					results.push({ id: idCodex, label, family, provider: 'openai-codex', alias: suggestAlias(idCodex), free: false });
				}
				const idRouter = `openrouter/openai/${model.id}`;
				if (!seen.has(idRouter)) {
					seen.add(idRouter);
					results.push({ id: idRouter, label: `${label} (via OpenRouter)`, family, provider: 'openrouter', alias: suggestAlias(idRouter), free: false });
				}
			}
			continue;
		}

		// All other providers: find first mappable provider ID for the openrouter slug
		const primaryProviderId = providerIds.find((p) => OPENROUTER_PROVIDER_MAP[p]);
		if (!primaryProviderId) continue;

		const routerSlug = OPENROUTER_PROVIDER_MAP[primaryProviderId];
		const id = `openrouter/${routerSlug}/${model.id}`;

		if (!seen.has(id)) {
			seen.add(id);
			results.push({ id, label, family, provider: 'openrouter', alias: suggestAlias(id), free: isFree });
		}
	}

	return results.sort((a, b) => {
		// Sort by family priority, then alphabetically
		const familyOrder: ModelFamily[] = ['OpenAI', 'Anthropic', 'Google', 'xAI', 'Perplexity', 'Meta', 'Groq', 'Other'];
		const fa = familyOrder.indexOf(a.family);
		const fb = familyOrder.indexOf(b.family);
		if (fa !== fb) return fa - fb;
		return a.label.localeCompare(b.label);
	});
}

/** Simple in-memory cache */
let cache: { models: ModelOption[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function fetchModels(): Promise<ModelOption[]> {
	if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
		return cache.models;
	}

	try {
		const res = await fetch('https://api.llmgateway.io/v1/models');
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();

		// llmgateway returns { data: [...] } or just an array
		const raw: LLMGatewayModel[] = Array.isArray(data) ? data : (data.data ?? []);
		const models = transformModels(raw);

		cache = { models, fetchedAt: Date.now() };
		return models;
	} catch (err) {
		console.warn('[models] Failed to fetch from llmgateway.io, using fallback:', err);
		return FALLBACK_MODELS;
	}
}

/** Hardcoded fallback used when the API is unreachable */
export const FALLBACK_MODELS: ModelOption[] = [
	{ id: 'openai-codex/gpt-5.3-codex', label: 'GPT-5.3 Codex', family: 'OpenAI', provider: 'openai-codex', alias: 'codex', free: false },
	{ id: 'openai-codex/gpt-5-mini', label: 'GPT-5 Mini', family: 'OpenAI', provider: 'openai-codex', alias: 'codex-mini', free: false },
	{ id: 'openrouter/anthropic/claude-opus-4-6', label: 'Claude Opus 4.6', family: 'Anthropic', provider: 'openrouter', alias: 'opus', free: false },
	{ id: 'openrouter/anthropic/claude-sonnet-4-5', label: 'Claude Sonnet 4.5', family: 'Anthropic', provider: 'openrouter', alias: 'sonnet', free: false },
	{ id: 'openrouter/anthropic/claude-haiku-4-5', label: 'Claude Haiku 4.5', family: 'Anthropic', provider: 'openrouter', alias: 'haiku', free: false },
	{ id: 'openrouter/google/gemini-2.5-flash', label: 'Gemini 2.5 Flash', family: 'Google', provider: 'openrouter', alias: 'flash', free: false },
	{ id: 'openrouter/google/gemini-2.5-pro', label: 'Gemini 2.5 Pro', family: 'Google', provider: 'openrouter', alias: 'gemini-pro', free: false },
	{ id: 'openrouter/openai/gpt-4o-mini', label: 'GPT-4o Mini (OpenRouter)', family: 'OpenAI', provider: 'openrouter', alias: 'mini', free: false },
	{ id: 'openrouter/x-ai/grok-4', label: 'Grok 4', family: 'xAI', provider: 'openrouter', alias: 'grok', free: false },
	{ id: 'openrouter/perplexity/sonar', label: 'Sonar', family: 'Perplexity', provider: 'openrouter', alias: 'sonar', free: false }
];
