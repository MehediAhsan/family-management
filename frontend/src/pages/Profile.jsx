import { useEffect, useState } from 'react';
import { Check, Copy, KeyRound, Save, Shield, UsersRound } from 'lucide-react';
import Loading from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api, { getErrorMessage } from '../services/api.js';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/users/me'), api.get('/users')])
      .then(([profileResponse, membersResponse]) => {
        setProfile(profileResponse.data.user);
        setMembers(membersResponse.data.users);
      })
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (event) => setProfile({ ...profile, [event.target.name]: event.target.value });
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.put('/users/me', {
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        bio: profile.bio,
        emergencyInfo: profile.emergencyInfo,
      });
      setProfile((current) => ({ ...current, ...data.user }));
      setUser((current) => ({ ...current, ...data.user }));
      setMembers((current) => current.map((member) => member.id === data.user.id ? { ...member, ...data.user } : member));
      setSuccess('Your profile has been updated.');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const changeRole = async (member, role) => {
    setError('');
    setSuccess('');
    try {
      const { data } = await api.patch(`/users/${member.id}/role`, { role });
      setMembers((current) => current.map((item) => item.id === member.id ? { ...item, ...data.user } : item));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(profile.household.inviteCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Your browser could not copy the invite code. Select and copy it manually.');
    }
  };

  if (loading) return <Loading label="Loading your profile…" />;
  if (!profile) return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error || 'Your profile could not be loaded.'}</div>;

  return (
    <div>
      <div className="mb-7">
        <p className="text-sm font-medium text-teal-700">Your account, your details</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Personal profile</h1>
        <p className="mt-2 text-sm text-slate-500">Keep the information your family relies on up to date.</p>
      </div>
      {error && <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
      {success && <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{success}</div>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <form onSubmit={save} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700"><UsersRound size={20} /></span>
            <div><h2 className="font-semibold text-slate-900">Personal details</h2><p className="text-xs text-slate-500">Only share what feels right for your family.</p></div>
          </div>
          <div className="space-y-4">
            <div><label className="label" htmlFor="fullName">Full name</label><input id="fullName" name="fullName" className="field" required maxLength={120} value={profile.fullName} onChange={updateField} /></div>
            <div><label className="label" htmlFor="phoneNumber">Phone number</label><input id="phoneNumber" name="phoneNumber" className="field" type="tel" required value={profile.phoneNumber} onChange={updateField} /></div>
            <div>
              <label className="label" htmlFor="role">Household role</label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input id="role" className="field pl-10" value={profile.role === 'ADMIN' ? 'Admin — Head of Household' : 'Member — Family Member'} disabled />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">{user.role === 'ADMIN' ? 'Manage household member roles below.' : 'Only a household admin can change member roles.'}</p>
            </div>
            <div><label className="label" htmlFor="bio">Profile bio</label><textarea id="bio" name="bio" className="field min-h-24" maxLength={2000} value={profile.bio ?? ''} onChange={updateField} placeholder="A little about you…" /></div>
            <div><label className="label" htmlFor="emergencyInfo">Emergency information</label><textarea id="emergencyInfo" name="emergencyInfo" className="field min-h-24" maxLength={2000} value={profile.emergencyInfo ?? ''} onChange={updateField} placeholder="Important information your family should know…" /></div>
          </div>
          <div className="mt-6 flex justify-end"><button className="btn-primary" type="submit" disabled={busy}><Save size={16} />{busy ? 'Saving…' : 'Save changes'}</button></div>
        </form>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700"><KeyRound size={19} /></span>
              <div><h2 className="font-semibold text-slate-900">Your household</h2><p className="text-xs text-slate-500">{profile.household?.name ?? 'No household'}</p></div>
            </div>
            {profile.household?.inviteCode ? (
              <>
                <p className="text-sm text-slate-500">Share this code with family members you want to invite.</p>
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <code className="select-all font-mono text-lg font-semibold tracking-[0.16em] text-slate-800">{profile.household.inviteCode}</code>
                  <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-teal-700" onClick={copyInviteCode} aria-label="Copy household invite code">{copied ? <Check size={18} /> : <Copy size={18} />}</button>
                </div>
              </>
            ) : <p className="text-sm text-slate-500">This account is not currently linked to a household.</p>}
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="font-semibold text-slate-900">Household members</h2><p className="text-xs text-slate-500">{members.length} people in your family space</p></div>
            </div>
            <div className="divide-y divide-slate-100">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{member.fullName}{member.id === user.id ? ' (you)' : ''}</p>
                    <p className="text-xs text-slate-500">{member.phoneNumber}</p>
                  </div>
                  {user.role === 'ADMIN' && member.id !== user.id ? (
                    <select aria-label={`Role for ${member.fullName}`} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700" value={member.role} onChange={(event) => changeRole(member, event.target.value)}>
                      <option value="MEMBER">Member</option><option value="ADMIN">Admin</option>
                    </select>
                  ) : <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{member.role === 'ADMIN' ? 'Admin' : 'Member'}</span>}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
