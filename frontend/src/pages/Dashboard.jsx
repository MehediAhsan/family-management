import { useEffect, useState } from 'react';
import { ArrowUpRight, BellRing, BookHeart, Heart, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import api, { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const cards = [
  { key: 'activeFamilyMembers', label: 'Family members', detail: 'In your household', icon: UsersRound, color: 'bg-sky-50 text-sky-700' },
  { key: 'recentDiaryEntries', label: 'Shared moments', detail: 'Diary entries this week', icon: BookHeart, color: 'bg-violet-50 text-violet-700' },
  { key: 'pendingFamilyAlerts', label: 'Family alerts', detail: 'Need your attention', icon: BellRing, color: 'bg-amber-50 text-amber-700' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard')
      .then(({ data }) => setStats(data.stats))
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-teal-700">Your family, in one place</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Good to see you, {user?.fullName?.split(' ')[0]}.</h1>
        <p className="mt-2 text-sm text-slate-500">A little space to stay close and look out for each other.</p>
      </div>
      {error && <div role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
      {stats ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Household summary">
          {cards.map(({ key, label, detail, icon: Icon, color }) => (
            <div key={key} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{stats[key]}</p>
                  <p className="mt-1 text-xs text-slate-500">{detail}</p>
                </div>
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${color}`}><Icon size={20} /></span>
              </div>
            </div>
          ))}
        </section>
      ) : !error ? <Loading label="Gathering your household overview…" /> : null}

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div><h2 className="text-lg font-semibold text-slate-900">A good place to start</h2><p className="mt-1 text-sm text-slate-500">Small ways to stay connected today.</p></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/diary" className="group flex min-h-44 items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-teal-200">
            <div>
              <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><BookHeart size={20} /></span>
              <h3 className="font-semibold text-slate-900">Write a diary entry</h3>
              <p className="mt-1 text-sm text-slate-500">Save a moment for yourself or share it with family.</p>
            </div>
            <ArrowUpRight className="text-slate-400 transition group-hover:text-teal-700" />
          </Link>
          <Link to="/profile" className="group flex min-h-44 items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-rose-200">
            <div>
              <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-700"><Heart size={20} /></span>
              <h3 className="font-semibold text-slate-900">Keep your profile current</h3>
              <p className="mt-1 text-sm text-slate-500">Share useful details and emergency information.</p>
            </div>
            <ArrowUpRight className="text-slate-400 transition group-hover:text-rose-700" />
          </Link>
        </div>
      </section>
      {stats?.pendingFamilyAlerts > 0 && (
        <div className="mt-6">
          <EmptyState icon={BellRing} title={`${stats.pendingFamilyAlerts} family alert${stats.pendingFamilyAlerts === 1 ? '' : 's'} to review`} description="Keep your household up to date by checking the family alerts." action={<Link to="/alerts" className="btn-secondary">View family alerts</Link>} />
        </div>
      )}
    </div>
  );
}
