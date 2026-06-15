import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import { useAuth } from './data/auth';

// Lazy-load non-essential routes to keep the initial bundle lean.
const Claims = lazy(() => import('./pages/Claims'));
const History = lazy(() => import('./pages/History'));
const Profile = lazy(() => import('./pages/Profile'));

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading">
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-navy-200 border-t-navy-700" />
    </div>
  );
}

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900" role="status" aria-label="Loading">
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />
    </div>
  );
}

export default function App() {
  const { session, loading, demoMode, isAdmin, roleResolved } = useAuth();

  // While restoring an existing session, avoid flashing the auth screen.
  if (loading) return <FullScreenLoader />;

  // When auth is configured and the user is signed out, show the auth screen
  // (the /admin route still renders its own staff sign-in).
  if (!demoMode && !session) {
    return (
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
        <Route path="*" element={<Auth />} />
      </Routes>
    );
  }

  // Wait for admin status before deciding which app to show.
  if (session && !roleResolved) return <FullScreenLoader />;

  // Admins get the admin console only.
  if (isAdmin) {
    return (
      <Routes>
        <Route path="*" element={<Admin />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/admin/*" element={<Admin />} />
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route
          path="claims"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Claims />
            </Suspense>
          }
        />
        <Route
          path="history"
          element={
            <Suspense fallback={<RouteFallback />}>
              <History />
            </Suspense>
          }
        />
        <Route
          path="profile"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Profile />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
