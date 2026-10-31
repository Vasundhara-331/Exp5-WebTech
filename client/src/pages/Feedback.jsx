import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { validateFeedback } from '../lib/validation';

export default function Feedback() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ message: '', rating: 5 });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api('/feedback')
      .then((d) => setItems(d.feedback))
      .catch(() => {});
  }, []);

  async function submit(e) {
    e.preventDefault();
    const errs = validateFeedback(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      const d = await api('/feedback', { method: 'POST', body: form });
      setItems((list) => [d.feedback, ...list]);
      setForm({ message: '', rating: 5 });
      setStatus({ type: 'success', text: 'Thanks for your feedback!' });
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    }
  }

  return (
    <section className="container page narrow">
      <h1>Feedback</h1>
      <p className="muted">Tell us what you liked and what we should fix next year.</p>

      {user ? (
        <form className="card form" onSubmit={submit} noValidate>
          <label htmlFor="message">Your feedback</label>
          <textarea
            id="message"
            rows={4}
            maxLength={500}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            aria-invalid={!!errors.message}
          />
          {errors.message && <p className="field-error">{errors.message}</p>}
          <label htmlFor="rating">Rating</label>
          <select id="rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {'★'.repeat(n)} ({n})
              </option>
            ))}
          </select>
          <button className="btn btn-primary">Submit feedback</button>
          {status && <p className={`alert alert-${status.type}`}>{status.text}</p>}
        </form>
      ) : (
        <p className="card">
          <Link to="/login">Log in</Link> to leave feedback.
        </p>
      )}

      <h2>Recent feedback</h2>
      <ul className="feedback-list">
        {items.length === 0 && <li className="muted">No feedback yet. Be the first!</li>}
        {items.map((f) => (
          <li key={f.id} className="card">
            <div className="feedback-head">
              <strong>{f.name}</strong>
              <span className="stars" aria-label={`${f.rating} out of 5`}>
                {'★'.repeat(f.rating)}
              </span>
            </div>
            {/* XSS fix: rendered as a text node, so "<script>" shows as text and never runs.
                Never use dangerouslySetInnerHTML for user input. */}
            <p>{f.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
