import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateRegister } from '../lib/validation';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', college: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const errs = validateRegister(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setError(null);
    try {
      await register(form);
      navigate('/events', { replace: true });
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
      <h1>Create your account</h1>
      <form className="card form" onSubmit={submit} noValidate>
        <label htmlFor="name">Full name</label>
        <input autoComplete="name" {...field('name')} />
        {errors.name && <p className="field-error">{errors.name}</p>}
        <label htmlFor="email">Email</label>
        <input type="email" autoComplete="email" {...field('email')} />
        {errors.email && <p className="field-error">{errors.email}</p>}
        <label htmlFor="college">College (optional)</label>
        <input autoComplete="organization" {...field('college')} />
        <label htmlFor="password">Password</label>
        <input type="password" autoComplete="new-password" {...field('password')} />
        <p className="hint">At least 8 characters, with a letter and a number.</p>
        {errors.password && <p className="field-error">{errors.password}</p>}
        {error && <p className="alert alert-error">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Creating account...' : 'Register'}
        </button>
        <p className="muted">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  );
}
