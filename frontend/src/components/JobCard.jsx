import { Link } from 'react-router-dom';
import { MapPin, Clock, IndianRupee, CalendarDays } from 'lucide-react';
import { salary, fmtDate, isClosed } from '../utils.js';

export default function JobCard({ job }) {
  return (
    <article className="card job">
      <div className="job-head">
        <div className="avatar">{job.company.charAt(0)}</div>
        <div>
          <h3><Link to={`/jobs/${job.id}`}>{job.title}</Link></h3>
          <p className="muted">{job.company}</p>
        </div>
        {isClosed(job) && <span className="badge st-REJECTED">Closed</span>}
      </div>
      <ul className="meta">
        <li><MapPin size={15} /> {job.location}</li>
        <li><Clock size={15} /> {job.type} · {job.experience}</li>
        <li><IndianRupee size={15} /> {salary(job)}</li>
        <li><CalendarDays size={15} /> Apply by {fmtDate(job.deadline)}</li>
      </ul>
      <div className="chips">{job.skills.slice(0, 4).map((s) => <span key={s} className="chip">{s}</span>)}</div>
    </article>
  );
}
