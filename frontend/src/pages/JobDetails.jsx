import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Clock, IndianRupee, CalendarDays, Layers } from 'lucide-react';
import api, { errMsg } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { Alert, Spinner } from '../components/Feedback.jsx';
import { salary, fmtDate, isClosed } from '../utils.js';

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ coverLetter: '', resumeUrl: '' });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState('');
  const [applyErr, setApplyErr] = useState('');
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then((r) => setJob(r.data)).catch((e) => setError(errMsg(e))).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.role === 'JOB_SEEKER') {
      api.get('/applications/mine').then((r) => setApplied(r.data.some((a) => a.jobId === id))).catch(() => {});
    }
  }, [user, id]);

  const apply = async (e) => {
    e.preventDefault();
    setApplyErr('');
    if (form.resumeUrl && !/^https?:\/\/\S+$/.test(form.resumeUrl)) return setApplyErr('Resume link must start with http:// or https://');
    setBusy(true);
    try {
      await api.post(`/jobs/${id}/apply`, form);
      setDone('Application sent. Track its status in your dashboard.');
      setApplied(true);
      setOpen(false);
    } catch (err) {
      setApplyErr(errMsg(err));
      if (err.response?.status === 409) setApplied(true);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="wrap section"><Spinner /></div>;
  if (error) return <div className="wrap section"><Alert>{error}</Alert><Link to="/jobs">Back to jobs</Link></div>;

  const closed = isClosed(job);
  return (
    <div className="wrap section detail">
      <article className="card">
        <h1>{job.title}</h1>
        <p className="muted">{job.company}</p>
        <ul className="meta big">
          <li><MapPin size={16} /> {job.location}</li>
          <li><Clock size={16} /> {job.type}</li>
          <li><Layers size={16} /> {job.experience} level</li>
          <li><IndianRupee size={16} /> {salary(job)}</li>
          <li><CalendarDays size={16} /> Apply by {fmtDate(job.deadline)}</li>
        </ul>
        <h2>About the role</h2>
        <p className="prose">{job.description}</p>
        <h2>Required skills</h2>
        <div className="chips">{job.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
      </article>

      <aside className="card apply">
        <Alert type="success">{done}</Alert>
        {closed ? <p>Applications for this job are closed.</p>
          : !user ? <><p>Log in as a job seeker to apply.</p><Link className="btn" to="/login" state={{ from: `/jobs/${id}` }}>Log in to apply</Link></>
          : user.role === 'EMPLOYER' ? <p className="muted">Employer accounts cannot apply to jobs.</p>
          : applied ? <p><strong>You have applied for this job.</strong> <Link to="/seeker">View status</Link></p>
          : !open ? <button className="btn btn-lg" onClick={() => setOpen(true)}>Apply now</button>
          : (
            <form onSubmit={apply} className="form">
              <h3>Your application</h3>
              <Alert>{applyErr}</Alert>
              <label className="field"><span>Cover letter</span><textarea rows="5" maxLength="3000" value={form.coverLetter} onChange={(e) => setForm({ ...form, coverLetter: e.target.value })} placeholder="Why are you a good fit?" /></label>
              <label className="field"><span>Resume link (optional)</span><input value={form.resumeUrl} onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })} placeholder="https://drive.google.com/…" /></label>
              <button className="btn" disabled={busy}>{busy ? 'Sending…' : 'Submit application'}</button>
            </form>
          )}
      </aside>
    </div>
  );
}
