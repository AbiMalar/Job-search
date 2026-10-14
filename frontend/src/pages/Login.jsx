import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { Alert } from '../components/Feedback.jsx';
import { Field } from './Register.jsx';

export default function Login() {
  const { login, home } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [f, setF] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const x = {};
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = 'Enter a valid email';
    if (!f.password) x.password = 'Password is required';
    setErrors(x);
    if (Object.keys(x).length) return;
    setBusy(true);
    try {
      const { data } = await api.post('/auth/login', f);
      login(data);
      const target = home(data); // redirect by role
      const from = loc.state?.from;
      nav(from && from.startsWith(target) ? from : target, { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="wrap auth">
      <form className="card form" onSubmit={submit} noValidate>
        <h1>Welcome back</h1>
        <Alert>{error}</Alert>
        <Field label="Email" error={errors.email}><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></Field>
        <Field label="Password" error={errors.password}><input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" /></Field>
        <button className="btn btn-lg" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <p className="muted">New here? <Link to="/register">Create an account</Link></p>
        <p className="hint">Demo: seeker@demo.com / Seeker@123 · employer@demo.com / Employer@123</p>
      </form>
    </div>
  );
}
