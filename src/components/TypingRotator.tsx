import { useEffect, useState } from 'react';

/**
 * Types each phrase out, holds, deletes, advances to the next.
 * Used in the landing hero to hint at the range of things Autophrase does
 * without making the headline feel like a thesaurus dump.
 */
export function TypingRotator({
  words,
  typeMs = 70,
  holdMs = 1400,
  deleteMs = 35,
}: {
  words: string[];
  typeMs?: number;
  holdMs?: number;
  deleteMs?: number;
}) {
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'holding' | 'deleting'>('typing');

  useEffect(() => {
    const word = words[i % words.length];
    let t: number | undefined;
    if (phase === 'typing') {
      if (text.length < word.length) {
        t = window.setTimeout(() => setText(word.slice(0, text.length + 1)), typeMs);
      } else {
        t = window.setTimeout(() => setPhase('holding'), holdMs);
      }
    } else if (phase === 'holding') {
      t = window.setTimeout(() => setPhase('deleting'), 0);
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        t = window.setTimeout(() => setText(word.slice(0, text.length - 1)), deleteMs);
      } else {
        setI((n) => n + 1);
        setPhase('typing');
      }
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [text, phase, i, words, typeMs, holdMs, deleteMs]);

  return (
    <span className="relative">
      <span className="text-gradient font-semibold">{text || ' '}</span>
      <span className="ml-0.5 inline-block h-[0.9em] w-[2px] -translate-y-[0.05em] bg-current align-middle animate-caret" />
    </span>
  );
}
