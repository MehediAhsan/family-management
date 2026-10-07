import { useEffect, useState } from 'react';
import { BookHeart, CalendarDays, LockKeyhole, Pencil, Plus, Save, Share2, Trash2, X } from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api, { getErrorMessage } from '../services/api.js';

const emptyForm = () => ({
  title: '', content: '', mood: 'NEUTRAL', isPrivate: true,
  entryDate: new Date().toISOString().slice(0, 10),
});
const moodLabels = { HAPPY: 'Happy', NEUTRAL: 'Neutral', SAD: 'Sad' };

export default function Diary() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEntries = async () => {
    try {
      const { data } = await api.get('/diary');
      setEntries(data.entries);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEntries(); }, []);

  const startNew = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  const startEdit = (entry) => {
    setForm({ title: entry.title, content: entry.content, mood: entry.mood, isPrivate: entry.isPrivate, entryDate: entry.entryDate.slice(0, 10) });
    setEditingId(entry.id);
    setShowForm(true);
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = editingId
        ? await api.put(`/diary/${editingId}`, form)
        : await api.post('/diary', form);
      if (editingId) setEntries((current) => current.map((entry) => entry.id === editingId ? { ...data.entry, userId: user.id, authorName: user.fullName } : entry));
      else setEntries((current) => [{ ...data.entry, userId: user.id, authorName: user.fullName }, ...current]);
      setShowForm(false);
      setForm(emptyForm());
      setEditingId(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (entry) => {
    if (!window.confirm('Delete this diary entry? This cannot be undone.')) return;
    try {
      await api.delete(`/diary/${entry.id}`);
      setEntries((current) => current.filter((item) => item.id !== entry.id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-700">Moments worth keeping</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Family diary</h1>
          <p className="mt-2 text-sm text-slate-500">Private entries stay yours. Shared entries are visible to your household.</p>
        </div>
        {!showForm && <button className="btn-primary" onClick={startNew}><Plus size={17} /> New entry</button>}
      </div>

      {error && <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}

      {showForm && (
        <form onSubmit={submit} className="mb-8 rounded-2xl border border-teal-100 bg-white p-5 shadow-soft sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{editingId ? 'Edit entry' : 'Write a diary entry'}</h2>
            <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close form" onClick={() => setShowForm(false)}><X size={18} /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="title">Title</label>
              <input className="field" id="title" required maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="A moment from today" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="content">Your entry</label>
              <textarea className="field min-h-36 resize-y" id="content" required maxLength={20000} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="What would you like to remember?" />
            </div>
            <div>
              <label className="label" htmlFor="mood">Mood</label>
              <select className="field" id="mood" value={form.mood} onChange={(event) => setForm({ ...form, mood: event.target.value })}>
                <option value="HAPPY">Happy</option><option value="NEUTRAL">Neutral</option><option value="SAD">Sad</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="entryDate">Date</label>
              <input className="field" id="entryDate" type="date" required value={form.entryDate} onChange={(event) => setForm({ ...form, entryDate: event.target.value })} />
            </div>
          </div>
          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
            <input className="mt-1 accent-teal-700" type="checkbox" checked={!form.isPrivate} onChange={(event) => setForm({ ...form, isPrivate: !event.target.checked })} />
            <span className="flex-1"><span className="block text-sm font-semibold text-slate-800">Share with my household</span><span className="mt-1 block text-xs leading-5 text-slate-500">When off, only you can see this entry.</span></span>
            {form.isPrivate ? <LockKeyhole size={18} className="text-slate-400" /> : <Share2 size={18} className="text-teal-700" />}
          </label>
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={busy}><Save size={16} />{busy ? 'Saving…' : 'Save entry'}</button>
          </div>
        </form>
      )}

      {loading ? <Loading label="Loading your diary…" /> : entries.length === 0 ? (
        <EmptyState icon={BookHeart} title="Your story starts here" description="Write your first entry and decide whether to keep it private or share it with your family." action={!showForm && <button className="btn-primary" onClick={startNew}><Plus size={16} /> Write an entry</button>} />
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const ownEntry = entry.userId === user.id;
            return (
              <article key={entry.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1"><CalendarDays size={14} />{new Date(`${entry.entryDate.slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      <span>·</span><span>{entry.authorName}{ownEntry ? ' · You' : ''}</span>
                      <span className={`rounded-full px-2 py-0.5 font-medium ${entry.isPrivate ? 'bg-slate-100 text-slate-600' : 'bg-teal-50 text-teal-800'}`}>{entry.isPrivate ? 'Private' : 'Shared'}</span>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900">{entry.title}</h2>
                  </div>
                  {ownEntry && (
                    <div className="flex gap-1">
                      <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label={`Edit ${entry.title}`} onClick={() => startEdit(entry)}><Pencil size={17} /></button>
                      <button className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700" aria-label={`Delete ${entry.title}`} onClick={() => remove(entry)}><Trash2 size={17} /></button>
                    </div>
                  )}
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{entry.content}</p>
                <p className="mt-4 text-xs font-medium text-slate-400">Mood: {moodLabels[entry.mood] ?? 'Neutral'}</p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
