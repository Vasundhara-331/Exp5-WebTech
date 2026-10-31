const PHOTOS = [
  { file: 'hackathon', caption: 'CodeSprint 2025: 3 a.m. and still shipping' },
  { file: 'robowars', caption: 'RoboWars semi-final in the arena' },
  { file: 'workshop', caption: 'Cloud deployment workshop, Lab Block 2' },
  { file: 'keynote', caption: 'Keynote crowd in the Main Auditorium' },
  { file: 'esports', caption: 'Esports finals on the big screen' },
  { file: 'band', caption: 'Battle of Bands closing night' },
  { file: 'ctf', caption: 'Capture The Flag scoreboard' },
  { file: 'expo', caption: 'Project expo walkthrough' },
  { file: 'crowd', caption: 'Opening ceremony' },
];

export default function Gallery() {
  return (
    <section className="container page">
      <h1>Gallery</h1>
      <p className="muted">Moments from TechFest 2025.</p>
      <div className="gallery">
        {PHOTOS.map((p, i) => {
          // The first row is visible immediately (the LCP image), so fetch it eagerly and first.
          // Everything below the fold is only downloaded when the user scrolls near it.
          const aboveFold = i < 3;
          return (
            <figure key={p.file}>
              <img
                src={`/gallery/${p.file}.svg`}
                alt={p.caption}
                width="800"
                height="600"
                loading={aboveFold ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                decoding="async"
              />
              <figcaption>{p.caption}</figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
