import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

/**
 * Inverse of `RequireAuth`. Wraps "public" routes (landing, signin, signup)
 * so a signed-in user visiting `/` or `/signin` is bounced to `/app` instead
 * of seeing the marketing page or being asked to sign in again.
 *
 * Without this, a returning user with a valid session cookie still lands
 * on the Landing screen and sees "Start trial" — which is what the user
 * reported.
 */
export function RedirectIfAuthed() {
  const { status, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        Loading…
      </div>
    );
  }
  if (status) {
    return <Navigate to="/app" replace />;
  }
  return <Outlet />;
}
