export type ProviderId = 'anthropic' | 'openai' | 'google';

export interface ModelInfo {
  id: string;
  label: string;
  contextWindow?: number;
}

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface CompletionRequest {
  messages: ChatMessage[];
  model: string;
  maxTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}

export interface CompletionChunk {
  delta: string;
  done: boolean;
}

export interface ProviderConfig {
  apiKey?: string;
}

export interface AIProvider {
  readonly id: ProviderId;
  readonly name: string;
  readonly needsApiKey: boolean;
  readonly apiKeyUrl?: string;
  isAvailable(config: ProviderConfig): Promise<boolean>;
  listModels(): ModelInfo[];
  stream(req: CompletionRequest, config: ProviderConfig): AsyncIterable<CompletionChunk>;
}

export class ProviderError extends Error {
  constructor(public readonly providerId: ProviderId, message: string, public readonly status?: number) {
    super(`[${providerId}] ${message}`);
    this.name = 'ProviderError';
  }
}
