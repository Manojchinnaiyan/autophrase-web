import { Link } from 'react-router-dom';
import { Zap, Lock, KeyRound, ArrowRight, Wand2, Languages, Quote } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { TypingRotator } from '@/components/TypingRotator';
import { HeroPreview } from '@/components/HeroPreview';

export function Landing() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Two animated blobs on top of the global body aurora — adds gentle
          drift on the landing hero. pointer-events disabled so they never
          eat clicks. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-light bg-grid-24 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent_70%)] dark:bg-grid-dark" />
        <div
          className="hero-blob h-[420px] w-[420px] animate-blob bg-indigo-200 dark:bg-indigo-500"
          style={{ top: '-8%', left: '-10%' }}
        />
        <div
          className="hero-blob delay-2000 h-[480px] w-[480px] animate-blob-slow bg-pink-200 dark:bg-pink-500"
          style={{ top: '4%', right: '-12%' }}
        />
      </div>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:pb-16 sm:pt-20 lg:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="text-center lg:text-left">
            <div className="pill animate-fade-in-up mx-auto lg:mx-0">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span>Now in beta · 30-day free trial</span>
            </div>

            <h1 className="mt-5 text-[34px] font-semibold leading-[1.08] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-zinc-100 animate-fade-in-up delay-200">
              <span className="block">Write better.</span>
              <span className="block min-h-[1.2em]">
                <TypingRotator words={['Faster.', 'Sharper.', 'Anywhere.', 'On your terms.']} />
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400 lg:mx-0 animate-fade-in-up delay-300">
              Rephrase, fix grammar, summarize, and chat with your text — using your own Anthropic,
              OpenAI, or Google key. We don't markup AI costs. You pay only for the tool.
            </p>

            <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start animate-fade-in-up delay-500">
              <Link to="/signup" className="btn-cta w-full sm:w-auto">
                Start free trial
                <ArrowRight size={14} />
              </Link>
              <Link to="/pricing" className="btn-secondary h-11 w-full px-5 text-sm sm:h-10 sm:w-auto">
                See pricing
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 animate-fade-in-up delay-700 lg:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{' '}No credit card required
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">·</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Cancel anytime</span>
              <span className="hidden text-xs text-zinc-400 sm:inline dark:text-zinc-500">·</span>
              <span className="hidden text-xs text-zinc-500 sm:inline dark:text-zinc-400">Keys never touch our servers</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md animate-fade-in-up delay-500 lg:mx-0">
            <HeroPreview />
          </div>
        </div>

        {/* Provider strip */}
        <Reveal delay={200} className="mt-12 sm:mt-16">
          <div className="text-center text-2xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Works with your favourite model
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 opacity-80 sm:gap-x-8">
            <ProviderName name="Anthropic" sub="Claude" />
            <ProviderDot />
            <ProviderName name="OpenAI" sub="GPT-4o" />
            <ProviderDot />
            <ProviderName name="Google" sub="Gemini" />
            <ProviderDot />
            <ProviderName name="Chrome" sub="Gemini Nano" />
          </div>
        </Reveal>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <Reveal>
          <div className="text-center">
            <div className="pill mx-auto"><span>Why Autophrase</span></div>
            <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
              All the AI. None of the lock-in.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
              Most AI writing tools mark up tokens 3-5×. Autophrase doesn't touch your tokens —
              you bring the key, we build the workflow.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
          <Reveal delay={0}>
            <Feature
              icon={<KeyRound size={16} />}
              title="Bring your own key"
              body="Plug in your Anthropic, OpenAI, or Google key. Keys stay in your browser — never on our servers."
              accent="from-indigo-400/30 to-indigo-100/0"
            />
          </Reveal>
          <Reveal delay={120}>
            <Feature
              icon={<Zap size={16} />}
              title="Streaming and fast"
              body="Direct provider calls means no proxy hop. Output streams token-by-token as soon as the model produces it."
              accent="from-pink-400/30 to-pink-100/0"
            />
          </Reveal>
          <Reveal delay={240}>
            <Feature
              icon={<Lock size={16} />}
              title="Private by default"
              body="We store only your account and subscription. Prompts, content, and keys never touch our backend."
              accent="from-amber-400/30 to-amber-100/0"
            />
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <Reveal className="text-center">
          <div className="pill mx-auto"><span>How it works</span></div>
          <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
            Three steps. Then you're flying.
          </h2>
        </Reveal>

        <div className="relative mt-10 grid gap-8 sm:mt-12 md:grid-cols-3 md:gap-6">
          {/* Connector line behind the steps */}
          <div className="absolute left-[10%] right-[10%] top-7 hidden h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent md:block dark:via-zinc-800" />
          <Reveal delay={0}>
            <Step n="1" icon={<KeyRound size={14} />} title="Sign up & add a key" body="30-day free trial, no credit card. Paste an API key from Anthropic, OpenAI, or Google." />
          </Reveal>
          <Reveal delay={150}>
            <Step n="2" icon={<Wand2 size={14} />} title="Pick a model" body="Switch between providers and models on the fly. Your choice is remembered per session." />
          </Reveal>
          <Reveal delay={300}>
            <Step n="3" icon={<Languages size={14} />} title="Write, rephrase, chat" body="Stream responses directly from the provider. No middlemen, no token markup." />
          </Reveal>
        </div>
      </section>

      {/* ── TESTIMONIAL ───────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-10 sm:py-12">
        <Reveal>
          <figure className="card relative overflow-hidden p-6 text-center sm:p-8">
            <Quote
              size={28}
              className="absolute left-5 top-5 text-zinc-100 dark:text-zinc-800"
            />
            <blockquote className="relative text-base font-medium leading-relaxed text-zinc-800 sm:text-lg dark:text-zinc-200">
              "Finally a tool where the bill is from Anthropic, not some wrapper marking it up 5×.
              Autophrase is what every AI app should have been from day one."
            </blockquote>
            <figcaption className="relative mt-4 text-xs text-zinc-500 dark:text-zinc-400">
              — a founder who reads their cloud bill
            </figcaption>
          </figure>
        </Reveal>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:pb-24 sm:pt-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-zinc-100 p-6 text-center sm:rounded-3xl sm:p-10 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950">
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 animate-blob rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/20" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 animate-blob-slow rounded-full bg-pink-200/40 blur-3xl dark:bg-pink-500/20" />

            <h2 className="relative text-[26px] font-semibold leading-tight tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
              Try it free for 30 days
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
              Full access during the trial. After that, a single ₹500 payment unlocks Pro for
              life — no subscription. Your AI keys, your costs.
            </p>
            <div className="relative mt-6 flex flex-col items-stretch gap-3 sm:mt-7 sm:flex-row sm:items-center sm:justify-center">
              <Link to="/signup" className="btn-cta w-full sm:w-auto">
                Create account
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/pricing"
                className="btn-secondary h-11 w-full px-5 text-sm sm:h-10 sm:w-auto"
              >
                See pricing
              </Link>
            </div>
            <p className="relative mt-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{' '}No credit card required
              </span>
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

type FeatureProps = Readonly<{
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: string;
}>;

function Feature({ icon, title, body, accent }: FeatureProps) {
  return (
    <div className="card-interactive group relative overflow-hidden p-5">
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />
      <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 transition-transform group-hover:scale-110 dark:bg-zinc-800 dark:text-zinc-200">
        {icon}
      </div>
      <div className="relative mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </div>
      <div className="relative mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {body}
      </div>
    </div>
  );
}

type StepProps = Readonly<{
  n: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}>;

function Step({ n, icon, title, body }: StepProps) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
          {icon}
        </div>
        <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 font-mono text-2xs font-semibold text-white shadow-soft">
          {n}
        </span>
      </div>
      <div className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</div>
      <div className="mt-1 max-w-xs text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {body}
      </div>
    </div>
  );
}

function ProviderName({ name, sub }: Readonly<{ name: string; sub: string }>) {
  return (
    <div className="flex flex-col items-center">
      <div className="font-semibold text-zinc-700 dark:text-zinc-300">{name}</div>
      <div className="text-2xs text-zinc-400 dark:text-zinc-500">{sub}</div>
    </div>
  );
}

function ProviderDot() {
  return <span className="hidden h-1 w-1 rounded-full bg-zinc-300 sm:block dark:bg-zinc-700" />;
}
