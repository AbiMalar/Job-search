import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import api, { errMsg } from '../api.js';
import JobCard from '../components/JobCard.jsx';
import { Alert, Spinner } from '../components/Feedback.jsx';
import { CATEGORIES, TYPES, LEVELS } from '../utils.js';

const KEYS = ['q', 'skills', 'location', 'category', 'type', 'experience', 'minSalary'];

export default function Jobs() {
  const [params, setParams] = useSearchParams();
  const initial = Object.fromEntries(KEYS.map((k) => [k, params.get(k) || '']));
  const [draft, setDraft] = useState(initial);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const query = params.toString();

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/jobs', { params: Object.fromEntries(params) })
      .then((r) => setJobs(r.data))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
    setDraft(Object.fromEntries(KEYS.map((k) => [k, params.get(k) || ''])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const apply = (next = draft) => {
    const p = {};
    KEYS.forEach((k) => String(next[k]).trim() && (p[k] = String(next[k]).trim()));
    setParams(p);
  };
  const pick = (k) => (e) => { const next = { ...draft, [k]: e.target.value }; setDraft(next); apply(next); };
  const text = (k) => (e) => setDraft({ ...draft, [k]: e.target.value });

  return (
    <div className="wrap section">
      <h1>Find jobs</h1>
      <form className="toolbar" onSubmit={(e) => { e.preventDefault(); apply(); }}>
        <input placeholder="Job title or company" value={draft.q} onChange={text('q')} aria-label="Job title or company" />
        <input placeholder="Skills (comma separated)" value={draft.skills} onChange={text('skills')} aria-label="Skills" />
        <input placeholder="Location" value={draft.location} onChange={text('location')} aria-label="Location" />
        <button className="btn"><Search size={16} /> Search</button>
      </form>
      <div className="filters">
        <select value={draft.category} onChange={pick('category')} aria-label="Category"><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        <select value={draft.type} onChange={pick('type')} aria-label="Job type"><option value="">Any job type</option>{TYPES.map((c) => <option key={c}>{c}</option>)}</select>
        <select value={draft.experience} onChange={pick('experience')} aria-label="Experience"><option value="">Any experience</option>{LEVELS.map((c) => <option key={c}>{c}</option>)}</select>
        <select value={draft.minSalary} onChange={pick('minSalary')} aria-label="Minimum salary">
          <option value="">Any salary</option>{[5, 10, 15, 20].map((s) => <option key={s} value={s}>₹{s}+ LPA</option>)}
        </select>
        {query && <button className="btn btn-ghost" onClick={() => { setDraft(Object.fromEntries(KEYS.map((k) => [k, '']))); setParams({}); }}>Clear filters</button>}
      </div>
      <Alert>{error}</Alert>
      {loading ? <Spinner /> : jobs.length === 0
        ? <div className="empty">No jobs match these filters. Try fewer filters or a broader location.</div>
        : <><p className="muted">{jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found</p><div className="grid">{jobs.map((j) => <JobCard key={j.id} job={j} />)}</div></>}
    </div>
  );
}
