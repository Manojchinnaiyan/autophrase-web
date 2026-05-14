import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Mark } from '@/components/Logo';

const BENEFITS = [
  '7-day free trial · no credit card',
  'Bring your own AI key — no markup',
  'Cancel anytime',
];

export function SignUp() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setErr('Password must be at least 8 characters');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await signup(email, password);
      nav('/app/settings', { replace: true });
    } catch (e: any) {
      setErr(e?.message ?? 'sign-up failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-6.5rem)] items-start justify-center px-4 py-10 sm:items-center sm:py-16">

      <div className="relative w-full max-w-sm animate-fade-in-up">
        <div className="card-interactive overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <Mark size={40} />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Start your trial
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              7 days of full access. No credit card required.
            </p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <Field
              icon={<Mail size={14} />}
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
            />
            <Field
              icon={<Lock size={14} />}
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Password (8+ characters)"
              value={password}
              onChange={setPassword}
            />
            {err && (
              <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-800 animate-fade-in-up-sm dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {err}
              </div>
            )}
            <button disabled={busy} className="btn-cta h-11 w-full text-sm" type="submit">
              {busy ? 'Creating account…' : (
                <>
                  Create account
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <ul className="mt-5 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-2">
                <Check size={12} className="flex-shrink-0 text-emerald-500" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Already have one?{' '}
            <Link
              to="/signin"
              className="font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-200"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

type FieldProps = Readonly<{
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
}>;

function Field({ icon, value, onChange, type = 'text', placeholder, required, autoComplete, minLength }: FieldProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
        {icon}
      </span>
      <input
        type={type}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input h-11 pl-9 text-base sm:text-sm"
      />
    </div>
  );
}
