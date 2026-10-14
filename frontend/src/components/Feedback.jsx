import { Loader2 } from 'lucide-react';

export const Spinner = ({ text = 'Loading…' }) => (
  <div className="center muted" role="status"><Loader2 className="spin" size={20} /> {text}</div>
);

export const Alert = ({ type = 'error', children }) =>
  children ? <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>{children}</div> : null;
