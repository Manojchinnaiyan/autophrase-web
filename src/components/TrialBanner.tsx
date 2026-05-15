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
    <div className="mx-auto mb-4 flex max-w-3xl flex-col items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 sm:flex-row sm:items-center dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
      <Sparkles size={14} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="font-medium">
          Free trial · {left} {left === 1 ? 'day' : 'days'} left
        </div>
        <div className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
          Upgrade to Pro before your trial ends.
        </div>
      </div>
      <Link to="/pricing" className="btn-secondary h-8 w-full text-xs sm:w-auto">
        Upgrade
      </Link>
    </div>
  );
}
