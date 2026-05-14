import { Navigate, Route, Routes } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Pricing } from './pages/Pricing';
import { Dashboard } from './pages/Dashboard';
import { RequireAuth } from './components/RequireAuth';
import { RedirectIfAuthed } from './components/RedirectIfAuthed';
import { Layout } from './components/Layout';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Pricing stays public for both signed-out and signed-in users. */}
        <Route path="/pricing" element={<Pricing />} />

        {/* Landing / SignIn / SignUp bounce signed-in users to /app so they
            don't see "Start trial" again after returning to the site. */}
        <Route element={<RedirectIfAuthed />}>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route path="/app" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
