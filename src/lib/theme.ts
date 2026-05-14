const KEY = 'autophrase.theme.v1';

export type ThemePreference = 'light' | 'dark' | 'system';

export function getThemePref(): ThemePreference {
  const v = localStorage.getItem(KEY);
  return v === 'light' || v === 'dark' ? v : 'system';
}

export function setThemePref(pref: ThemePreference) {
  localStorage.setItem(KEY, pref);
  applyTheme(pref);
}

export function applyTheme(pref: ThemePreference = getThemePref()) {
  const isDark =
    pref === 'dark' ||
    (pref === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
}
