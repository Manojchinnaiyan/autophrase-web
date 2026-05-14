import { useAuth } from '@/lib/auth';
import { TrialBanner } from '@/components/TrialBanner';
import { Reveal } from '@/components/Reveal';
import { ExtensionPanel } from '@/components/ExtensionPanel';
import { DevicesPanel } from '@/components/DevicesPanel';

export function Dashboard() {
  const { status } = useAuth();
  if (!status) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <TrialBanner status={status} />

      <div className="mb-6 animate-fade-in-up">
        <div className="text-2xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Signed in as
        </div>
        <div className="mt-1 break-all text-base font-medium text-zinc-900 dark:text-zinc-100">
          {status.user.email}
        </div>
      </div>

      <Reveal>
        <ExtensionPanel licenseKey={status.licenseKey} />
      </Reveal>

      <div className="mt-4">
        <Reveal delay={120}>
          <DevicesPanel />
        </Reveal>
      </div>
    </div>
  );
}
