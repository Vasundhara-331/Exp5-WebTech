import { Link } from 'react-router-dom';

const HIGHLIGHTS = [
  { value: '3', label: 'days' },
  { value: '7+', label: 'events' },
  { value: '1,200', label: 'seats' },
  { value: '₹2L', label: 'in prizes' },
];

const TRACKS = [
  { title: 'Build', text: 'A 24-hour hackathon, Capture The Flag and RoboWars for people who like to ship.' },
  { title: 'Learn', text: 'Hands-on workshops and a keynote on where AI is heading by 2030.' },
  { title: 'Play', text: 'An esports cup and Battle of Bands to close each night.' },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <p className="eyebrow">11-13 December 2026</p>
          <h1>
            Three days to build, break <span className="accent">and celebrate</span> tech.
          </h1>
          <p className="lead">
            Hackathons, workshops, robotics, gaming and music with 2,000+ students from 40 colleges. One pass, one portal.
          </p>
          <div className="hero-actions">
            <Link to="/events" className="btn btn-primary btn-lg">
              Browse events
            </Link>
            <Link to="/register" className="btn btn-ghost btn-lg">
              Create an account
            </Link>
          </div>
          <ul className="stats">
            {HIGHLIGHTS.map((h) => (
              <li key={h.label}>
                <strong>{h.value}</strong>
                <span>{h.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="container page">
        <h2>What&apos;s on</h2>
        <div className="grid grid-3">
          {TRACKS.map((t) => (
            <article key={t.title} className="card">
              <h3>{t.title}</h3>
              <p className="muted">{t.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
