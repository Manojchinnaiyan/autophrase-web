-- Per-license device tracking. The extension registers a stable fingerprint
-- the first time it activates, and we update last_seen_at on every license
-- check. Each plan has a device cap (enforced in code, not SQL) so abusers
-- can't share one key across hundreds of installs.
--
-- The unique (user_id, fingerprint) constraint means re-activating on the
-- same device just touches last_seen_at instead of inflating the count.

CREATE TABLE IF NOT EXISTS devices (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fingerprint   TEXT NOT NULL,
  name          TEXT NOT NULL,
  created_at    INTEGER NOT NULL,
  last_seen_at  INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_devices_user_fp ON devices(user_id, fingerprint);
CREATE INDEX IF NOT EXISTS idx_devices_user ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices(last_seen_at);
