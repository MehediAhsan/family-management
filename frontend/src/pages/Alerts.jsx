import { useEffect, useState } from 'react';
import { BellRing, Check, CircleCheck, Plus, ShieldAlert } from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api, { getErrorMessage } from '../services/api.js';

export default function Alerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState({ title: '', message: '' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadAlerts = async () => {
    try {
      const { data } = await api.get('/alerts');
      setAlerts(data.alerts);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAlerts(); }, []);

  const create = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/alerts', form);
      setAlerts((current) => [data.alert, ...current]);
      setForm({ title: '', message: '' });
      setShowForm(false);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const resolve = async (alert) => {
    setError('');
    try {
      const { data } = await api.patch(`/alerts/${alert.id}/resolve`);
      setAlerts((current) => current.map((item) => item.id === alert.id ? { ...item, ...data.alert } : item));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-700">Looking out for each other</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Family alerts</h1>
          <p className="mt-2 text-sm text-slate-500">Important notes shared with everyone in your household.</p>
        </div>
        {user.role === 'ADMIN' && <button className="btn-primary" onClick={() => setShowForm((open) => !open)}><Plus size={17} /> New alert</button>}
      </div>

      {error && <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
      {showForm && user.role === 'ADMIN' && (
        <form onSubmit={create} className="mb-7 rounded-2xl border border-amber-100 bg-white p-5 shadow-soft sm:p-6">
          <h2 className="mb-4 font-semibold text-slate-900">Create a household alert</h2>
          <div className="space-y-4">
            <div><label className="label" htmlFor="alert-title">Title</label><input id="alert-title" className="field" maxLength={160} required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="A helpful reminder" /></div>
            <div><label className="label" htmlFor="alert-message">Details</label><textarea id="alert-message" className="field min-h-28" maxLength={3000} required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Share the details your family needs to know." /></div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button className="btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn-primary" type="submit" disabled={busy}><Plus size={16} />{busy ? 'Publishing…' : 'Publish alert'}</button>
          </div>
        </form>
      )}

      {loading ? <Loading label="Loading family alerts…" /> : alerts.length === 0 ? (
        <EmptyState icon={CircleCheck} title="All clear for now" description={user.role === 'ADMIN' ? 'There are no family alerts. Create one when there is something the household should know.' : 'There are no active family alerts at the moment.'} />
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const pending = !alert.resolvedAt;
            return (
              <article key={alert.id} className={`rounded-2xl border bg-white p-5 shadow-soft sm:p-6 ${pending ? 'border-amber-200' : 'border-slate-200/80 opacity-80'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <span className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${pending ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{pending ? <ShieldAlert size={19} /> : <Check size={19} />}</span>
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-slate-900">{alert.title}</h2>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${pending ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>{pending ? 'Needs attention' : 'Resolved'}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{alert.message}</p>
                      <p className="mt-3 text-xs text-slate-400">Posted by {alert.createdBy ?? user.fullName} · {new Date(alert.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                    </div>
                  </div>
                  {pending && user.role === 'ADMIN' && (
                    <button className="btn-secondary shrink-0 !px-3 !py-2 text-xs" onClick={() => resolve(alert)} aria-label={`Resolve ${alert.title}`}><BellRing size={15} /> Resolve</button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
