import { useEffect, useState } from 'react';
import { api } from '../api/client';

const dayFmt = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' });
const timeFmt = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' });

export default function Schedule() {
  const [days, setDays] = useState(null);

  useEffect(() => {
    api('/events')
      .then((d) => {
        const grouped = new Map();
        for (const e of d.events) {
          const day = dayFmt.format(new Date(e.date));
          if (!grouped.has(day)) grouped.set(day, []);
          grouped.get(day).push(e);
        }
        setDays([...grouped]);
      })
      .catch(() => setDays([]));
  }, []);

  return (
    <section className="container page narrow">
      <h1>Schedule</h1>
      {days === null && <p className="muted">Loading schedule...</p>}
      {days?.map(([day, events]) => (
        <div key={day} className="schedule-day">
          <h2>{day}</h2>
          <ol className="schedule">
            {events.map((e) => (
              <li key={e.id}>
                <time dateTime={e.date}>{timeFmt.format(new Date(e.date))}</time>
                <div>
                  <strong>{e.title}</strong>
                  <span className="muted"> · {e.venue}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  );
}
