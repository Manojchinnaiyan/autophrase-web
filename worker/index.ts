import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { cors } from 'hono/cors';
import type { Env, AccountStatus, LicenseStatus, UserRow } from './types';
import { DEVICE_LIMIT } from './types';
import { hashPassword, verifyPassword, newId, newLicenseKey, randomToken } from './crypto';
import {
  SESSION_COOKIE,
  activateSubscription,
  createSession,
  createSubscription,
  deleteDevice,
  deleteDeviceByFingerprint,
  deleteSession,
  ensureLicenseKey,
  getActiveSubscription,
  getLatestSubscription,
  getRequestCount,
  getSession,
  getUserByEmail,
  getUserById,
  getUserByLicenseKey,
  incrementRequestCount,
  insertUser,
  listDevicesForUser,
  sessionMaxAgeSeconds,
  trialEndFromNow,
  upsertDeviceWithLimit,
} from './db';

const app = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

// Same-origin in production (Worker serves the SPA from its assets binding),
// so CORS is only needed when the Vite dev server proxies to wrangler or the
// Chrome extension calls from a `chrome-extension://` origin. Explicit method
// + header allowlists guarantee the OPTIONS preflight succeeds for DELETE
// and the JSON Content-Type — defaults vary by Hono version.
app.use(
  '/api/*',
  cors({
    origin: (origin) => origin ?? '*',
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  }),
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { 'content-type': 'application/json' },
  });
}

function unauthorized() {
  return new Response(JSON.stringify({ error: 'unauthorized' }), {
    status: 401,
    headers: { 'content-type': 'application/json' },
  });
}

async function requireUser(c: any, env: Env): Promise<string | null> {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  const session = await getSession(env.DB, token);
  return session?.user_id ?? null;
}

/**
 * Read the JSON body, returning a partial of the expected shape. Tolerates
 * missing/malformed bodies (returns {}). All fields are optional on the
 * caller side so they can be validated individually. Avoids the `T | {}`
 * union that `.catch(() => ({}))` produces, which broke typed property
 * access.
 */
async function parseBody<T extends object>(c: { req: { json: () => Promise<unknown> } }): Promise<Partial<T>> {
  try {
    return (await c.req.json()) as Partial<T>;
  } catch {
    return {};
  }
}

/**
 * Single source of truth for "what plan is this user on right now?".
 * Used by both /api/me (cookie-authenticated) and /api/license/check
 * (license-key-authenticated, called from the extension).
 */
async function resolvePlan(
  db: D1Database,
  user: UserRow,
): Promise<{ plan: AccountStatus['plan']; subscriptionActive: boolean }> {
  const sub = await getActiveSubscription(db, user.id);
  const now = Date.now();
  const subscriptionActive = !!sub && (!sub.current_period_end || sub.current_period_end > now);
  const trialActive = user.trial_ends_at > now;
  let plan: AccountStatus['plan'] = 'expired';
  if (subscriptionActive) plan = 'pro';
  else if (trialActive) plan = 'trial';
  return { plan, subscriptionActive };
}

// ──────────────────────────────────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────────────────────────────────

app.post('/api/auth/signup', async (c) => {
  const body = await parseBody<{ email: string; password: string }>(c);
  const email = body.email?.trim().toLowerCase() ?? '';
  const password = body.password ?? '';
  if (!EMAIL_RE.test(email)) return badRequest('invalid email');
  if (password.length < 8) return badRequest('password must be 8+ characters');

  const existing = await getUserByEmail(c.env.DB, email);
  if (existing) return badRequest('email already registered');

  const id = newId();
  const password_hash = await hashPassword(password);
  const trialDays = Number.parseInt(c.env.TRIAL_DAYS ?? '7', 10);
  const trial_ends_at = trialEndFromNow(trialDays);
  const license_key = newLicenseKey();
  await insertUser(c.env.DB, { id, email, password_hash, trial_ends_at, license_key });

  const token = randomToken();
  await createSession(c.env.DB, id, token);
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: sessionMaxAgeSeconds(),
  });
  return c.json({ ok: true });
});

app.post('/api/auth/signin', async (c) => {
  const body = await parseBody<{ email: string; password: string }>(c);
  const email = body.email?.trim().toLowerCase() ?? '';
  const password = body.password ?? '';
  if (!email || !password) return badRequest('email and password required');

  const user = await getUserByEmail(c.env.DB, email);
  if (!user) return new Response(JSON.stringify({ error: 'invalid credentials' }), { status: 401 });
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return new Response(JSON.stringify({ error: 'invalid credentials' }), { status: 401 });

  const token = randomToken();
  await createSession(c.env.DB, user.id, token);
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: sessionMaxAgeSeconds(),
  });
  return c.json({ ok: true });
});

app.post('/api/auth/signout', async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) await deleteSession(c.env.DB, token);
  deleteCookie(c, SESSION_COOKIE, { path: '/' });
  return c.json({ ok: true });
});

// ──────────────────────────────────────────────────────────────────────────
// Account / trial state
// ──────────────────────────────────────────────────────────────────────────

app.get('/api/me', async (c) => {
  const userId = await requireUser(c, c.env);
  if (!userId) return unauthorized();
  const user = await getUserById(c.env.DB, userId);
  if (!user) return unauthorized();
  const { plan, subscriptionActive } = await resolvePlan(c.env.DB, user);
  const licenseKey = await ensureLicenseKey(c.env.DB, user, newLicenseKey);
  const status: AccountStatus = {
    user: { id: user.id, email: user.email },
    plan,
    trialEndsAt: user.trial_ends_at,
    subscriptionActive,
    requestCount: await getRequestCount(c.env.DB, userId),
    licenseKey,
  };
  return c.json(status);
});

/**
 * Extension-facing license check. The Chrome extension POSTs the user's
 * license key on every AI call (or hourly) to learn whether the trial is
 * still valid / whether they've upgraded to Pro.
 *
 * No cookie auth — the license key itself is the credential. CORS allows
 * `chrome-extension://*` origins because the extension's content script
 * calls this directly.
 */
app.post('/api/license/check', async (c) => {
  const body = await parseBody<{ key: string; fingerprint: string; name: string }>(c);
  const key = body.key?.trim();
  if (!key?.startsWith('ap_live_')) {
    return new Response(JSON.stringify({ error: 'invalid license key' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  const user = await getUserByLicenseKey(c.env.DB, key);
  if (!user) {
    return new Response(JSON.stringify({ error: 'license not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }
  const { plan } = await resolvePlan(c.env.DB, user);
  const deviceLimit = DEVICE_LIMIT[plan];
  const fingerprint = body.fingerprint?.trim();
  const deviceName = (body.name?.trim() || 'Unknown device').slice(0, 120);

  // Device registration / refresh. The extension always sends a fingerprint
  // once it has one; older builds may omit it (graceful fallback below).
  if (fingerprint && plan !== 'expired') {
    const result = await upsertDeviceWithLimit(
      c.env.DB,
      user.id,
      fingerprint,
      deviceName,
      newId,
      deviceLimit,
    );
    if ('atLimit' in result) {
      const devices = await listDevicesForUser(c.env.DB, user.id);
      return new Response(
        JSON.stringify({
          error: 'device limit reached',
          plan,
          email: user.email,
          devices,
          deviceLimit,
        }),
        { status: 409, headers: { 'content-type': 'application/json' } },
      );
    }
  }

  const devices = await listDevicesForUser(c.env.DB, user.id);
  const status: LicenseStatus = {
    plan,
    trialEndsAt: user.trial_ends_at,
    email: user.email,
    devices,
    deviceLimit,
  };
  return c.json(status);
});

/**
 * Forgets a device. Called by the extension when the user clicks "Deactivate"
 * so the slot doesn't keep blocking the device cap.
 *
 * Authenticates via the license key itself rather than a session cookie so
 * the extension can call it without the user being signed into the website.
 */
app.post('/api/license/forget-device', async (c) => {
  const body = await parseBody<{ key: string; fingerprint: string }>(c);
  const key = body.key?.trim();
  const fingerprint = body.fingerprint?.trim();
  if (!key || !fingerprint) return badRequest('key and fingerprint required');
  const user = await getUserByLicenseKey(c.env.DB, key);
  if (!user) return c.json({ ok: true }); // silent: don't leak validity
  await deleteDeviceByFingerprint(c.env.DB, user.id, fingerprint);
  return c.json({ ok: true });
});

// Web dashboard endpoints — cookie-authenticated.
app.get('/api/devices', async (c) => {
  const userId = await requireUser(c, c.env);
  if (!userId) return unauthorized();
  const devices = await listDevicesForUser(c.env.DB, userId);
  const user = await getUserById(c.env.DB, userId);
  const plan = user ? (await resolvePlan(c.env.DB, user)).plan : 'expired';
  return c.json({ devices, deviceLimit: DEVICE_LIMIT[plan] });
});

app.delete('/api/devices/:id', async (c) => {
  const userId = await requireUser(c, c.env);
  if (!userId) return unauthorized();
  const id = c.req.param('id');
  const ok = await deleteDevice(c.env.DB, userId, id);
  if (!ok) return new Response(JSON.stringify({ error: 'device not found' }), { status: 404 });
  return c.json({ ok: true });
});

/**
 * Lightweight gate the client calls before each AI request. Returns 402 once
 * trial expires AND there's no active subscription. We don't proxy AI calls —
 * users BYOK and call providers directly from the browser — but this counter
 * lets us enforce a fair-use trial limit.
 */
app.post('/api/usage/record', async (c) => {
  const userId = await requireUser(c, c.env);
  if (!userId) return unauthorized();
  const user = await getUserById(c.env.DB, userId);
  if (!user) return unauthorized();
  const sub = await getActiveSubscription(c.env.DB, userId);
  const now = Date.now();
  const subscriptionActive = !!sub && (!sub.current_period_end || sub.current_period_end > now);
  if (!subscriptionActive && user.trial_ends_at < now) {
    return new Response(
      JSON.stringify({ error: 'trial expired', plan: 'expired' }),
      { status: 402, headers: { 'content-type': 'application/json' } },
    );
  }
  const count = await incrementRequestCount(c.env.DB, userId);
  return c.json({ ok: true, count });
});

// ──────────────────────────────────────────────────────────────────────────
// Razorpay — order creation + verification.
// Stubbed when keys are missing so the rest of the flow is testable.
// Wire real Razorpay later by populating RAZORPAY_KEY_ID/SECRET via
// `wrangler secret put`.
// ──────────────────────────────────────────────────────────────────────────

// One-time-payment plan only; "Premium" is a coming-soon tier surfaced in
// the UI but not yet purchasable. `periodDays: 36500` (~100 years) is the
// idiomatic way to represent "lifetime" without inventing a special flag.
const PLANS: Record<string, { amountPaise: number; currency: string; label: string; periodDays: number }> = {
  pro_lifetime: { amountPaise: 50000, currency: 'INR', label: 'Pro · lifetime', periodDays: 36500 },
};

app.post('/api/billing/create-order', async (c) => {
  const userId = await requireUser(c, c.env);
  if (!userId) return unauthorized();
  const body = await parseBody<{ plan: string }>(c);
  const planId = body.plan ?? 'pro_lifetime';
  const plan = PLANS[planId];
  if (!plan) return badRequest('unknown plan');

  let rzpOrderId: string;
  if (c.env.RAZORPAY_KEY_ID && c.env.RAZORPAY_KEY_SECRET) {
    const auth = btoa(`${c.env.RAZORPAY_KEY_ID}:${c.env.RAZORPAY_KEY_SECRET}`);
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Basic ${auth}` },
      body: JSON.stringify({
        amount: plan.amountPaise,
        currency: plan.currency,
        receipt: `sub_${userId.slice(0, 8)}_${Date.now()}`,
        notes: { userId, plan: planId },
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      return new Response(
        JSON.stringify({ error: `razorpay: ${text}` }),
        { status: 502, headers: { 'content-type': 'application/json' } },
      );
    }
    const order = await res.json<{ id: string }>();
    rzpOrderId = order.id;
  } else {
    // Local/dev fallback so the UI can be exercised without keys.
    rzpOrderId = `stub_order_${randomToken(8)}`;
  }

  const subId = newId();
  await createSubscription(c.env.DB, {
    id: subId,
    user_id: userId,
    plan: planId,
    rzp_order_id: rzpOrderId,
  });

  return c.json({
    orderId: rzpOrderId,
    subscriptionId: subId,
    keyId: c.env.RAZORPAY_KEY_ID ?? 'rzp_test_stub',
    amount: plan.amountPaise,
    currency: plan.currency,
    label: plan.label,
    stub: !c.env.RAZORPAY_KEY_ID,
  });
});

/**
 * Razorpay sends `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`
 * to the client on successful checkout. We re-derive the HMAC server-side and
 * only mark the subscription active if it matches.
 */
app.post('/api/billing/verify', async (c) => {
  const userId = await requireUser(c, c.env);
  if (!userId) return unauthorized();
  const body = await parseBody<{
    subscriptionId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }>(c);

  if (!body.subscriptionId || !body.razorpay_order_id || !body.razorpay_payment_id) {
    return badRequest('missing payment fields');
  }

  const sub = await getLatestSubscription(c.env.DB, userId);
  // Two-line guard rather than `sub?.id !==` so TS narrows `sub` to non-null
  // below — the optional-chain shorthand defeats the narrowing.
  if (!sub || sub.id !== body.subscriptionId) return badRequest('subscription not found');
  if (sub.rzp_order_id !== body.razorpay_order_id) return badRequest('order mismatch');

  if (c.env.RAZORPAY_KEY_SECRET && body.razorpay_signature) {
    const payload = `${body.razorpay_order_id}|${body.razorpay_payment_id}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(c.env.RAZORPAY_KEY_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const hex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    if (hex !== body.razorpay_signature) return badRequest('invalid signature');
  }
  // In stub mode (no secret) we trust the call — fine for local dev only.

  const planConfig = PLANS[sub.plan] ?? PLANS.pro_lifetime;
  const periodEnd = Date.now() + planConfig.periodDays * 24 * 60 * 60 * 1000;
  await activateSubscription(c.env.DB, sub.id, body.razorpay_payment_id, periodEnd);

  return c.json({ ok: true, currentPeriodEnd: periodEnd });
});

app.get('/api/billing/plans', (c) =>
  c.json(
    Object.entries(PLANS).map(([id, p]) => ({
      id,
      label: p.label,
      amountPaise: p.amountPaise,
      currency: p.currency,
      periodDays: p.periodDays,
    })),
  ),
);

// ──────────────────────────────────────────────────────────────────────────
// SPA fallback — everything not matched by an /api route falls through to
// the static assets binding, which serves index.html for unknown paths
// (single-page-application mode in wrangler.toml).
// ──────────────────────────────────────────────────────────────────────────
app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
