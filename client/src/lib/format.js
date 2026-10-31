const dateFmt = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'Asia/Kolkata',
});

export function formatEventDate(iso) {
  return dateFmt.format(new Date(iso));
}

export function seatsLeft(event) {
  return Math.max(0, event.capacity - event.registeredCount);
}

export function seatsLabel(event) {
  const left = seatsLeft(event);
  if (left === 0) return 'Full';
  if (left <= 10) return `Only ${left} seats left`;
  return `${left} seats left`;
}
