import { describe, it, expect } from 'vitest';
import { generateConfig, defaultFormState, type ConfigFormState } from './openclaw';

describe('generateConfig', () => {
	it('generates valid JSON', () => {
		const json = generateConfig(defaultFormState());
		expect(() => JSON.parse(json)).not.toThrow();
	});

	it('includes both auth providers by default', () => {
		const config = JSON.parse(generateConfig(defaultFormState()));
		expect(config.auth.profiles['openai-codex:default']).toBeDefined();
		expect(config.auth.profiles['openrouter:default']).toBeDefined();
	});

	it('omits disabled auth providers', () => {
		const state = defaultFormState();
		state.auth.useOpenRouter = false;
		const config = JSON.parse(generateConfig(state));
		expect(config.auth.profiles['openrouter:default']).toBeUndefined();
		expect(config.auth.profiles['openai-codex:default']).toBeDefined();
	});

	it('sets primary model correctly', () => {
		const state = defaultFormState();
		state.agent.primaryModel = 'openrouter/anthropic/claude-sonnet-4-5';
		const config = JSON.parse(generateConfig(state));
		expect(config.agents.defaults.model.primary).toBe('openrouter/anthropic/claude-sonnet-4-5');
	});

	it('includes fallback models', () => {
		const state = defaultFormState();
		state.agent.fallbacks = ['openrouter/google/gemini-flash-1.5', 'openrouter/openai/gpt-4o-mini'];
		const config = JSON.parse(generateConfig(state));
		expect(config.agents.defaults.model.fallbacks).toContain('openrouter/google/gemini-flash-1.5');
		expect(config.agents.defaults.model.fallbacks).toContain('openrouter/openai/gpt-4o-mini');
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

	it('includes session memory experimental flag when enabled', () => {
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
