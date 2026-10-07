import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Alerts from './pages/Alerts.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Diary from './pages/Diary.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import Register from './pages/Register.jsx';
import { useAuth } from './context/AuthContext.jsx';

function PublicOnly({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Loading your family space…</div>;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="diary" element={<Diary />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
