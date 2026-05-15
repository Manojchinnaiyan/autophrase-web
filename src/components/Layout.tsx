import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { applyTheme, setThemePref } from '@/lib/theme';
import { Logo, Mark } from './Logo';
import { useAuth } from '@/lib/auth';

export function Layout() {
  const loc = useLocation();
  const nav = useNavigate();
  const { status, signout } = useAuth();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    applyTheme();
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  // Close the mobile menu whenever the user navigates.
  useEffect(() => {
    setMenuOpen(false);
  }, [loc.pathname]);

  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [menuOpen]);

  function toggleTheme() {
    const next = isDark ? 'light' : 'dark';
    setThemePref(next);
    setIsDark(next === 'dark');
  }

  const onAppRoute = loc.pathname.startsWith('/app');
  // The web app is just the marketing + account surface — Chat / provider
  // settings live in the Chrome extension, so the only "app" route is the
  // dashboard itself. No nav links needed when signed in.
  const appLinks: { to: string; label: string }[] = [];

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white/80 backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
          <Link
            to={status ? '/app' : '/'}
            className="group flex min-w-0 shrink-0 items-center gap-1.5 transition-opacity hover:opacity-90"
            aria-label="Autophrase home"
          >
            <span className="transition-transform duration-300 group-hover:rotate-3">
              <Mark size={22} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              autophrase
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {!onAppRoute && (
              <Link
                to="/pricing"
                className={`btn-ghost h-8 text-sm ${loc.pathname === '/pricing' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
              >
                Pricing
              </Link>
            )}
            {onAppRoute && status && status.plan !== 'pro' && (
              <Link to="/pricing" className="btn-primary h-8 text-sm">
                Upgrade
              </Link>
            )}
            {appLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`btn-ghost h-8 text-sm ${loc.pathname === l.to ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
              >
                {l.label}
              </Link>
            ))}
            <button onClick={toggleTheme} className="btn-ghost h-8 w-8 p-0" title="Toggle theme">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            {status ? (
              <button
                onClick={async () => {
                  await signout();
                  nav('/');
                }}
                className="btn-ghost h-8 text-sm"
              >
                Sign out
              </button>
            ) : (
              <>
                <Link to="/signin" className="btn-ghost h-8 text-sm">
                  Sign in
                </Link>
                <Link to="/signup" className="btn-primary h-8 text-sm">
                  Get started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile controls — keep this lean so 320px viewports don't crowd.
              CTAs live inside the drawer instead. */}
          <div className="flex items-center gap-0.5 md:hidden">
            <button
              onClick={toggleTheme}
              className="btn-ghost h-9 w-9 p-0"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="btn-ghost h-9 w-9 p-0"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer — slides down from header, full width */}
        <div
          className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
            menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="mx-auto max-w-6xl border-t border-zinc-100 px-4 py-3 dark:border-zinc-900">
            <nav className="flex flex-col gap-1">
              {!onAppRoute && (
                <MobileLink to="/pricing" active={loc.pathname === '/pricing'}>
                  Pricing
                </MobileLink>
              )}
              {appLinks.map((l) => (
                <MobileLink key={l.to} to={l.to} active={loc.pathname === l.to}>
                  {l.label}
                </MobileLink>
              ))}
              <div className="my-2 h-px bg-zinc-100 dark:bg-zinc-900" />
              {status ? (
                <>
                  <div className="px-3 pb-1 text-2xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Signed in
                  </div>
                  <div className="px-3 pb-2 text-xs text-zinc-700 dark:text-zinc-300">
                    {status.user.email}
                  </div>
                  {status.plan !== 'pro' && (
                    <Link to="/pricing" className="btn-primary h-10 text-sm">
                      Upgrade to Pro
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      await signout();
                      nav('/');
                    }}
                    className="btn-secondary h-10 text-sm"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" className="btn-secondary h-10 text-sm">
                    Sign in
                  </Link>
                  <Link to="/signup" className="btn-primary h-10 text-sm">
                    Get started
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-2 px-4 text-2xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Logo size={10} />
          </span>
          <span className="font-mono">v0.1.0</span>
        </div>
      </footer>
    </div>
  );
}

type MobileLinkProps = Readonly<{
  to: string;
  active: boolean;
  children: React.ReactNode;
}>;

function MobileLink({ to, active, children }: MobileLinkProps) {
  return (
    <Link
      to={to}
      className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
          : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900'
      }`}
    >
      {children}
    </Link>
  );
}
