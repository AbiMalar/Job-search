import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Briefcase, Menu, X } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';

export default function Navbar() {
  const { user, logout, home } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const close = () => setOpen(false);

  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Link to="/" className="logo" onClick={close}><Briefcase size={22} /> HireLane</Link>
        <button className="icon-btn menu" aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <nav className={`links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>Home</NavLink>
          <NavLink to="/jobs" onClick={close}>Find Jobs</NavLink>
          {user ? (
            <>
              <NavLink to={home()} onClick={close}>Dashboard</NavLink>
              <button className="btn btn-ghost" onClick={() => { logout(); close(); nav('/'); }}>Log out ({user.fullName.split(' ')[0]})</button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>Login</NavLink>
              <Link to="/register" className="btn" onClick={close}>Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
