import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { Alert, Spinner } from '../components/Feedback.jsx';
import { Field } from './Register.jsx';
import { fmtDate, label } from '../utils.js';

export default function SeekerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('applications');
  const [apps, setApps] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/applications/mine'), api.get('/users/me')])
      .then(([a, p]) => { setApps(a.data); setProfile({ ...p.data, skills: (p.data.skills || []).join(', ') }); })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setError(''); setOk('');
    if (!profile.fullName.trim()) return setError('Full name is required');
    setSaving(true);
    try {
      const body = { ...profile, skills: profile.skills.split(',').map((s) => s.trim()).filter(Boolean) };
      await api.put('/users/me', body);
      setOk('Profile saved.');
    } catch (err) { setError(errMsg(err)); } finally { setSaving(false); }
  };

  const counts = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED'].map((s) => [s, apps.filter((a) => a.status === s).length]);
  const set = (k) => (e) => setProfile({ ...profile, [k]: e.target.value });

  return (
    <div className="wrap section">
      <div className="section-head"><h1>Hello, {user.fullName.split(' ')[0]}</h1><Link className="btn" to="/jobs">Browse jobs</Link></div>
      <div className="tabs" role="tablist">
        <button className={tab === 'applications' ? 'on' : ''} onClick={() => setTab('applications')}>My applications ({apps.length})</button>
        <button className={tab === 'profile' ? 'on' : ''} onClick={() => setTab('profile')}>My profile</button>
      </div>
      <Alert>{error}</Alert><Alert type="success">{ok}</Alert>
      {loading ? <Spinner /> : tab === 'applications' ? (
        <>
          <div className="stats">{counts.map(([s, n]) => <div key={s} className="card stat"><span className={`badge st-${s}`}>{label(s)}</span><strong>{n}</strong></div>)}</div>
          {apps.length === 0 ? <div className="empty">You have not applied for any jobs yet. <Link to="/jobs">Find a job to apply for</Link></div> : (
            <div className="table-wrap"><table>
              <thead><tr><th>Job</th><th>Company</th><th>Applied on</th><th>Status</th></tr></thead>
              <tbody>{apps.map((a) => (
                <tr key={a.id}><td><Link to={`/jobs/${a.jobId}`}>{a.jobTitle}</Link></td><td>{a.company}</td><td>{fmtDate(a.appliedAt)}</td><td><span className={`badge st-${a.status}`}>{label(a.status)}</span></td></tr>
              ))}</tbody>
            </table></div>
          )}
        </>
      ) : (
        <form className="card form narrow" onSubmit={save}>
          <Field label="Full name"><input value={profile.fullName} onChange={set('fullName')} /></Field>
          <Field label="Email"><input value={profile.email} disabled /></Field>
          <Field label="Phone"><input value={profile.phone || ''} onChange={set('phone')} /></Field>
          <Field label="Headline"><input value={profile.headline || ''} onChange={set('headline')} placeholder="e.g. Frontend developer with 3 years of experience" /></Field>
          <Field label="Skills (comma separated)"><input value={profile.skills} onChange={set('skills')} /></Field>
          <Field label="About you"><textarea rows="4" value={profile.bio || ''} onChange={set('bio')} /></Field>
          <button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
        </form>
      )}
    </div>
  );
}
