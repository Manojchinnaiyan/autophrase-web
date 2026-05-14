-- D1 initial schema for Autophrase web.
-- Auth, subscription state, and trial usage. NO API keys stored server-side —
-- users BYOK and the keys live only in their browser localStorage.

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    INTEGER NOT NULL,
  -- Trial starts at signup. Subscription overrides trial when active.
  trial_ends_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS subscriptions (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status          TEXT NOT NULL,
  plan            TEXT NOT NULL,
  -- Razorpay identifiers — null until checkout completes.
  rzp_order_id    TEXT,
  rzp_payment_id  TEXT,
  rzp_subscription_id TEXT,
  current_period_end  INTEGER,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Per-user request counter for the trial gate. We count requests, not tokens,
-- because users BYOK so we never see token usage.
CREATE TABLE IF NOT EXISTS trial_usage (
  user_id         TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  request_count   INTEGER NOT NULL DEFAULT 0,
  last_request_at INTEGER
);
