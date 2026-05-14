import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Mark } from '@/components/Logo';

export function SignIn() {
  const { signin } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const redirectTo = (loc.state as { from?: string } | null)?.from ?? '/app';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await signin(email, password);
      nav(redirectTo, { replace: true });
    } catch (e: any) {
      setErr(e?.message ?? 'sign-in failed');
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
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Sign in to your Autophrase account.
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
              autoComplete="current-password"
              required
              placeholder="Password"
              value={password}
              onChange={setPassword}
            />
            {err && (
              <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-800 animate-fade-in-up-sm dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {err}
              </div>
            )}
            <button disabled={busy} className="btn-cta h-11 w-full text-sm" type="submit">
              {busy ? 'Signing in…' : (
                <>
                  Sign in
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
            No account?{' '}
            <Link
              to="/signup"
              className="font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-200"
            >
              Create one
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
