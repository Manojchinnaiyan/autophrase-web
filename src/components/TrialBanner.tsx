import { Link } from 'react-router-dom';
import { Sparkles, AlertTriangle } from 'lucide-react';
import type { AccountStatus } from '@/lib/types';

function daysLeft(ts: number): number {
  return Math.max(0, Math.ceil((ts - Date.now()) / 86_400_000));
}

type TrialBannerProps = Readonly<{ status: AccountStatus }>;

export function TrialBanner({ status }: TrialBannerProps) {
  if (status.plan === 'pro') return null;
  if (status.plan === 'expired') {
    return (
      <div className="mx-auto mb-4 flex max-w-3xl flex-col items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:flex-row sm:items-center dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="font-medium">Trial expired</div>
          <div className="mt-0.5 text-xs">Upgrade to keep using Autophrase.</div>
        </div>
        <Link to="/pricing" className="btn-primary h-8 w-full text-xs sm:w-auto">
          Upgrade
        </Link>
      </div>
    );
  }
  const left = daysLeft(status.trialEndsAt);
  return (
    <div className="mx-auto mb-4 flex max-w-3xl flex-col items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
      <Sparkles size={14} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="font-medium">
          Free trial · {left} {left === 1 ? 'day' : 'days'} left
        </div>
        <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          You've used {status.requestCount} {status.requestCount === 1 ? 'request' : 'requests'} so far.
        </div>
      </div>
      <Link to="/pricing" className="btn-secondary h-8 w-full text-xs sm:w-auto">
        Upgrade
      </Link>
    </div>
  );
}
