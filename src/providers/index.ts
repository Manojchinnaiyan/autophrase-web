import { anthropicProvider } from './anthropic';
import { openaiProvider } from './openai';
import { googleProvider } from './google';
import { AIProvider, ProviderId } from './types';

export const PROVIDERS: Record<ProviderId, AIProvider> = {
  anthropic: anthropicProvider,
  openai: openaiProvider,
  google: googleProvider,
};

export const PROVIDER_LIST: AIProvider[] = Object.values(PROVIDERS);

export function getProvider(id: ProviderId): AIProvider {
  return PROVIDERS[id];
}

export * from './types';
