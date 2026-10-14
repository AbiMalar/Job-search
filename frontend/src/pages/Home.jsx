import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Code2, BarChart3, Cloud, ShieldCheck, Palette, Megaphone, Briefcase } from 'lucide-react';
import api, { errMsg } from '../api.js';
import JobCard from '../components/JobCard.jsx';
import { Alert, Spinner } from '../components/Feedback.jsx';

const ICONS = { 'Software Development': Code2, 'Data & Analytics': BarChart3, 'DevOps & Cloud': Cloud, 'Quality Assurance': ShieldCheck, Design: Palette, Marketing: Megaphone };

export default function Home() {
  const nav = useNavigate();
  const [q, setQ] = useState({ q: '', skills: '', location: '' });
  const [jobs, setJobs] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/jobs', { params: { limit: 6 } }), api.get('/jobs/categories')])
      .then(([j, c]) => { setJobs(j.data); setCats(c.data); })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => v.trim() && p.set(k, v.trim()));
    nav(`/jobs?${p}`);
  };

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>Find Your Dream Job</h1>
          <p>Search openings from employers hiring now, apply in minutes and follow every application in one place.</p>
          <form className="searchbar" onSubmit={submit}>
            <label><span>Job title</span><input value={q.q} onChange={(e) => setQ({ ...q, q: e.target.value })} placeholder="e.g. Java Developer" /></label>
            <label><span>Skills</span><input value={q.skills} onChange={(e) => setQ({ ...q, skills: e.target.value })} placeholder="e.g. React, SQL" /></label>
            <label><span>Location</span><input value={q.location} onChange={(e) => setQ({ ...q, location: e.target.value })} placeholder="e.g. Chennai" /></label>
            <button className="btn btn-lg"><Search size={18} /> Search jobs</button>
          </form>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head"><h2>Featured jobs</h2><Link to="/jobs">See all jobs</Link></div>
        <Alert>{error}</Alert>
        {loading ? <Spinner /> : jobs.length === 0 ? <div className="empty">No jobs posted yet.</div> : <div className="grid">{jobs.map((j) => <JobCard key={j.id} job={j} />)}</div>}
      </section>

      <section className="wrap section">
        <h2>Popular categories</h2>
        <div className="cats">
          {cats.map((c) => {
            const Icon = ICONS[c.name] || Briefcase;
            return (
              <Link key={c.name} to={`/jobs?category=${encodeURIComponent(c.name)}`} className="cat">
                <Icon size={22} /><strong>{c.name}</strong><span className="muted">{c.count} open {c.count === 1 ? 'job' : 'jobs'}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
