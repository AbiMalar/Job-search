import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg, fieldErrors } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { Alert } from '../components/Feedback.jsx';

export default function Register() {
  const { login, home } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ fullName: '', email: '', password: '', confirm: '', role: 'JOB_SEEKER', company: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const validate = () => {
    const x = {};
    if (!f.fullName.trim()) x.fullName = 'Full name is required';
    if (!f.email.trim()) x.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = 'Enter a valid email';
    if (f.password.length < 8) x.password = 'Password must be at least 8 characters';
    if (f.confirm !== f.password) x.confirm = 'Passwords do not match';
    if (f.role === 'EMPLOYER' && !f.company.trim()) x.company = 'Company name is required for employers';
    return x;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const x = validate();
    setErrors(x);
    if (Object.keys(x).length) return;
    setBusy(true);
    try {
      const { data } = await api.post('/auth/register', { fullName: f.fullName, email: f.email, password: f.password, role: f.role, company: f.company });
      login(data);
      nav(home(data), { replace: true });
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="wrap auth">
      <form className="card form" onSubmit={submit} noValidate>
        <h1>Create your account</h1>
        <Alert>{error}</Alert>
        <div className="seg" role="radiogroup" aria-label="I am a">
          {[['JOB_SEEKER', 'Job Seeker'], ['EMPLOYER', 'Employer']].map(([v, l]) => (
            <button type="button" key={v} className={f.role === v ? 'on' : ''} onClick={() => setF({ ...f, role: v })} role="radio" aria-checked={f.role === v}>{l}</button>
          ))}
        </div>
        <Field label="Full name" error={errors.fullName}><input value={f.fullName} onChange={set('fullName')} autoComplete="name" /></Field>
        <Field label="Email" error={errors.email}><input type="email" value={f.email} onChange={set('email')} autoComplete="email" /></Field>
        {f.role === 'EMPLOYER' && <Field label="Company name" error={errors.company}><input value={f.company} onChange={set('company')} /></Field>}
        <Field label="Password" error={errors.password}><input type="password" value={f.password} onChange={set('password')} autoComplete="new-password" /></Field>
        <Field label="Confirm password" error={errors.confirm}><input type="password" value={f.confirm} onChange={set('confirm')} autoComplete="new-password" /></Field>
        <button className="btn btn-lg" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
        <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className={`field ${error ? 'bad' : ''}`}>
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}
