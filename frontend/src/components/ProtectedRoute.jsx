import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ roles }) {
  const { user, ready } = useAuth();
  if (!ready) {
    return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Loading your family space…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
