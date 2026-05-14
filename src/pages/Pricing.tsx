import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Sparkles, Zap, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { openCheckout } from '@/lib/razorpay';
import { Reveal } from '@/components/Reveal';
import type { AccountStatus } from '@/lib/types';

interface Plan {
  id: string;
  label: string;
  amountPaise: number;
  currency: string;
  periodDays: number;
}

/**
 * Mirrors the server's PLANS map. Used as initial state so the Pricing page
 * renders correctly when the Worker isn't reachable (e.g. running `npm run dev`
 * alone, offline). When the network call succeeds these are replaced by the
 * authoritative server values; when it fails we keep the fallback and stay
 * silent — Pricing is a marketing page and shouldn't break on a backend miss.
 */
const FALLBACK_PLANS: Plan[] = [
  { id: 'pro_lifetime', label: 'Pro · lifetime', amountPaise: 50000, currency: 'INR', periodDays: 36500 },
];

const TRIAL_FEATURES = [
  '30 days of full access',
  'Bring your own Anthropic, OpenAI, or Google key',
  'Unlimited chat via Chrome Gemini Nano (no API key needed)',
  'Streaming responses',
  'Keys stored locally',
];

const PRO_FEATURES = [
  'Everything in Free trial',
  'Unlimited chats — forever',
  'One-time payment, no recurring fees',
  'Priority email support',
  'Early access to new features',
];

const PREMIUM_FEATURES = [
  'Everything in Pro',
  'Managed Claude integration (no API key required)',
  'Team workspaces & shared prompts',
  'SSO and audit logs',
  'Dedicated support',
];

function formatPrice(p: Plan): { major: string; cycle: string } {
  const major = p.amountPaise / 100;
  let cycle = 'one-time';
  if (p.periodDays < 3650 && p.periodDays >= 360) cycle = '/ year';
  else if (p.periodDays < 360 && p.periodDays >= 28) cycle = '/ month';
  const sym = p.currency === 'INR' ? '₹' : `${p.currency} `;
  return { major: `${sym}${major.toLocaleString('en-IN')}`, cycle };
}

function trialCardCta(status: AccountStatus | null) {
  if (!status) {
    return (
      <Link
        to="/signup"
        className="btn-secondary mt-6 h-11 w-full text-sm sm:h-10"
      >
        Start trial
      </Link>
    );
  }
  if (status.plan === 'trial') {
    return (
      <div className="mt-6 rounded-md bg-zinc-100 px-3 py-2.5 text-center text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        You're on the free trial
      </div>
    );
  }
  return (
    <div className="mt-6 rounded-md bg-zinc-100 px-3 py-2.5 text-center text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
      Trial ended
    </div>
  );
}

function planCtaLabel(status: AccountStatus | null, busy: boolean): string {
  if (status?.plan === 'pro') return 'You own Pro';
  if (busy) return 'Opening checkout…';
  if (status) return 'Buy lifetime · one-time';
  return 'Sign up & buy';
}

export function Pricing() {
  const { status, refresh } = useAuth();
  const nav = useNavigate();
  // Seed with the fallback so the page renders correctly when the Worker
  // isn't reachable — we still try to fetch the authoritative list, but
  // failures are silently swallowed (Pricing is marketing content).
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api
      .plans()
      .then((p) => {
        if (p.length) setPlans(p);
      })
      .catch(() => {
        // backend unreachable — keep the fallback plans, no UI noise
      });
  }, []);

  async function buy(planId: string) {
    if (!status) {
      nav('/signup');
      return;
    }
    setBusy(planId);
    setErr(null);
    try {
      const order = await api.createOrder(planId);
      const resp = await openCheckout({
        orderId: order.orderId,
        keyId: order.keyId,
        amount: order.amount,
        currency: order.currency,
        label: order.label,
        email: status.user.email,
        stub: order.stub,
      });
      if (!resp) {
        setBusy(null);
        return;
      }
      await api.verifyPayment({
        subscriptionId: order.subscriptionId,
        razorpay_order_id: resp.razorpay_order_id,
        razorpay_payment_id: resp.razorpay_payment_id,
        razorpay_signature: resp.razorpay_signature,
      });
      await refresh();
      nav('/app');
    } catch (e: any) {
      setErr(e?.message ?? 'checkout failed');
    } finally {
      setBusy(null);
    }
  }

  // Three cards: Free trial + Pro (lifetime) + Premium (coming soon).
  // Equal-width on lg, 2-col on sm with Premium spanning if needed.
  const proPlan = plans.find((p) => p.id === 'pro_lifetime') ?? plans[0];

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:pt-14 lg:pt-16">

      <div className="text-center animate-fade-in-up">
        <div className="pill mx-auto">
          <Sparkles size={11} />
          <span>Pricing</span>
        </div>
        <h1 className="mt-4 text-[28px] font-semibold leading-tight tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl dark:text-zinc-100">
          Simple pricing
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-zinc-500 sm:text-base dark:text-zinc-400">
          You pay for the tool. AI costs come from your own provider account.
        </p>
        <div className="mt-4 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{' '}30-day free trial · No credit card required
          </span>
        </div>
      </div>

      {err && (
        <div
          className="mx-auto mt-6 max-w-md rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-800 animate-fade-in-up dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          role="alert"
        >
          {err}
        </div>
      )}

      <div className="mt-8 grid items-stretch gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
        <Reveal delay={0} className="h-full">
          <PlanCard
            label="Free trial"
            price="₹0"
            cycle="/ 30 days"
            tone="neutral"
            highlight={false}
            features={TRIAL_FEATURES}
            cta={trialCardCta(status)}
          />
        </Reveal>

        {proPlan && (
          <Reveal delay={150} className="h-full">
            <PlanCard
              label="Pro"
              price={formatPrice(proPlan).major}
              cycle="one-time"
              tone="primary"
              highlight
              badge="Best value"
              features={PRO_FEATURES}
              cta={
                <button
                  onClick={() => buy(proPlan.id)}
                  disabled={busy === proPlan.id || status?.plan === 'pro'}
                  className="btn-cta mt-6 h-11 w-full text-sm sm:h-10"
                  type="button"
                >
                  {planCtaLabel(status, busy === proPlan.id)}
                  {busy !== proPlan.id && status?.plan !== 'pro' && <Zap size={13} />}
                </button>
              }
            />
          </Reveal>
        )}

        <Reveal delay={300} className="h-full">
          <PlanCard
            label="Premium"
            price="—"
            cycle=""
            tone="muted"
            highlight={false}
            badge="Coming soon"
            features={PREMIUM_FEATURES}
            cta={
              <button
                disabled
                className="btn-secondary mt-6 h-11 w-full cursor-not-allowed text-sm sm:h-10"
                type="button"
              >
                <Lock size={13} />
                Coming soon
              </button>
            }
          />
        </Reveal>
      </div>

      <div className="mx-auto mt-10 max-w-2xl text-center text-xs text-zinc-500 dark:text-zinc-400">
        Prices in INR. Pro is a single one-time payment — no subscription, no recurring charges.
        Premium tier launches soon.
      </div>
    </div>
  );
}

type PlanTone = 'neutral' | 'primary' | 'muted';

type PlanCardProps = Readonly<{
  label: string;
  price: string;
  cycle: string;
  tone: PlanTone;
  highlight: boolean;
  badge?: string;
  features: readonly string[];
  cta: React.ReactNode;
}>;

function badgeStyle(tone: PlanTone): string {
  if (tone === 'muted') {
    return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300';
  }
  if (tone === 'primary') {
    return 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300';
  }
  return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300';
}

function checkStyle(tone: PlanTone): string {
  if (tone === 'muted') return 'text-zinc-300 dark:text-zinc-600';
  if (tone === 'neutral') return 'text-zinc-400';
  return 'text-emerald-500';
}

function PlanCard({ label, price, cycle, tone, highlight, badge, features, cta }: PlanCardProps) {
  let ringClass = 'ring-1 ring-zinc-900/5 dark:ring-white/10';
  if (highlight) ringClass = 'ring-2 ring-zinc-900 dark:ring-white';

  const isMuted = tone === 'muted';
  const cardOpacity = isMuted ? 'opacity-80' : '';
  const priceColor = isMuted
    ? 'text-zinc-400 dark:text-zinc-600'
    : 'text-zinc-900 dark:text-zinc-100';

  return (
    <div
      className={`card-interactive group relative flex h-full flex-col overflow-hidden p-5 sm:p-6 ${ringClass} ${cardOpacity}`}
    >
      {/* gradient wash for the paid plans on hover */}
      {tone === 'primary' && (
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-400/25 via-pink-400/15 to-amber-300/10 opacity-50 blur-2xl transition-opacity duration-500 group-hover:opacity-100 dark:from-indigo-500/25 dark:via-pink-500/15 dark:to-amber-400/10" />
      )}

      <div className="relative flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{label}</span>
          {badge && (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeStyle(tone)}`}
            >
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className={`text-3xl font-semibold tracking-tight sm:text-4xl ${priceColor}`}>
            {price}
          </span>
          {cycle && (
            <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">{cycle}</span>
          )}
        </div>
      </div>

      <ul className="relative mt-5 flex-1 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check size={14} className={`mt-0.5 flex-shrink-0 ${checkStyle(tone)}`} />
            <span className={`leading-snug ${isMuted ? 'text-zinc-500 dark:text-zinc-500' : ''}`}>
              {f}
            </span>
          </li>
        ))}
      </ul>

      <div className="relative">{cta}</div>
    </div>
  );
}
