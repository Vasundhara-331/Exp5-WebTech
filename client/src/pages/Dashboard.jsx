import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/registrations/me')
      .then((d) => setEvents(d.events))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <section className="container page">
      <h1>Hi, {user.name.split(' ')[0]}</h1>
      <p className="muted">
        {user.email}
        {user.college ? ` · ${user.college}` : ''}
      </p>
      <h2>Your registrations</h2>
      {error && <p className="alert alert-error">{error}</p>}
      {events === null && !error && <p className="muted">Loading...</p>}
      {events?.length === 0 && (
        <p className="card">
          You haven&apos;t registered for anything yet. <Link to="/events">Browse events</Link>
        </p>
      )}
      <div className="grid grid-2">
        {events?.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </section>
  );
}
