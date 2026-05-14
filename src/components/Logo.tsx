/**
 * The autophrase mark — matches the Chrome extension.
 *
 * Two stacked phrases (thin/gray = original, thick/white = improved)
 * with a violet→indigo accent dot. Reads as "text becomes better text",
 * no letterform.
 *
 * Wordmark uses lowercase "autophrase" to match the extension's brand.
 */

const GRAD_ID = `ap-grad-${Math.random().toString(36).slice(2, 8)}`;

interface MarkProps {
  readonly size?: number;
}

export function Mark({ size = 24 }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="block shrink-0"
    >
      <defs>
        <linearGradient id={GRAD_ID} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="16" height="16" rx="4" fill="#0a0a0a" />
      <line
        x1="3.5"
        y1="6"
        x2="10"
        y2="6"
        stroke="#71717a"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="3.5"
        y1="10"
        x2="11.5"
        y2="10"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="13.2" cy="10" r="1.4" fill={`url(#${GRAD_ID})`} />
    </svg>
  );
}

interface LogoProps {
  readonly size?: number;
  readonly showText?: boolean;
  readonly className?: string;
}

export function Logo({ size = 18, showText = true, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Mark size={size} />
      {showText && (
        <span
          className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
          style={{ fontSize: Math.max(12, Math.round(size * 0.78)) }}
        >
          autophrase
        </span>
      )}
    </span>
  );
}
