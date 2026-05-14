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
  { id: 'gpt-4o', label: 'GPT-4o' },
  { id: 'gpt-4o-mini', label: 'GPT-4o mini' },
  { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { id: 'o1-mini', label: 'o1 mini' },
];

export const openaiProvider: AIProvider = {
  id: 'openai',
  name: 'OpenAI',
  needsApiKey: true,
  apiKeyUrl: 'https://platform.openai.com/api-keys',

  async isAvailable(config) {
    return Boolean(config.apiKey);
  },

  listModels() {
    return MODELS;
  },

  async *stream(req: CompletionRequest, config: ProviderConfig): AsyncIterable<CompletionChunk> {
    if (!config.apiKey) throw new ProviderError('openai', 'API key missing');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: req.signal,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: req.model,
        messages: req.messages,
        max_tokens: req.maxTokens,
        temperature: req.temperature,
        stream: true,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new ProviderError('openai', friendlyError('OpenAI', res.status, text), res.status);
    }

    for await (const data of parseSSE(res)) {
      let evt: {
        choices?: Array<{ delta?: { content?: string }; finish_reason?: string }>;
        error?: { message?: string; code?: string };
      };
      try {
        evt = JSON.parse(data);
      } catch {
        continue;
      }
      if (evt.error) {
        throw new ProviderError('openai', evt.error.message ?? 'stream error');
      }
      const delta = evt.choices?.[0]?.delta?.content;
      if (typeof delta === 'string' && delta.length) {
        yield { delta, done: false };
      }
      if (evt.choices?.[0]?.finish_reason) {
        yield { delta: '', done: true };
        return;
      }
    }
    yield { delta: '', done: true };
  },
};
