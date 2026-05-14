import {
  AIProvider,
  ChatMessage,
  CompletionChunk,
  CompletionRequest,
  ModelInfo,
  ProviderConfig,
  ProviderError,
} from './types';
import { friendlyError } from './errors';

const MODELS: ModelInfo[] = [
  { id: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
];

function toGoogleContents(messages: ChatMessage[]) {
  return messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
}

export const googleProvider: AIProvider = {
  id: 'google',
  name: 'Google',
  needsApiKey: true,
  apiKeyUrl: 'https://aistudio.google.com/app/apikey',

  async isAvailable(config) {
    return Boolean(config.apiKey);
  },

  listModels() {
    return MODELS;
  },

  async *stream(req: CompletionRequest, config: ProviderConfig): AsyncIterable<CompletionChunk> {
    if (!config.apiKey) throw new ProviderError('google', 'API key missing');

    const system = req.messages.find((m) => m.role === 'system')?.content;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      req.model,
    )}:streamGenerateContent?alt=sse&key=${encodeURIComponent(config.apiKey)}`;

    const res = await fetch(url, {
      method: 'POST',
      signal: req.signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: toGoogleContents(req.messages),
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        generationConfig: {
          maxOutputTokens: req.maxTokens,
          temperature: req.temperature,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new ProviderError('google', friendlyError('Google', res.status, text), res.status);
    }

    if (!res.body) throw new ProviderError('google', 'no response body');
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const event = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          for (const line of event.split('\n')) {
            if (!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (!data) continue;
            try {
              const evt = JSON.parse(data);
              const text = evt.candidates?.[0]?.content?.parts?.[0]?.text;
              if (typeof text === 'string' && text.length) {
                yield { delta: text, done: false };
              }
              if (evt.candidates?.[0]?.finishReason) {
                yield { delta: '', done: true };
                return;
              }
            } catch {
              // skip
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    yield { delta: '', done: true };
  },
};
