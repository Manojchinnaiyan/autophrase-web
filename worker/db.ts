import type { DeviceRow, DeviceSummary, Env, SessionRow, SubscriptionRow, UserRow } from './types';

export const SESSION_COOKIE = 'ap_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function getUserByEmail(db: D1Database, email: string): Promise<UserRow | null> {
  return db
    .prepare('SELECT * FROM users WHERE email = ?')
    .bind(email.toLowerCase())
    .first<UserRow>();
}

export async function getUserById(db: D1Database, id: string): Promise<UserRow | null> {
  return db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<UserRow>();
}

export async function insertUser(
  db: D1Database,
  row: {
    id: string;
    email: string;
    password_hash: string;
    trial_ends_at: number;
    license_key: string;
  },
): Promise<void> {
  const now = Date.now();
  await db
    .prepare(
      'INSERT INTO users (id, email, password_hash, created_at, trial_ends_at, license_key) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(
      row.id,
      row.email.toLowerCase(),
      row.password_hash,
      now,
      row.trial_ends_at,
      row.license_key,
    )
    .run();
  await db
    .prepare('INSERT INTO trial_usage (user_id, request_count) VALUES (?, 0)')
    .bind(row.id)
    .run();
}

export async function getUserByLicenseKey(
  db: D1Database,
  key: string,
): Promise<UserRow | null> {
  return db.prepare('SELECT * FROM users WHERE license_key = ?').bind(key).first<UserRow>();
}

/** Lazily fill in a license key for users created before the migration. */
export async function ensureLicenseKey(
  db: D1Database,
  user: UserRow,
  generate: () => string,
): Promise<string> {
  if (user.license_key) return user.license_key;
  const key = generate();
  await db.prepare('UPDATE users SET license_key = ? WHERE id = ?').bind(key, user.id).run();
  user.license_key = key;
  return key;
}

export async function createSession(db: D1Database, userId: string, token: string): Promise<void> {
  const now = Date.now();
  await db
    .prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .bind(token, userId, now, now + SESSION_TTL_MS)
    .run();
}

export async function getSession(db: D1Database, token: string): Promise<SessionRow | null> {
  const row = await db
    .prepare('SELECT * FROM sessions WHERE token = ?')
    .bind(token)
    .first<SessionRow>();
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    await deleteSession(db, token);
    return null;
  }
  return row;
}

export async function deleteSession(db: D1Database, token: string): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
}

export async function getActiveSubscription(
  db: D1Database,
  userId: string,
): Promise<SubscriptionRow | null> {
  return db
    .prepare(
      "SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1",
    )
    .bind(userId)
    .first<SubscriptionRow>();
}

export async function getLatestSubscription(
  db: D1Database,
  userId: string,
): Promise<SubscriptionRow | null> {
  return db
    .prepare('SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1')
    .bind(userId)
    .first<SubscriptionRow>();
}

export async function createSubscription(
  db: D1Database,
  row: { id: string; user_id: string; plan: string; rzp_order_id: string },
): Promise<void> {
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO subscriptions (id, user_id, status, plan, rzp_order_id, created_at, updated_at)
       VALUES (?, ?, 'pending', ?, ?, ?, ?)`,
    )
    .bind(row.id, row.user_id, row.plan, row.rzp_order_id, now, now)
    .run();
}

export async function activateSubscription(
  db: D1Database,
  id: string,
  rzpPaymentId: string,
  periodEnd: number,
): Promise<void> {
  await db
    .prepare(
      `UPDATE subscriptions
       SET status='active', rzp_payment_id=?, current_period_end=?, updated_at=?
       WHERE id=?`,
    )
    .bind(rzpPaymentId, periodEnd, Date.now(), id)
    .run();
}

export async function incrementRequestCount(db: D1Database, userId: string): Promise<number> {
  const now = Date.now();
  await db
    .prepare(
      `UPDATE trial_usage
       SET request_count = request_count + 1, last_request_at = ?
       WHERE user_id = ?`,
    )
    .bind(now, userId)
    .run();
  const row = await db
    .prepare('SELECT request_count FROM trial_usage WHERE user_id = ?')
    .bind(userId)
    .first<{ request_count: number }>();
  return row?.request_count ?? 0;
}

export async function getRequestCount(db: D1Database, userId: string): Promise<number> {
  const row = await db
    .prepare('SELECT request_count FROM trial_usage WHERE user_id = ?')
    .bind(userId)
    .first<{ request_count: number }>();
  return row?.request_count ?? 0;
}

export function trialEndFromNow(trialDays: number): number {
  return Date.now() + trialDays * 24 * 60 * 60 * 1000;
}

export function sessionMaxAgeSeconds(): number {
  return Math.floor(SESSION_TTL_MS / 1000);
}

export function sessionExpiresAt(): number {
  return Date.now() + SESSION_TTL_MS;
}

// ──────────────────────────────────────────────────────────────────────────
// Devices
// ──────────────────────────────────────────────────────────────────────────

function toDeviceSummary(row: DeviceRow): DeviceSummary {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    lastSeenAt: row.last_seen_at,
  };
}

export async function listDevicesForUser(
  db: D1Database,
  userId: string,
): Promise<DeviceSummary[]> {
  const res = await db
    .prepare('SELECT * FROM devices WHERE user_id = ? ORDER BY last_seen_at DESC')
    .bind(userId)
    .all<DeviceRow>();
  return (res.results ?? []).map(toDeviceSummary);
}

export async function getDeviceByFingerprint(
  db: D1Database,
  userId: string,
  fingerprint: string,
): Promise<DeviceRow | null> {
  return db
    .prepare('SELECT * FROM devices WHERE user_id = ? AND fingerprint = ?')
    .bind(userId, fingerprint)
    .first<DeviceRow>();
}

/**
 * Records that the given user just used the given device (extension install).
 * Touches last_seen_at when the row already exists; otherwise inserts a new
 * row if and only if the per-plan device limit hasn't been reached.
 *
 * Returns the resulting device summary on success, or `null` when the user
 * is at their device cap — the caller should surface that to the client so
 * the user can revoke an old device.
 */
export async function upsertDeviceWithLimit(
  db: D1Database,
  userId: string,
  fingerprint: string,
  name: string,
  newId: () => string,
  limit: number,
): Promise<{ device: DeviceSummary; created: boolean } | { atLimit: true }> {
  const existing = await getDeviceByFingerprint(db, userId, fingerprint);
  const now = Date.now();
  if (existing) {
    await db
      .prepare('UPDATE devices SET last_seen_at = ?, name = ? WHERE id = ?')
      .bind(now, name, existing.id)
      .run();
    return {
      device: toDeviceSummary({ ...existing, last_seen_at: now, name }),
      created: false,
    };
  }

  const countRow = await db
    .prepare('SELECT COUNT(*) AS n FROM devices WHERE user_id = ?')
    .bind(userId)
    .first<{ n: number }>();
  if ((countRow?.n ?? 0) >= limit) return { atLimit: true };

  const id = newId();
  await db
    .prepare(
      'INSERT INTO devices (id, user_id, fingerprint, name, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(id, userId, fingerprint, name, now, now)
    .run();
  return {
    device: toDeviceSummary({
      id,
      user_id: userId,
      fingerprint,
      name,
      created_at: now,
      last_seen_at: now,
    }),
    created: true,
  };
}

export async function deleteDevice(db: D1Database, userId: string, id: string): Promise<boolean> {
  const res = await db
    .prepare('DELETE FROM devices WHERE id = ? AND user_id = ?')
    .bind(id, userId)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function deleteDeviceByFingerprint(
  db: D1Database,
  userId: string,
  fingerprint: string,
): Promise<void> {
  await db
    .prepare('DELETE FROM devices WHERE user_id = ? AND fingerprint = ?')
    .bind(userId, fingerprint)
    .run();
}

export function _envCheck(_: Env) {
  // tree-shake guard so unused Env import doesn't error
}
