import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateLogin } from '../lib/validation';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const errs = validateLogin(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setError(null);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const field = (name) => ({
    id: name,
    name,
    value: form[name],
    onChange: (e) => setForm({ ...form, [name]: e.target.value }),
    'aria-invalid': !!errors[name],
  });

  return (
    <section className="container page narrow">
      <h1>Log in</h1>
      <form className="card form" onSubmit={submit} noValidate>
        <label htmlFor="email">Email</label>
        <input type="email" autoComplete="email" {...field('email')} />
        {errors.email && <p className="field-error">{errors.email}</p>}
        <label htmlFor="password">Password</label>
        <input type="password" autoComplete="current-password" {...field('password')} />
        {errors.password && <p className="field-error">{errors.password}</p>}
        {error && <p className="alert alert-error">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Logging in...' : 'Log in'}
        </button>
        <p className="muted">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </section>
  );
}
