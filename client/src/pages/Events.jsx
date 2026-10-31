import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';

const CATEGORIES = ['All', 'Technical', 'Workshop', 'Talk', 'Gaming', 'Cultural'];

export default function Events() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState('All');
  const [events, setEvents] = useState([]);
  const [mine, setMine] = useState(new Set());
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const qs = category === 'All' ? '' : `?category=${encodeURIComponent(category)}`;
    setStatus('loading');
    api(`/events${qs}`)
      .then((d) => {
        setEvents(d.events);
        setStatus('ready');
      })
      .catch((e) => {
        setMessage({ type: 'error', text: e.message });
        setStatus('error');
      });
  }, [category]);

  useEffect(() => {
    if (!user) return setMine(new Set());
    api('/registrations/me')
      .then((d) => setMine(new Set(d.events.map((e) => e.id))))
      .catch(() => {});
  }, [user]);

  const replace = (updated) => setEvents((list) => list.map((e) => (e.id === updated.id ? updated : e)));

  async function register(event) {
    if (!user) return navigate('/login', { state: { from: '/events' } });
    setBusyId(event.id);
    setMessage(null);
    try {
      const d = await api(`/events/${event.id}/register`, { method: 'POST' });
      replace(d.event);
      setMine((s) => new Set(s).add(event.id));
      setMessage({ type: 'success', text: `You're registered for ${event.title}.` });
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setBusyId(null);
    }
  }

  async function cancel(event) {
    setBusyId(event.id);
    setMessage(null);
    try {
      const d = await api(`/events/${event.id}/register`, { method: 'DELETE' });
      replace(d.event);
      setMine((s) => {
        const next = new Set(s);
        next.delete(event.id);
        return next;
      });
      setMessage({ type: 'success', text: `Registration for ${event.title} cancelled.` });
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="container page">
      <h1>Events</h1>
      <p className="muted">Pick an event and grab a seat. Registration needs a free account.</p>
      <div className="chips" role="group" aria-label="Filter by category">
        {CATEGORIES.map((c) => (
          <button key={c} className={c === category ? 'chip active' : 'chip'} aria-pressed={c === category} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>
      {message && (
        <p className={`alert alert-${message.type}`} role="status">
          {message.text}
        </p>
      )}
      {status === 'loading' && <p className="muted">Loading events...</p>}
      {status === 'ready' && events.length === 0 && <p className="muted">No events in this category yet.</p>}
      <div className="grid grid-2">
        {events.map((e) => (
          <EventCard
            key={e.id}
            event={e}
            registered={mine.has(e.id)}
            busy={busyId === e.id}
            onRegister={register}
            onCancel={cancel}
          />
        ))}
      </div>
    </section>
  );
}
