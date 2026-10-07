import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { BellRing, BookHeart, LayoutDashboard, LogOut, Menu, Settings2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/diary', label: 'Family diary', icon: BookHeart },
  { to: '/alerts', label: 'Family alerts', icon: BellRing },
  { to: '/profile', label: 'Your profile', icon: Settings2 },
];

export default function Layout() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navigation = (
    <nav className="space-y-1" aria-label="Main navigation">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setMenuOpen(false)}
          className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
        >
          <Icon size={18} strokeWidth={1.8} />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-7 lg:hidden">
        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-teal-700 text-sm text-white">k</span>
          kinship
        </Link>
        <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>
      {menuOpen && <button aria-label="Close navigation overlay" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-20 bg-slate-950/20 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-10 flex items-center justify-between px-2">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-slate-900">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-700 text-base text-white">k</span>
            <span className="text-lg">kinship<span className="text-teal-700">.</span></span>
          </Link>
          <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>
        {navigation}
        <div className="mt-auto border-t border-slate-100 pt-4">
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-100 text-sm font-semibold text-teal-800">
              {user?.fullName?.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{user?.fullName}</p>
              <p className="text-xs text-slate-500">{user?.role === 'ADMIN' ? 'Household admin' : 'Family member'}</p>
            </div>
          </div>
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-7 sm:px-7 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
