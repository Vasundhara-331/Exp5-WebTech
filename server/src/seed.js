const Event = require('./models/Event');

const EVENTS = [
  {
    title: 'CodeSprint 24h Hackathon',
    slug: 'codesprint-hackathon',
    category: 'Technical',
    description: 'Build a working product in 24 hours with a team of up to four. Mentors on site, prizes for the top three teams.',
    date: '2026-12-11T09:00:00+05:30',
    venue: 'Main Auditorium',
    capacity: 120,
  },
  {
    title: 'Hands-on MERN Deployment Workshop',
    slug: 'mern-workshop',
    category: 'Workshop',
    description: 'Take a React + Express + MongoDB app from your laptop to a live HTTPS URL using GitHub, Render and Netlify.',
    date: '2026-12-11T14:00:00+05:30',
    venue: 'Lab Block 2',
    capacity: 60,
  },
  {
    title: 'Capture The Flag',
    slug: 'capture-the-flag',
    category: 'Technical',
    description: 'Jeopardy-style security challenges: web, crypto, forensics and reverse engineering. Solo or pairs.',
    date: '2026-12-12T10:00:00+05:30',
    venue: 'Cyber Security Lab',
    capacity: 80,
  },
  {
    title: 'RoboWars Arena',
    slug: 'robowars',
    category: 'Technical',
    description: 'Bring your 8 kg combat robot and battle it out in the arena. Safety inspection before every bout.',
    date: '2026-12-12T15:00:00+05:30',
    venue: 'Open Air Theatre',
    capacity: 32,
  },
  {
    title: 'Valorant Campus Cup',
    slug: 'valorant-cup',
    category: 'Gaming',
    description: '5v5 knockout tournament streamed live on the big screen. Teams must register all five players.',
    date: '2026-12-12T18:00:00+05:30',
    venue: 'Esports Room',
    capacity: 40,
  },
  {
    title: 'AI in 2030: Keynote',
    slug: 'ai-keynote',
    category: 'Talk',
    description: 'Where large language models, robotics and edge AI are heading, followed by an open Q&A.',
    date: '2026-12-13T11:00:00+05:30',
    venue: 'Main Auditorium',
    capacity: 300,
  },
  {
    title: 'Battle of Bands',
    slug: 'battle-of-bands',
    category: 'Cultural',
    description: 'College bands compete for the TechFest trophy. 15-minute sets, judged by guest musicians.',
    date: '2026-12-13T19:00:00+05:30',
    venue: 'Open Air Theatre',
    capacity: 500,
  },
];

async function seedEvents() {
  if ((await Event.estimatedDocumentCount()) > 0) return 0;
  await Event.insertMany(EVENTS);
  return EVENTS.length;
}

module.exports = { seedEvents, EVENTS };
