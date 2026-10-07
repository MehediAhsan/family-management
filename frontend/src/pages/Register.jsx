import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AuthShell from './AuthShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api, { getErrorMessage } from '../services/api.js';

export default function Register() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [mode, setMode] = useState('create');
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', password: '', householdName: '', inviteCode: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    const { fullName, phoneNumber, password, householdName, inviteCode } = form;
    try {
      const { data } = await api.post('/auth/register', {
        fullName, phoneNumber, password,
        ...(mode === 'create' ? { householdName } : { inviteCode }),
      });
      signIn(data);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Your family's space"
      title="Start with your household"
      description="Create a household as its admin, or join one with an invite code."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800">Sign in</Link></>}
    >
      <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
        {[['create', 'Create household'], ['join', 'Join household']].map(([value, label]) => (
          <button key={value} type="button" onClick={() => setMode(value)} className={`rounded-lg px-2 py-2.5 text-sm font-semibold transition ${mode === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
            {label}
          </button>
        ))}
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <div>
          <label className="label" htmlFor="fullName">Your full name</label>
          <input className="field" id="fullName" name="fullName" autoComplete="name" required maxLength={120} value={form.fullName} onChange={update} placeholder="Alex Morgan" />
        </div>
        <div>
          <label className="label" htmlFor="phoneNumber">Phone number</label>
          <input className="field" id="phoneNumber" name="phoneNumber" type="tel" autoComplete="tel" required value={form.phoneNumber} onChange={update} placeholder="+1 555 123 4567" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input className="field" id="password" name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={72} value={form.password} onChange={update} placeholder="At least 10 characters, with a number" />
        </div>
        {mode === 'create' ? (
          <div>
            <label className="label" htmlFor="householdName">Household name</label>
            <input className="field" id="householdName" name="householdName" required maxLength={120} value={form.householdName} onChange={update} placeholder="The Morgan family" />
          </div>
        ) : (
          <div>
            <label className="label" htmlFor="inviteCode">Household invite code</label>
            <input className="field uppercase" id="inviteCode" name="inviteCode" required maxLength={32} value={form.inviteCode} onChange={update} placeholder="Enter your invite code" />
          </div>
        )}
        {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800">{error}</div>}
        <button className="btn-primary w-full py-3" type="submit" disabled={busy}>
          {busy ? 'Creating your account…' : 'Create account'} {!busy && <ArrowRight size={17} />}
        </button>
      </form>
    </AuthShell>
  );
}
