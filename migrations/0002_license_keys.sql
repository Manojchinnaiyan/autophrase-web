-- License keys link a web account to the Chrome extension running on the
-- user's machine. The extension POSTs the key to /api/license/check on every
-- AI call (or hourly) and gates on the returned plan.
--
-- Format: `ap_live_<32 lowercase hex chars>` = 40 chars total.
-- Stored lowercase, indexed for O(1) lookup, unique to prevent collisions.

ALTER TABLE users ADD COLUMN license_key TEXT;

-- Backfill: existing users get a key on the spot so the extension can hook up
-- immediately after this migration runs. New signups generate it server-side.
UPDATE users
SET license_key = 'ap_live_' || lower(hex(randomblob(16)))
WHERE license_key IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_license_key ON users(license_key);
