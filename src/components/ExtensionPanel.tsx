import { useState } from 'react';
import { Download, Copy, Check, Chrome, KeyRound, ArrowDown } from 'lucide-react';

/**
 * The Get-the-extension panel on /app — the highest-value action on the
 * dashboard. Shows the download CTA, the license key, and a three-step
 * install guide so a user can go from signup → working extension in
 * under two minutes.
 *
 * About `DOWNLOAD_PATH`:
 * Cloudflare's CDN and the browser both cache static assets aggressively.
 * Without a version on the URL, ?v=…, an updated zip in `public/downloads/`
 * keeps serving the old one to anyone who hit the page recently. Bumping
 * `EXTENSION_VERSION` per release makes the URL unique, so every cache
 * layer treats it as a brand-new asset.
 *
 * Workflow per release:
 *   1. Bump `EXTENSION_VERSION` here
 *   2. Rebuild the extension and copy the zip into public/downloads/
 *   3. `npm run deploy`
 */
const EXTENSION_VERSION = '1.2.1';
const DOWNLOAD_PATH = `/downloads/autophrase.zip?v=${EXTENSION_VERSION}`;

export function ExtensionPanel({ licenseKey }: Readonly<{ licenseKey: string }>) {
  const [copied, setCopied] = useState(false);

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — user can still select-and-copy manually
    }
  }

  return (
    <div className="card-interactive relative overflow-hidden p-5 sm:p-6">
      {/* Decorative wash */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-400/20 via-pink-400/15 to-amber-300/10 blur-2xl dark:from-indigo-500/20 dark:via-pink-500/15 dark:to-amber-400/10" />

      <div className="relative">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
            <Chrome size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Get the Autophrase extension
            </div>
            <div className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              Download · install · activate with your key.
            </div>
          </div>
          <span className="hidden flex-shrink-0 rounded-full border border-zinc-200 bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-500 sm:inline dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            v{EXTENSION_VERSION}
          </span>
        </div>

        {/* Step 1 — Download */}
        <div className="mt-5">
          <StepHeader n="1" title="Download the extension" />
          <a
            href={DOWNLOAD_PATH}
            download
            className="btn-cta mt-3 inline-flex h-11 px-5 text-sm"
          >
            <Download size={14} />
            Download autophrase.zip
          </a>
          <div className="mt-1.5 text-2xs text-zinc-500 dark:text-zinc-400">
            ~660 KB · works on Chrome, Edge, Brave, Arc
          </div>
        </div>

        {/* Step 2 — License key */}
        <div className="mt-5">
          <StepHeader n="2" title="Copy your license key" icon={<KeyRound size={11} />} />
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input
                readOnly
                value={licenseKey}
                onFocus={(e) => e.currentTarget.select()}
                aria-label="License key"
                className="input h-11 select-all pr-10 font-mono text-xs sm:h-10"
              />
              <button
                type="button"
                onClick={copyKey}
                className="btn-ghost absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 p-0 sm:h-8 sm:w-8"
                title="Copy"
                aria-label="Copy license key"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={13} />}
              </button>
            </div>
            <button
              onClick={copyKey}
              type="button"
              className="btn-secondary h-11 w-full text-sm sm:h-10 sm:w-auto"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={13} />
                  Copy key
                </>
              )}
            </button>
          </div>
          <div className="mt-1.5 text-2xs text-zinc-500 dark:text-zinc-400">
            Keep this private. It links the extension to your account.
          </div>
        </div>

        {/* Step 3 — Install */}
        <div className="mt-5">
          <StepHeader n="3" title="Load it into Chrome" />
          <ol className="mt-2 space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
            <InstallStep>
              Unzip <Code>autophrase.zip</Code> to a folder you'll keep around.
            </InstallStep>
            <InstallStep>
              Open <Code>chrome://extensions</Code> and toggle <strong>Developer mode</strong> on.
            </InstallStep>
            <InstallStep>
              Click <strong>Load unpacked</strong> and pick the unzipped folder.
            </InstallStep>
            <InstallStep>
              Open the Autophrase options page and paste your license key.
            </InstallStep>
          </ol>
        </div>

        {/* Tip */}
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <ArrowDown size={13} className="mt-0.5 flex-shrink-0" />
          <span>
            Once installed, select any text on any page and press{' '}
            <span className="kbd">⌥</span>
            <span className="kbd">W</span> to rephrase it.
          </span>
        </div>
      </div>
    </div>
  );
}

function StepHeader({
  n,
  title,
  icon,
}: Readonly<{ n: string; title: string; icon?: React.ReactNode }>) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 font-mono text-[10px] font-semibold text-white dark:bg-white dark:text-zinc-900">
        {n}
      </span>
      <span className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
        {icon}
      </span>
    </div>
  );
}

function InstallStep({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-600" />
      <span className="leading-snug">{children}</span>
    </li>
  );
}

function Code({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[11px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
      {children}
    </code>
  );
}
