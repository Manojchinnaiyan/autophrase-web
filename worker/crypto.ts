/**
 * Password hashing + session tokens for Cloudflare Workers.
 *
 * We use PBKDF2-SHA256 (built into Web Crypto / available on Workers) instead
 * of bcrypt because bcrypt requires Node-native bindings that don't run on
 * Workers. PBKDF2 with 100k iterations is OWASP-recommended for new apps and
 * is constant-time, salted, and slow enough to deter brute-force.
 *
 * Hash format: `pbkdf2$<iterations>$<base64-salt>$<base64-hash>`
 */

const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

function toB64(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  for (const b of arr) bin += String.fromCodePoint(b);
  return btoa(bin);
}

function fromB64(s: string): Uint8Array {
  const bin = atob(s);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.codePointAt(i) ?? 0;
  return arr;
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    HASH_BYTES * 8,
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await pbkdf2(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${toB64(salt)}$${toB64(hash)}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const parts = encoded.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = Number.parseInt(parts[1], 10);
  if (!Number.isFinite(iterations)) return false;
  const salt = fromB64(parts[2]);
  const expected = fromB64(parts[3]);
  const actual = new Uint8Array(await pbkdf2(password, salt, iterations));
  // Constant-time compare — avoid timing leaks.
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}

export function randomToken(byteLength = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  // The trailing-`=` strip stays as `.replace(/=+$/, '')` — it's an anchored
  // pattern that `replaceAll` can't express without a literal-string match.
  return toB64(bytes).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

export function newId(): string {
  return crypto.randomUUID();
}

/**
 * Generates a license key in the shape `ap_live_<32 lowercase hex>`.
 * Used by the Chrome extension to authenticate against the web account.
 * Format matches what the SQL migration's backfill produces, so dev and
 * prod keys are visually indistinguishable.
 */
export function newLicenseKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `ap_live_${hex}`;
}
