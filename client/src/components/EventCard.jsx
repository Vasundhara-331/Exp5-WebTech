import { formatEventDate, seatsLabel, seatsLeft } from '../lib/format';

export default function EventCard({ event, registered, busy, onRegister, onCancel }) {
  const full = seatsLeft(event) === 0;
  return (
    <article className="card event-card">
      <div className="event-top">
        <span className={`tag tag-${event.category.toLowerCase()}`}>{event.category}</span>
        <span className={full ? 'seats full' : 'seats'}>{seatsLabel(event)}</span>
      </div>
      <h3>{event.title}</h3>
      <p className="muted">{event.description}</p>
      <dl className="event-meta">
        <div>
          <dt>When</dt>
          <dd>{formatEventDate(event.date)}</dd>
        </div>
        <div>
          <dt>Where</dt>
          <dd>{event.venue}</dd>
        </div>
      </dl>
      {onRegister &&
        (registered ? (
          <button className="btn btn-ghost" disabled={busy} onClick={() => onCancel(event)}>
            {busy ? 'Working...' : 'Cancel registration'}
          </button>
        ) : (
          <button className="btn btn-primary" disabled={busy || full} onClick={() => onRegister(event)}>
            {busy ? 'Working...' : full ? 'Event full' : 'Register'}
          </button>
        ))}
    </article>
  );
}
