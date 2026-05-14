import { useEffect, useState } from 'react';
import { Laptop, Trash2, Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { DeviceSummary } from '@/lib/types';

/**
 * Active devices panel on the dashboard. Each row shows a device + last-seen
 * and lets the user revoke (frees a slot for re-activation elsewhere).
 *
 * The extension calls /api/license/check on every AI request with a stable
 * fingerprint, so this list is always current to ~6h (the cache window).
 */

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)}h ago`;
  return `${Math.round(diff / 86_400_000)}d ago`;
}

export function DevicesPanel() {
  const [devices, setDevices] = useState<DeviceSummary[] | null>(null);
  const [limit, setLimit] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  async function load() {
    try {
      const res = await api.listDevices();
      setDevices(res.devices);
      setLimit(res.deviceLimit);
      setError(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load devices';
      setError(message);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function revoke(id: string) {
    setRevokingId(id);
    try {
      await api.revokeDevice(id);
      setDevices((cur) => cur?.filter((d) => d.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Revoke failed');
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <div className="card-interactive p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          <Laptop size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Active devices
          </div>
          <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {devices === null
              ? 'Loading…'
              : `${devices.length} of ${limit} slots used`}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {devices && devices.length === 0 && !error && (
        <div className="mt-4 rounded-md border border-dashed border-zinc-200 p-3 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          No devices yet. They'll appear here once you activate the extension.
        </div>
      )}

      {devices && devices.length > 0 && (
        <ul className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
          {devices.map((d) => (
            <li key={d.id} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-zinc-900 dark:text-zinc-100">{d.name}</div>
                <div className="mt-0.5 font-mono text-2xs text-zinc-500 dark:text-zinc-400">
                  Last active {formatRelative(d.lastSeenAt)}
                </div>
              </div>
              <button
                onClick={() => revoke(d.id)}
                disabled={revokingId === d.id}
                className="btn-ghost h-8 w-8 p-0 text-zinc-500 hover:text-red-600 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-red-400"
                title="Revoke this device"
                aria-label={`Revoke ${d.name}`}
              >
                {revokingId === d.id ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Trash2 size={13} />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 text-2xs text-zinc-400 dark:text-zinc-500">
        Revoking a device frees up a slot — you can re-activate the extension on a different
        machine right after.
      </div>
    </div>
  );
}
