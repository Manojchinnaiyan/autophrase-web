export function friendlyError(provider: string, status: number, body: string): string {
  if (status === 401 || status === 403) {
    return `Your ${provider} API key is invalid or doesn't have permission. Open Settings → ${provider} and update it.`;
  }
  if (status === 429) {
    return `Rate limited by ${provider}. Wait a moment and try again, or switch to a different provider.`;
  }
  if (status === 402) {
    return `${provider} returned "payment required" — your account may be out of credits.`;
  }
  if (status === 404) {
    return `${provider} couldn't find that model. Try selecting a different model in Settings.`;
  }
  if (status >= 500 && status < 600) {
    return `${provider} is having issues right now (server error). Try again in a moment.`;
  }
  try {
    const parsed = JSON.parse(body);
    const msg = parsed?.error?.message ?? parsed?.message ?? parsed?.error;
    if (typeof msg === 'string' && msg.length < 240) return `${provider}: ${msg}`;
  } catch {
    /* not JSON */
  }
  return `${provider} error (${status}): ${body.slice(0, 200)}`;
}
