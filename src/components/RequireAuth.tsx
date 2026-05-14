import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

export function RequireAuth() {
  const { status, loading } = useAuth();
  const loc = useLocation();
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        Loading…
      </div>
    );
  }
  if (!status) {
    return <Navigate to="/signin" replace state={{ from: loc.pathname }} />;
  }
  return <Outlet />;
}
