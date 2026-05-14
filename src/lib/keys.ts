/**
 * BYOK key storage. Keys live in localStorage only — never sent to our server.
 * The web app calls the provider APIs directly from the browser using these.
 *
 * If multi-device sync becomes a need we can later add an opt-in
 * "sync across devices" feature that stores encrypted keys server-side, but
 * the default stays local-only to minimise our custody surface.
 */
import type { ProviderId } from '@/providers/types';

const KEYS_LS = 'autophrase.byok.v1';
const ACTIVE_LS = 'autophrase.active_provider.v1';
const MODEL_LS = 'autophrase.active_model.v1';

type KeyMap = Partial<Record<ProviderId, string>>;

function load(): KeyMap {
  try {
    const raw = localStorage.getItem(KEYS_LS);
    return raw ? (JSON.parse(raw) as KeyMap) : {};
  } catch {
    return {};
  }
}

function save(map: KeyMap) {
  localStorage.setItem(KEYS_LS, JSON.stringify(map));
}

export function getKey(provider: ProviderId): string | undefined {
  return load()[provider];
}

export function setKey(provider: ProviderId, key: string) {
  const map = load();
  if (key) map[provider] = key;
  else delete map[provider];
  save(map);
}

export function getAllKeys(): KeyMap {
  return load();
}

export function getActiveProvider(): ProviderId {
  const v = localStorage.getItem(ACTIVE_LS);
  if (v === 'anthropic' || v === 'openai' || v === 'google') return v;
  return 'anthropic';
}

export function setActiveProvider(p: ProviderId) {
  localStorage.setItem(ACTIVE_LS, p);
}

export function getActiveModel(): string | null {
  return localStorage.getItem(MODEL_LS);
}

export function setActiveModel(m: string) {
  localStorage.setItem(MODEL_LS, m);
}
