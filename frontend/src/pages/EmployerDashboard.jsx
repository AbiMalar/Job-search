import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus } from 'lucide-react';
import api, { errMsg, fieldErrors } from '../api.js';
import { Alert, Spinner } from '../components/Feedback.jsx';
import { Field } from './Register.jsx';
import { CATEGORIES, TYPES, LEVELS, STATUSES, fmtDate, label, salary } from '../utils.js';

const empty = { title: '', company: '', location: '', category: CATEGORIES[0], type: TYPES[0], experience: LEVELS[0], salaryMin: '', salaryMax: '', description: '', skills: '', deadline: '' };

export default function EmployerDashboard() {
  const [tab, setTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [form, setForm] = useState(null); // null = hidden
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [filterJob, setFilterJob] = useState('');
  const [open, setOpen] = useState(null);

  const load = () => Promise.all([api.get('/jobs/mine'), api.get('/applications/employer')])
    .then(([j, a]) => { setJobs(j.data); setApps(a.data); })
    .catch((e) => setError(errMsg(e)))
    .finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const startNew = () => { setForm({ ...empty }); setEditId(null); setErrors({}); setError(''); setOk(''); };
  const startEdit = (j) => { setForm({ ...j, skills: j.skills.join(', '), salaryMin: String(j.salaryMin), salaryMax: String(j.salaryMax) }); setEditId(j.id); setErrors({}); setError(''); setOk(''); window.scrollTo({ top: 0 }); };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const x = {};
    ['title', 'company', 'location'].forEach((k) => !form[k].trim() && (x[k] = 'This field is required'));
    if (form.salaryMin === '' || Number(form.salaryMin) < 0) x.salaryMin = 'Enter a minimum salary';
    if (form.salaryMax === '' || Number(form.salaryMax) < 0) x.salaryMax = 'Enter a maximum salary';
    if (!x.salaryMin && !x.salaryMax && Number(form.salaryMin) > Number(form.salaryMax)) x.salaryMax = 'Maximum must be at least the minimum';
    if (form.description.trim().length < 20) x.description = 'Description must be at least 20 characters';
    if (!form.skills.split(',').some((s) => s.trim())) x.skills = 'Add at least one skill';
    if (!form.deadline) x.deadline = 'Choose a deadline';
    else if (form.deadline < new Date().toISOString().slice(0, 10)) x.deadline = 'Deadline cannot be in the past';
    return x;
  };

  const save = async (e) => {
    e.preventDefault();
    setError(''); setOk('');
    const x = validate();
    setErrors(x);
    if (Object.keys(x).length) return;
    setSaving(true);
    const body = { ...form, salaryMin: Number(form.salaryMin), salaryMax: Number(form.salaryMax), skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) };
    try {
      editId ? await api.put(`/jobs/${editId}`, body) : await api.post('/jobs', body);
      setOk(editId ? 'Job updated.' : 'Job posted.');
      setForm(null);
      await load();
    } catch (err) { setErrors(fieldErrors(err)); setError(errMsg(err)); } finally { setSaving(false); }
  };

  const remove = async (j) => {
    if (!window.confirm(`Delete "${j.title}"? Its applications will be deleted too.`)) return;
    setError(''); setOk('');
    try { await api.delete(`/jobs/${j.id}`); setOk('Job deleted.'); await load(); } catch (err) { setError(errMsg(err)); }
  };

  const setStatus = async (a, status) => {
    setError(''); setOk('');
    try {
      const { data } = await api.patch(`/applications/${a.id}/status`, { status });
      setApps(apps.map((x) => (x.id === a.id ? data : x)));
      setOk(`${data.applicantName} marked ${label(status)}.`);
    } catch (err) { setError(errMsg(err)); }
  };

  const shown = filterJob ? apps.filter((a) => a.jobId === filterJob) : apps;

  return (
    <div className="wrap section">
      <div className="section-head"><h1>Employer dashboard</h1>{tab === 'jobs' && !form && <button className="btn" onClick={startNew}><Plus size={16} /> Post a job</button>}</div>
      <div className="tabs">
        <button className={tab === 'jobs' ? 'on' : ''} onClick={() => setTab('jobs')}>My jobs ({jobs.length})</button>
        <button className={tab === 'apps' ? 'on' : ''} onClick={() => setTab('apps')}>Applications ({apps.length})</button>
      </div>
      <Alert>{error}</Alert><Alert type="success">{ok}</Alert>

      {loading ? <Spinner /> : tab === 'jobs' ? (
        <>
          {form && (
            <form className="card form" onSubmit={save} noValidate>
              <h2>{editId ? 'Edit job' : 'Post a job'}</h2>
              <div className="cols">
                <Field label="Job title" error={errors.title}><input value={form.title} onChange={set('title')} /></Field>
                <Field label="Company" error={errors.company}><input value={form.company} onChange={set('company')} /></Field>
                <Field label="Location" error={errors.location}><input value={form.location} onChange={set('location')} /></Field>
                <Field label="Category" error={errors.category}><select value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
                <Field label="Job type" error={errors.type}><select value={form.type} onChange={set('type')}>{TYPES.map((c) => <option key={c}>{c}</option>)}</select></Field>
                <Field label="Experience level" error={errors.experience}><select value={form.experience} onChange={set('experience')}>{LEVELS.map((c) => <option key={c}>{c}</option>)}</select></Field>
                <Field label="Minimum salary (LPA)" error={errors.salaryMin}><input type="number" min="0" value={form.salaryMin} onChange={set('salaryMin')} /></Field>
                <Field label="Maximum salary (LPA)" error={errors.salaryMax}><input type="number" min="0" value={form.salaryMax} onChange={set('salaryMax')} /></Field>
                <Field label="Application deadline" error={errors.deadline}><input type="date" value={form.deadline} onChange={set('deadline')} /></Field>
                <Field label="Skills (comma separated)" error={errors.skills}><input value={form.skills} onChange={set('skills')} placeholder="Java, Spring Boot, MongoDB" /></Field>
              </div>
              <Field label="Description" error={errors.description}><textarea rows="5" value={form.description} onChange={set('description')} /></Field>
              <div className="row">
                <button className="btn" disabled={saving}>{saving ? 'Saving…' : editId ? 'Save changes' : 'Post job'}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button>
              </div>
            </form>
          )}
          {jobs.length === 0 && !form ? <div className="empty">You have not posted any jobs yet. Use “Post a job” to create your first listing.</div> : (
            <div className="table-wrap"><table>
              <thead><tr><th>Title</th><th>Location</th><th>Salary</th><th>Deadline</th><th>Applications</th><th></th></tr></thead>
              <tbody>{jobs.map((j) => (
                <tr key={j.id}>
                  <td><Link to={`/jobs/${j.id}`}>{j.title}</Link></td><td>{j.location}</td><td>{salary(j)}</td><td>{fmtDate(j.deadline)}</td>
                  <td><button className="link" onClick={() => { setFilterJob(j.id); setTab('apps'); }}>{apps.filter((a) => a.jobId === j.id).length}</button></td>
                  <td className="actions">
                    <button className="icon-btn" aria-label={`Edit ${j.title}`} onClick={() => startEdit(j)}><Pencil size={16} /></button>
                    <button className="icon-btn danger" aria-label={`Delete ${j.title}`} onClick={() => remove(j)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </>
      ) : (
        <>
          <div className="toolbar one">
            <select value={filterJob} onChange={(e) => setFilterJob(e.target.value)} aria-label="Filter by job"><option value="">All jobs</option>{jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}</select>
          </div>
          {shown.length === 0 ? <div className="empty">No applications received yet.</div> : (
            <div className="stack">{shown.map((a) => (
              <article key={a.id} className="card app">
                <div className="app-head">
                  <div><h3>{a.applicantName}</h3><p className="muted">Applied for {a.jobTitle} on {fmtDate(a.appliedAt)}</p></div>
                  <label className="status-pick"><span className={`badge st-${a.status}`}>{label(a.status)}</span>
                    <select value={a.status} onChange={(e) => setStatus(a, e.target.value)} aria-label={`Status for ${a.applicantName}`}>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>
                  </label>
                </div>
                <button className="link" onClick={() => setOpen(open === a.id ? null : a.id)}>{open === a.id ? 'Hide applicant details' : 'View applicant details'}</button>
                {open === a.id && (
                  <dl className="details">
                    <dt>Email</dt><dd><a href={`mailto:${a.applicantEmail}`}>{a.applicantEmail}</a></dd>
                    <dt>Phone</dt><dd>{a.applicantPhone || 'Not provided'}</dd>
                    <dt>Headline</dt><dd>{a.applicantHeadline || 'Not provided'}</dd>
                    <dt>Skills</dt><dd>{a.applicantSkills?.length ? a.applicantSkills.join(', ') : 'Not provided'}</dd>
                    <dt>Cover letter</dt><dd className="prose">{a.coverLetter || 'Not provided'}</dd>
                    <dt>Resume</dt><dd>{a.resumeUrl ? <a href={a.resumeUrl} target="_blank" rel="noreferrer">Open resume</a> : 'Not provided'}</dd>
                  </dl>
                )}
              </article>
            ))}</div>
          )}
        </>
      )}
    </div>
  );
}
