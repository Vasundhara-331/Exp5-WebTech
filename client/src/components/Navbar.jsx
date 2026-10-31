import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/events', label: 'Events' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/feedback', label: 'Feedback' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setOpen(false);

  async function handleLogout() {
    await logout();
    close();
    navigate('/');
  }

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark" aria-hidden="true">TF</span>
          TechFest <span className="accent">2026</span>
        </Link>
        <button
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label="Toggle navigation"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav id="nav-menu" className={open ? 'nav-links open' : 'nav-links'}>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={close}>
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink to="/dashboard" onClick={close}>
                My events
              </NavLink>
              <button className="btn btn-ghost" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>
                Log in
              </NavLink>
              <Link to="/register" className="btn btn-primary" onClick={close}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
