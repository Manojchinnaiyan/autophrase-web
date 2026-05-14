import {
  AIProvider,
  CompletionChunk,
  CompletionRequest,
  ModelInfo,
  ProviderConfig,
  ProviderError,
} from './types';
import { parseSSE } from './sse';
import { friendlyError } from './errors';

const MODELS: ModelInfo[] = [
  { id: 'claude-opus-4-7', label: 'Claude Opus 4.7', contextWindow: 1_000_000 },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', contextWindow: 1_000_000 },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5', contextWindow: 200_000 },
];

export const anthropicProvider: AIProvider = {
  id: 'anthropic',
  name: 'Anthropic',
  needsApiKey: true,
  apiKeyUrl: 'https://console.anthropic.com/settings/keys',

  async isAvailable(config) {
    return Boolean(config.apiKey);
  },

  listModels() {
    return MODELS;
  },

  async *stream(req: CompletionRequest, config: ProviderConfig): AsyncIterable<CompletionChunk> {
    if (!config.apiKey) throw new ProviderError('anthropic', 'API key missing');

    const system = req.messages.find((m) => m.role === 'system')?.content;
    const messages = req.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }));

    const systemBlocks = system
      ? [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }]
      : undefined;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: req.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: req.model,
        max_tokens: req.maxTokens ?? 4096,
        temperature: req.temperature,
        system: systemBlocks,
        messages,
        stream: true,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new ProviderError('anthropic', friendlyError('Anthropic', res.status, text), res.status);
    }

    for await (const data of parseSSE(res)) {
      let evt: {
        type?: string;
        delta?: { type?: string; text?: string };
        error?: { message?: string; type?: string };
      };
      try {
        evt = JSON.parse(data);
      } catch {
        continue;
      }
      if (evt.type === 'error' && evt.error) {
        throw new ProviderError('anthropic', evt.error.message ?? 'stream error');
      }
      if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
        yield { delta: evt.delta.text ?? '', done: false };
      } else if (evt.type === 'message_stop') {
        yield { delta: '', done: true };
        return;
      }
    }
    yield { delta: '', done: true };
  },
};
