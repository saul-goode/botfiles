import { describe, it, expect } from 'vitest';
import { generateConfig, defaultFormState } from './openclaw';
import { transformModels, FALLBACK_MODELS } from './models';

describe('generateConfig', () => {
	it('generates valid JSON', () => {
		const json = generateConfig(defaultFormState());
		expect(() => JSON.parse(json)).not.toThrow();
	});

	it('includes both auth providers when OpenAI and Anthropic are selected', () => {
		const state = defaultFormState();
		state.auth.selectedFamilies = ['OpenAI', 'Anthropic'];
		const config = JSON.parse(generateConfig(state));
		expect(config.auth.profiles['openai-codex:default']).toBeDefined();
		expect(config.auth.profiles['openrouter:default']).toBeDefined();
	});

	it('omits openrouter when only OpenAI is selected', () => {
		const state = defaultFormState();
		state.auth.selectedFamilies = ['OpenAI'];
		const config = JSON.parse(generateConfig(state));
		expect(config.auth.profiles['openrouter:default']).toBeUndefined();
		expect(config.auth.profiles['openai-codex:default']).toBeDefined();
	});

	it('omits openai-codex when only non-OpenAI families are selected', () => {
		const state = defaultFormState();
		state.auth.selectedFamilies = ['Anthropic', 'Google'];
		const config = JSON.parse(generateConfig(state));
		expect(config.auth.profiles['openai-codex:default']).toBeUndefined();
		expect(config.auth.profiles['openrouter:default']).toBeDefined();
	});

	it('sets primary model correctly', () => {
		const state = defaultFormState();
		state.agent.primaryModel = 'openrouter/anthropic/claude-sonnet-4-5';
		const config = JSON.parse(generateConfig(state));
		expect(config.agents.defaults.model.primary).toBe('openrouter/anthropic/claude-sonnet-4-5');
	});

	it('includes fallback models', () => {
		const state = defaultFormState();
		state.agent.fallbacks = ['openrouter/google/gemini-2.5-flash', 'openrouter/openai/gpt-4o-mini'];
		const config = JSON.parse(generateConfig(state));
		expect(config.agents.defaults.model.fallbacks).toContain('openrouter/google/gemini-2.5-flash');
		expect(config.agents.defaults.model.fallbacks).toContain('openrouter/openai/gpt-4o-mini');
	});

	it('uses provided aliases in models map', () => {
		const state = defaultFormState();
		state.agent.primaryModel = 'openrouter/anthropic/claude-sonnet-4-6';
		state.agent.fallbacks = [];
		const aliases = { 'openrouter/anthropic/claude-sonnet-4-6': 'sonnet' };
		const config = JSON.parse(generateConfig(state, aliases));
		expect(config.agents.defaults.models['openrouter/anthropic/claude-sonnet-4-6'].alias).toBe('sonnet');
	});

	it('includes telegram channel when enabled', () => {
		const state = defaultFormState();
		state.telegram.enabled = true;
		state.telegram.botToken = '123:ABC';
		const config = JSON.parse(generateConfig(state));
		expect(config.channels.telegram).toBeDefined();
		expect(config.channels.telegram.botToken).toBe('123:ABC');
		expect(config.channels.telegram.enabled).toBe(true);
	});

	it('omits telegram when disabled', () => {
		const state = defaultFormState();
		state.telegram.enabled = false;
		const config = JSON.parse(generateConfig(state));
		expect(config.channels.telegram).toBeUndefined();
	});

	it('sets gateway port and bind', () => {
		const state = defaultFormState();
		state.gateway.port = 9000;
		state.gateway.bind = 'all';
		const config = JSON.parse(generateConfig(state));
		expect(config.gateway.port).toBe(9000);
		expect(config.gateway.bind).toBe('all');
	});

	it('omits gateway token when auth mode is none', () => {
		const state = defaultFormState();
		state.gateway.authMode = 'none';
		state.gateway.token = 'should-not-appear';
		const config = JSON.parse(generateConfig(state));
		expect(config.gateway.auth.mode).toBe('none');
		expect(config.gateway.auth.token).toBeUndefined();
	});

	it('includes session memory flag when enabled', () => {
		const state = defaultFormState();
		state.memory.sessionMemory = true;
		const config = JSON.parse(generateConfig(state));
		expect(config.agents.defaults.memorySearch.experimental?.sessionMemory).toBe(true);
	});

	it('omits session memory flag when disabled', () => {
		const state = defaultFormState();
		state.memory.sessionMemory = false;
		const config = JSON.parse(generateConfig(state));
		expect(config.agents.defaults.memorySearch.experimental).toBeUndefined();
	});

	it('uses update channel setting', () => {
		const state = defaultFormState();
		state.update.channel = 'beta';
		const config = JSON.parse(generateConfig(state));
		expect(config.update.channel).toBe('beta');
	});
});

// Helper: wrap provider IDs into the actual API shape
function p(...ids: string[]) {
	return ids.map((providerId) => ({ providerId }));
}

describe('transformModels', () => {
	it('maps anthropic models to openrouter/anthropic/', () => {
		const models = transformModels([
			{ id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', family: 'anthropic', providers: p('anthropic') }
		]);
		expect(models[0].id).toBe('openrouter/anthropic/claude-sonnet-4-6');
		expect(models[0].provider).toBe('openrouter');
		expect(models[0].family).toBe('Anthropic');
	});

	it('maps openai codex models to openai-codex/', () => {
		const models = transformModels([
			{ id: 'gpt-5.3-codex', name: 'GPT-5.3 Codex', family: 'openai', providers: p('openai') }
		]);
		const codexEntry = models.find((m) => m.id === 'openai-codex/gpt-5.3-codex');
		expect(codexEntry).toBeDefined();
		expect(codexEntry?.provider).toBe('openai-codex');
	});

	it('maps google models to openrouter/google/', () => {
		const models = transformModels([
			{ id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', family: 'google', providers: p('google-ai-studio') }
		]);
		expect(models[0].id).toBe('openrouter/google/gemini-2.5-flash');
		expect(models[0].family).toBe('Google');
	});

	it('maps xai models to openrouter/x-ai/', () => {
		const models = transformModels([
			{ id: 'grok-4', name: 'Grok 4', family: 'xai', providers: p('xai') }
		]);
		expect(models[0].id).toBe('openrouter/x-ai/grok-4');
	});

	it('skips llmgateway meta-models by id', () => {
		const models = transformModels([
			{ id: 'custom', family: 'llmgateway', providers: p('llmgateway') },
			{ id: 'auto', family: 'llmgateway', providers: p('llmgateway') }
		]);
		expect(models).toHaveLength(0);
	});

	it('deduplicates models with multiple matching providers', () => {
		const models = transformModels([
			{
				id: 'claude-sonnet-4-6',
				name: 'Claude Sonnet 4.6',
				family: 'anthropic',
				providers: p('anthropic', 'google-vertex')
			}
		]);
		const ids = models.map((m) => m.id);
		const unique = new Set(ids);
		expect(ids.length).toBe(unique.size);
	});

	it('uses top-level free flag from API', () => {
		const models = transformModels([
			{ id: 'some-model', name: 'Some Free Model', family: 'anthropic', providers: p('anthropic'), free: true }
		]);
		expect(models[0].free).toBe(true);
	});

	it('fallback models list is non-empty', () => {
		expect(FALLBACK_MODELS.length).toBeGreaterThan(0);
	});
});
