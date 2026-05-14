import { useEffect, useState } from 'react';
import { Sparkles, ArrowUp } from 'lucide-react';

/**
 * Animated mock of the chat interface for the landing page.
 * Streams a canned response one character at a time, loops on a delay.
 */
const SCRIPT = {
  prompt: 'Rephrase this so it sounds more confident.',
  draft: 'i think maybe the launch could possibly be moved to next week if thats ok',
  response:
    "Let's move the launch to next week — it gives us the time we need to land this properly.",
};

const STREAM_MS = 18;
const LOOP_DELAY = 5200;

export function HeroPreview() {
  const [out, setOut] = useState('');
  const [phase, setPhase] = useState<'streaming' | 'idle'>('streaming');

  useEffect(() => {
    if (phase !== 'streaming') return;
    if (out.length >= SCRIPT.response.length) {
      const t = setTimeout(() => {
        setOut('');
        setPhase('streaming');
      }, LOOP_DELAY);
      setPhase('idle');
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setOut(SCRIPT.response.slice(0, out.length + 1)), STREAM_MS);
    return () => clearTimeout(t);
  }, [out, phase]);

  return (
    <div className="relative">
      {/* Soft glow ring behind the card */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-200/30 via-pink-200/30 to-amber-200/30 blur-2xl dark:from-indigo-500/15 dark:via-pink-500/15 dark:to-amber-500/15" />
      <div className="relative card overflow-hidden sm:animate-tilt">
        {/* macOS-ish chrome */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="font-mono text-2xs text-zinc-500 dark:text-zinc-400">
            autophrase · claude-opus-4-7
          </div>
          <div className="w-12" />
        </div>

        <div className="space-y-3 px-4 py-4">
          {/* User prompt with draft */}
          <div className="ml-auto max-w-[85%] animate-fade-in-up">
            <div className="rounded-2xl rounded-tr-sm bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
              <div className="font-medium">{SCRIPT.prompt}</div>
              <div className="mt-1.5 rounded-md bg-white/10 px-2 py-1.5 text-xs leading-snug text-white/90 dark:bg-zinc-900/10 dark:text-zinc-900/80">
                "{SCRIPT.draft}"
              </div>
            </div>
          </div>

          {/* Streaming assistant reply */}
          <div className="mr-auto max-w-[90%] animate-fade-in-up delay-300">
            <div className="rounded-2xl rounded-tl-sm bg-zinc-100 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              {out}
              <span className="ml-0.5 inline-block h-[0.9em] w-[2px] -translate-y-[0.05em] bg-current align-middle animate-caret" />
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 px-1 text-2xs text-zinc-500 dark:text-zinc-400">
              <Sparkles size={10} /> generated with your Anthropic key
            </div>
          </div>
        </div>

        {/* Fake composer */}
        <div className="border-t border-zinc-100 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-950/40">
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex-1 px-2 py-1 text-sm text-zinc-400 dark:text-zinc-500">
              Ask anything…
            </div>
            <button
              type="button"
              className="btn-primary h-7 w-7 p-0 animate-pulse-glow"
              aria-label="Send"
            >
              <ArrowUp size={13} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
