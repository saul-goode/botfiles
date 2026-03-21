// TypeScript types for the OpenClaw config schema
// Model list is now dynamic — see $lib/models.ts
import type { ModelFamily } from './models';

export type UpdateChannel = 'stable' | 'beta' | 'nightly';
export type LoggingRedact = 'none' | 'tools' | 'all';
export type ModelsMergeMode = 'merge' | 'replace';
export type ContextPruningMode = 'cache-ttl' | 'none';
export type CompactionMode = 'default' | 'disabled';
export type GatewayMode = 'local' | 'remote';
export type GatewayBind = 'loopback' | 'all';
export type GatewayAuthMode = 'token' | 'none';
export type TailscaleMode = 'off' | 'funnel' | 'serve';
export type TelegramDmPolicy = 'pairing' | 'allowlist' | 'open' | 'disabled';
export type TelegramGroupPolicy = 'allowlist' | 'open' | 'disabled';
export type TelegramStreaming = 'off' | 'partial' | 'block' | 'progress';
export type TelegramReactionLevel = 'off' | 'ack' | 'minimal' | 'extensive';
export type DiscordDmPolicy = 'pairing' | 'allowlist' | 'open' | 'disabled';
export type DiscordGroupPolicy = 'allowlist' | 'open' | 'disabled';
export type DiscordStreaming = 'off' | 'partial' | 'block' | 'progress';
export type DiscordStatus = 'online' | 'idle' | 'dnd' | 'invisible';
export type MemorySearchSource = 'memory' | 'sessions' | 'files';
export type AgentListMode = 'replace' | 'merge';

export interface AuthProfile {
	provider: string;
	mode: 'oauth' | 'api_key';
	apiKey?: string;
}

export interface ModelEntry {
	alias: string;
}

export interface AgentDefaults {
	model: {
		primary: string;
		fallbacks: string[];
	};
	models: Record<string, ModelEntry>;
	workspace: string;
	memorySearch: {
		sources: MemorySearchSource[];
		experimental?: { sessionMemory?: boolean };
		provider: string;
		model: string;
	};
	contextPruning: {
		mode: ContextPruningMode;
		ttl: string;
		keepLastAssistants: number;
	};
	compaction: {
		mode: CompactionMode;
		memoryFlush: {
			enabled: boolean;
			softThresholdTokens: number;
		};
	};
	heartbeat: {
		model: string;
	};
	maxConcurrent: number;
	subagents: {
		maxConcurrent: number;
	};
}

export interface AgentEntry {
	id: string;
	default?: boolean;
	model?: {
		primary: string;
		fallbacks: string[];
	};
}

export interface OpenClawConfig {
	meta?: {
		lastTouchedVersion?: string;
		lastTouchedAt?: string;
	};
	update: {
		channel: UpdateChannel;
		checkOnStart: boolean;
		auto: { enabled: boolean };
	};
	auth: {
		profiles: Record<string, AuthProfile>;
	};
	logging: {
		redactSensitive: LoggingRedact;
	};
	models: {
		mode: ModelsMergeMode;
		providers: Record<string, unknown>;
	};
	agents: {
		defaults: AgentDefaults;
		list: AgentEntry[];
	};
	channels: {
		telegram?: {
			enabled: boolean;
			botToken: string;
			dmPolicy: TelegramDmPolicy;
			allowFrom?: number[];
			groupPolicy: TelegramGroupPolicy;
			streaming: TelegramStreaming;
			reactionLevel?: TelegramReactionLevel;
			textChunkLimit?: number;
		};
		discord?: {
			enabled: boolean;
			token: string;
			dmPolicy: DiscordDmPolicy;
			groupPolicy: DiscordGroupPolicy;
			allowFrom?: string[];
			streaming: DiscordStreaming;
			status?: DiscordStatus;
			voice?: { enabled: boolean };
		};
	};
	gateway: {
		port: number;
		mode: GatewayMode;
		bind: GatewayBind;
		auth: {
			mode: GatewayAuthMode;
			token?: string;
		};
		tailscale: {
			mode: TailscaleMode;
			resetOnExit: boolean;
		};
	};
	skills: {
		install: {
			preferBrew: boolean;
			nodeManager: 'bun' | 'npm' | 'yarn' | 'pnpm';
		};
	};
}

export function generateConfig(state: ConfigFormState, modelAliases?: Record<string, string>): string {
	const profiles: Record<string, AuthProfile> = {};
	const needsCodex = state.auth.selectedFamilies.includes('OpenAI');
	const needsOpenRouter = state.auth.selectedFamilies.some((f) => f !== 'OpenAI');
	if (needsCodex) {
		profiles['openai-codex:default'] = { provider: 'openai-codex', mode: 'oauth' };
	}
	if (needsOpenRouter) {
		profiles['openrouter:default'] = { provider: 'openrouter', mode: 'api_key' };
	}

	// Build models map from selected fallbacks + primary
	const allModelIds = [state.agent.primaryModel, ...state.agent.fallbacks].filter(Boolean);
	const uniqueIds = [...new Set(allModelIds)];
	const modelsMap: Record<string, ModelEntry> = {};
	for (const id of uniqueIds) {
		const alias = modelAliases?.[id] ?? id.split('/').pop()?.replace(/[.:]/g, '').slice(0, 12) ?? id;
		modelsMap[id] = { alias };
	}

	const config: OpenClawConfig = {
		update: {
			channel: state.update.channel,
			checkOnStart: state.update.checkOnStart,
			auto: { enabled: state.update.autoUpdate }
		},
		auth: { profiles },
		logging: { redactSensitive: state.logging.redactSensitive },
		models: { mode: 'merge', providers: {} },
		agents: {
			defaults: {
				model: {
					primary: state.agent.primaryModel,
					fallbacks: state.agent.fallbacks.filter(Boolean)
				},
				models: modelsMap,
				workspace: state.agent.workspace,
				memorySearch: {
					sources: state.memory.sources,
					...(state.memory.sessionMemory ? { experimental: { sessionMemory: true } } : {}),
					provider: state.memory.provider,
					model: state.memory.model
				},
				contextPruning: {
					mode: state.context.pruningMode,
					ttl: state.context.ttl,
					keepLastAssistants: state.context.keepLastAssistants
				},
				compaction: {
					mode: state.compaction.mode,
					memoryFlush: {
						enabled: state.compaction.memoryFlushEnabled,
						softThresholdTokens: state.compaction.softThresholdTokens
					}
				},
				heartbeat: { model: state.agent.heartbeatModel || state.agent.fallbacks[0] || state.agent.primaryModel },
				maxConcurrent: state.agent.maxConcurrent,
				subagents: { maxConcurrent: state.agent.subagentsMaxConcurrent }
			},
			list: [{ id: 'main', default: true }]
		},
		channels: {},
		gateway: {
			port: state.gateway.port,
			mode: state.gateway.mode,
			bind: state.gateway.bind,
			auth: {
				mode: state.gateway.authMode,
				...(state.gateway.authMode === 'token' && state.gateway.token
					? { token: state.gateway.token }
					: {})
			},
			tailscale: {
				mode: state.gateway.tailscaleMode,
				resetOnExit: false
			}
		},
		skills: {
			install: {
				preferBrew: state.skills.preferBrew,
				nodeManager: state.skills.nodeManager
			}
		}
	};

	if (state.telegram.enabled) {
		const tg: NonNullable<typeof config.channels.telegram> = {
			enabled: true,
			botToken: state.telegram.botToken || '<YOUR_BOT_TOKEN>',
			dmPolicy: state.telegram.dmPolicy,
			groupPolicy: state.telegram.groupPolicy,
			streaming: state.telegram.streaming,
			reactionLevel: state.telegram.reactionLevel,
			textChunkLimit: state.telegram.textChunkLimit
		};
		const tgAllowFrom = state.telegram.allowFrom.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
		if (tgAllowFrom.length) tg.allowFrom = tgAllowFrom;
		config.channels.telegram = tg;
	}

	if (state.discord.enabled) {
		const dc: NonNullable<typeof config.channels.discord> = {
			enabled: true,
			token: state.discord.token || '<YOUR_BOT_TOKEN>',
			dmPolicy: state.discord.dmPolicy,
			groupPolicy: state.discord.groupPolicy,
			streaming: state.discord.streaming
		};
		if (state.discord.status) dc.status = state.discord.status as DiscordStatus;
		if (state.discord.voiceEnabled) dc.voice = { enabled: true };
		const dcAllowFrom = state.discord.allowFrom.split(',').map(s => s.trim()).filter(Boolean);
		if (dcAllowFrom.length) dc.allowFrom = dcAllowFrom;
		config.channels.discord = dc;
	}

	return JSON.stringify(config, null, 2);
}

// Form state shape (not the output shape)
export interface ConfigFormState {
	update: {
		channel: UpdateChannel;
		checkOnStart: boolean;
		autoUpdate: boolean;
	};
	auth: {
		selectedFamilies: ModelFamily[];
	};
	logging: {
		redactSensitive: LoggingRedact;
	};
	agent: {
		primaryModel: string;
		fallbacks: string[];
		workspace: string;
		heartbeatModel: string;
		maxConcurrent: number;
		subagentsMaxConcurrent: number;
	};
	memory: {
		sources: MemorySearchSource[];
		sessionMemory: boolean;
		provider: string;
		model: string;
	};
	context: {
		pruningMode: ContextPruningMode;
		ttl: string;
		keepLastAssistants: number;
	};
	compaction: {
		mode: CompactionMode;
		memoryFlushEnabled: boolean;
		softThresholdTokens: number;
	};
	telegram: {
		enabled: boolean;
		botToken: string;
		dmPolicy: TelegramDmPolicy;
		allowFrom: string; // comma-separated user IDs
		groupPolicy: TelegramGroupPolicy;
		streaming: TelegramStreaming;
		reactionLevel: TelegramReactionLevel;
		textChunkLimit: number;
	};
	discord: {
		enabled: boolean;
		token: string;
		dmPolicy: DiscordDmPolicy;
		groupPolicy: DiscordGroupPolicy;
		allowFrom: string; // comma-separated user/role IDs
		streaming: DiscordStreaming;
		status: DiscordStatus | '';
		voiceEnabled: boolean;
	};
	gateway: {
		port: number;
		mode: GatewayMode;
		bind: GatewayBind;
		authMode: GatewayAuthMode;
		token: string;
		tailscaleMode: TailscaleMode;
	};
	skills: {
		preferBrew: boolean;
		nodeManager: 'bun' | 'npm' | 'yarn' | 'pnpm';
	};
}

export function defaultFormState(): ConfigFormState {
	return {
		update: { channel: 'stable', checkOnStart: true, autoUpdate: false },
		auth: { selectedFamilies: [] as ModelFamily[] },
		logging: { redactSensitive: 'tools' },
		agent: {
			primaryModel: 'openai-codex/gpt-5.3-codex',
			fallbacks: [
				'openai-codex/gpt-5-mini',
				'openrouter/anthropic/claude-sonnet-4-5',
				'openrouter/google/gemini-flash-1.5',
				'openrouter/openai/gpt-4o-mini'
			],
			workspace: '~/.openclaw/workspace',
			heartbeatModel: 'openrouter/google/gemini-flash-1.5',
			maxConcurrent: 4,
			subagentsMaxConcurrent: 8
		},
		memory: {
			sources: ['memory', 'sessions'],
			sessionMemory: true,
			provider: 'openai',
			model: 'text-embedding-3-small'
		},
		context: { pruningMode: 'cache-ttl', ttl: '6h', keepLastAssistants: 3 },
		compaction: { mode: 'default', memoryFlushEnabled: true, softThresholdTokens: 40000 },
		telegram: {
			enabled: false,
			botToken: '',
			dmPolicy: 'pairing',
			allowFrom: '',
			groupPolicy: 'allowlist',
			streaming: 'off',
			reactionLevel: 'minimal',
			textChunkLimit: 4000
		},
		discord: {
			enabled: false,
			token: '',
			dmPolicy: 'pairing',
			groupPolicy: 'allowlist',
			allowFrom: '',
			streaming: 'off',
			status: '',
			voiceEnabled: false
		},
		gateway: {
			port: 18789,
			mode: 'local',
			bind: 'loopback',
			authMode: 'token',
			token: '',
			tailscaleMode: 'off'
		},
		skills: { preferBrew: true, nodeManager: 'bun' }
	};
}
