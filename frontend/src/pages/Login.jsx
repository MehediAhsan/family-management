import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AuthShell from './AuthShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api, { getErrorMessage } from '../services/api.js';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, sessionError } = useAuth();
  const [form, setForm] = useState({ phoneNumber: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [unknownPhone, setUnknownPhone] = useState(false);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setUnknownPhone(false);
    setBusy(true);
    try {
      const { data } = await api.post('/auth/login', form);
      signIn(data);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setUnknownPhone(requestError.response?.data?.error?.code === 'USER_NOT_FOUND');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your space"
      description="Use your phone number and password to continue."
      footer={<>New to Kinship? <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-800">Create an account</Link></>}
    >
      <form className="space-y-5" onSubmit={submit}>
        {sessionError && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900">Your saved session could not be verified: {sessionError} Sign in again to continue.</div>}
        <div>
          <label className="label" htmlFor="phoneNumber">Phone number</label>
          <input className="field" id="phoneNumber" name="phoneNumber" type="tel" autoComplete="tel" required value={form.phoneNumber} onChange={update} placeholder="+1 555 123 4567" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input className="field" id="password" name="password" type="password" autoComplete="current-password" required value={form.password} onChange={update} placeholder="Your password" />
        </div>
        {error && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800">
            {error}{unknownPhone && <> <Link to="/register" className="font-semibold underline underline-offset-2">Register this number</Link>.</>}
          </div>
        )}
        <button className="btn-primary w-full py-3" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Continue'} {!busy && <ArrowRight size={17} />}
        </button>
      </form>
    </AuthShell>
  );
}
